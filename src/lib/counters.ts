import analyticsData from '~/generated/counters-analytics.json';
import countersData from '~/generated/counters.json';
import type {
  AnalyticsCounterEntry,
  AnalyticsCountersFile,
  CounterEntry,
  CountersData,
} from '~/lib/types';

/**
 * Slugs that appear in both heroes' counter lists, computed per section
 * independently. Cross-type matches (curated for hero A, analytics for hero B)
 * are NOT included — only the same-source intersection counts.
 */
export interface SharedItems {
  readonly curated: ReadonlySet<string>;
  readonly analytics: ReadonlySet<string>;
}

/** Typed accessor for the curated counters JSON. */
const curatedSource = countersData as CountersData;

/** Typed accessor for the analytics counters JSON. */
const analyticsSource: AnalyticsCountersFile = analyticsData as AnalyticsCountersFile;

/**
 * Curated counter items for a hero (counter item slugs + curated metadata).
 * Returns an empty array if the hero has no curated data.
 */
export function getCuratedItems(className: string): readonly CounterEntry[] {
  return curatedSource[className]?.itemCounters ?? [];
}

/**
 * Analytics counter items for a hero (counter item slugs + win-rate deltas).
 * Returns an empty array if the hero has no analytics data.
 */
export function getAnalyticsItems(className: string): readonly AnalyticsCounterEntry[] {
  return analyticsSource.heroes[className]?.counters ?? [];
}

/** Convert an iterable of slugs to a Set, filtering out non-string entries. */
function toSlugSet(items: Iterable<unknown>): Set<string> {
  const out = new Set<string>();
  for (const item of items) {
    if (typeof item === 'string') out.add(item);
  }
  return out;
}

/**
 * Compute the intersection of counter item slugs between two heroes,
 * independently per section (curated vs analytics). A slug must appear in the
 * same section of BOTH heroes' counter lists to be considered shared.
 */
export function computeSharedItems(hero1Class: string, hero2Class: string): SharedItems {
  return {
    curated: toSlugSet(
      getCuratedItems(hero1Class)
        .map((e) => e.item)
        .filter((item) => getCuratedItems(hero2Class).some((other) => other.item === item)),
    ),
    analytics: toSlugSet(
      getAnalyticsItems(hero1Class)
        .map((e) => e.item)
        .filter((item) => getAnalyticsItems(hero2Class).some((other) => other.item === item)),
    ),
  };
}

/** Format a win-rate delta (0.042 → "+4.2pp", -0.015 → "−1.5pp", 0 → "0.0pp"). */
export function formatDelta(d: number): string {
  const pp = Math.round(d * 1000) / 10;
  if (pp === 0) return '0.0pp';
  const sign = pp > 0 ? '+' : '−';
  return `${sign}${Math.abs(pp).toFixed(1)}pp`;
}

/** Compact sample-size formatter (1_500_000 → "1.5M", 52_174 → "52K", 999 → "999"). */
export function formatSampleSize(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

/** Bucket a delta into a UI trend. Threshold of ±0.01 covers the neutral band. */
export function trendFor(d: number): 'positive' | 'negative' | 'neutral' {
  if (d > 0.01) return 'positive';
  if (d < -0.01) return 'negative';
  return 'neutral';
}
