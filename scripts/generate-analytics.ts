#!/usr/bin/env -S node --experimental-strip-types

import { readFile, writeFile } from 'node:fs/promises';
import type {
  AnalyticsCounterEntry,
  AnalyticsCountersFile,
  AnalyticsHeroData,
  CountersData,
  Hero,
} from '~/lib/types.ts';

const BASE_URL = 'https://api.deadlock-api.com';
const MIN_AVERAGE_BADGE = 50;
const MIN_MATCHES_PLAYED = 100;
const MAX_ITEMS_PER_HERO = 3;
const OUTPUT_PATH = 'src/generated/counters-analytics.json';

type ApiItem = {
  id: number;
  class_name: string;
};

type ApiItemStat = {
  item_id: number;
  wins: number;
  matches: number;
};

// Step 1: Read heroes list
const heroesRaw = await readFile('src/generated/heroes.json', 'utf-8');
const heroes = JSON.parse(heroesRaw) as Hero[];

// Step 2: Read curated counters and build per-hero exclusion set
const countersRaw = await readFile('src/generated/counters.json', 'utf-8');
const countersData = JSON.parse(countersRaw) as CountersData;
const curatedByHero = new Map<string, Set<string>>();
for (const [heroKey, heroCounters] of Object.entries(countersData)) {
  const itemSet = new Set<string>();
  for (const entry of heroCounters.itemCounters) {
    itemSet.add(entry.item);
  }
  curatedByHero.set(heroKey, itemSet);
}

// Step 3: Load prior analytics file for stale-preservation fallback
let priorFile: AnalyticsCountersFile | null = null;
try {
  const priorRaw = await readFile(OUTPUT_PATH, 'utf-8');
  priorFile = JSON.parse(priorRaw) as AnalyticsCountersFile;
  console.log('Loaded prior analytics file for stale-preservation fallback.');
} catch {
  console.log('No prior analytics file found; will create fresh.');
}

const generatedAt = new Date().toISOString();

function getStaleOrError(hero: Hero, prior: AnalyticsCountersFile | null): AnalyticsHeroData {
  const stale = prior?.heroes[hero.class_name];
  if (stale !== undefined) {
    return {
      heroId: hero.id,
      status: 'stale_preserved',
      refreshedAt: stale.refreshedAt,
      counters: stale.counters,
    };
  }
  return {
    heroId: hero.id,
    status: 'api_error',
    refreshedAt: null,
    counters: [],
  };
}

// Step 4: Fetch item id → class_name map
const itemClassMap = new Map<number, string>();
let globalApiOk = true;

try {
  const itemsRes = await fetch(`${BASE_URL}/v1/assets/items`);
  if (!itemsRes.ok) {
    throw new Error(`Items fetch failed: ${itemsRes.status} ${itemsRes.statusText}`);
  }
  const items = (await itemsRes.json()) as ApiItem[];
  for (const item of items) {
    itemClassMap.set(item.id, item.class_name);
  }
  console.log(`Loaded class names for ${itemClassMap.size} items.`);
} catch (err) {
  console.error('Failed to fetch items:', err);
  globalApiOk = false;
}

// Step 5: Fetch baseline win rates (all heroes combined, no enemy filter)
const baselineWinRates = new Map<number, number>();

if (globalApiOk) {
  try {
    const baselineRes = await fetch(
      `${BASE_URL}/v1/analytics/item-stats?min_average_badge=${MIN_AVERAGE_BADGE}`,
    );
    if (!baselineRes.ok) {
      throw new Error(
        `Baseline stats fetch failed: ${baselineRes.status} ${baselineRes.statusText}`,
      );
    }
    const baselineStats = (await baselineRes.json()) as ApiItemStat[];
    for (const stat of baselineStats) {
      if (stat.matches > 0) {
        baselineWinRates.set(stat.item_id, stat.wins / stat.matches);
      }
    }
    console.log(`Loaded baseline win rates for ${baselineWinRates.size} items.`);
  } catch (err) {
    console.error('Failed to fetch baseline stats:', err);
    globalApiOk = false;
  }
}

// Step 6: Per-hero stats — sequential to avoid rate limiting
const heroResults: Record<string, AnalyticsHeroData> = {};

for (const hero of heroes) {
  const heroKey = hero.class_name;
  const curatedItems = curatedByHero.get(heroKey) ?? new Set<string>();

  if (!globalApiOk) {
    heroResults[heroKey] = getStaleOrError(hero, priorFile);
    continue;
  }

  try {
    const heroRes = await fetch(
      `${BASE_URL}/v1/analytics/item-stats?enemy_hero_ids=${hero.id}&min_average_badge=${MIN_AVERAGE_BADGE}`,
    );
    if (!heroRes.ok) {
      throw new Error(`Hero stats fetch failed: ${heroRes.status} ${heroRes.statusText}`);
    }
    const heroStats = (await heroRes.json()) as ApiItemStat[];

    type Candidate = { className: string; delta: number; sampleSize: number };
    const candidates: Candidate[] = [];

    for (const stat of heroStats) {
      if (stat.matches < MIN_MATCHES_PLAYED) continue;
      const baselineRate = baselineWinRates.get(stat.item_id);
      if (baselineRate === undefined) continue;
      const winRate = stat.wins / stat.matches;
      const delta = winRate - baselineRate;
      const className = itemClassMap.get(stat.item_id);
      if (className === undefined) continue;
      if (curatedItems.has(className)) continue;
      candidates.push({ className, delta, sampleSize: stat.matches });
    }

    candidates.sort((a, b) => b.delta - a.delta);
    const top = candidates.slice(0, MAX_ITEMS_PER_HERO);

    const counters: AnalyticsCounterEntry[] = top.map((c) => {
      // Round to 0.1pp BEFORE picking the sign so a tiny negative never bakes a
      // misleading "−0.0pp" (mirrors formatDelta in HeroCard.tsx).
      const pp = Math.round(c.delta * 1000) / 10;
      const sign = pp > 0 ? '+' : pp < 0 ? '−' : '';
      return {
        source: 'analytics' as const,
        item: c.className,
        winRateDelta: c.delta,
        sampleSize: c.sampleSize,
        reason: `${sign}${Math.abs(pp).toFixed(1)}pp win rate over ${c.sampleSize} matches`,
        generatedAt,
      };
    });

    const status = counters.length > 0 ? 'ok' : 'empty';
    heroResults[heroKey] = {
      heroId: hero.id,
      status,
      refreshedAt: generatedAt,
      counters,
    };

    console.log(`  ${hero.name} (${heroKey}): ${counters.length} counter(s) [${status}]`);
  } catch (err) {
    console.error(`Failed to fetch stats for ${hero.class_name}:`, err);
    heroResults[heroKey] = getStaleOrError(hero, priorFile);
  }
}

// Exit 1 only when every hero failed AND no prior file exists to fall back on
const allFailed = Object.values(heroResults).every((h) => h.status === 'api_error');
if (allFailed && priorFile === null) {
  process.exitCode = 1;
  throw new Error('All hero stats failed and no prior analytics file exists. Output NOT written.');
}

const output: AnalyticsCountersFile = {
  schemaVersion: 1,
  generatedAt,
  config: {
    minAverageBadge: MIN_AVERAGE_BADGE,
    minMatchesPlayed: MIN_MATCHES_PLAYED,
    minWinRateDelta: 0,
  },
  heroes: heroResults,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf-8');

const counts = Object.values(heroResults).reduce(
  (acc, h) => {
    acc[h.status] = (acc[h.status] ?? 0) + 1;
    return acc;
  },
  {} as Record<string, number>,
);

console.log(
  `✓ Wrote ${OUTPUT_PATH} — ok:${counts.ok ?? 0} empty:${counts.empty ?? 0} stale:${counts.stale_preserved ?? 0} error:${counts.api_error ?? 0}`,
);
