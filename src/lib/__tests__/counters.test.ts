import { describe, expect, it } from 'vitest';
import analyticsData from '~/generated/counters-analytics.json';
import countersData from '~/generated/counters.json';
import {
  computeSharedItems,
  formatDelta,
  formatSampleSize,
  getAnalyticsItems,
  getCuratedItems,
  trendFor,
} from '~/lib/counters';

// Hero pair chosen for the no-overlap (curated) and partial-overlap (analytics)
// assertions. Real data:
//   curated  hero_astro ∩ hero_atlas = []
//   analytics hero_astro ∩ hero_atlas = ['upgrade_weapon_shielding']
const H1 = 'hero_astro';
const H2 = 'hero_atlas';

// A curated hero + an analytics hero whose items only intersect in curated.
const H3 = 'hero_bebop'; // no shared curated with H1, may share analytics

describe('computeSharedItems', () => {
  it('returns empty curated set and partial analytics overlap for hero_astro vs hero_atlas', () => {
    const shared = computeSharedItems(H1, H2);
    // Sanity-check inputs against the real generated data.
    expect(getCuratedItems(H1).length).toBeGreaterThan(0);
    expect(getCuratedItems(H2).length).toBeGreaterThan(0);
    expect(getAnalyticsItems(H1).length).toBeGreaterThan(0);
    expect(getAnalyticsItems(H2).length).toBeGreaterThan(0);

    // Curated: no overlap in real data.
    expect(shared.curated.size).toBe(0);

    // Analytics: exactly the known shared slug.
    expect(shared.analytics.size).toBe(1);
    expect(shared.analytics.has('upgrade_weapon_shielding')).toBe(true);
  });

  it('returns fully overlapping sets when both heroes have identical curated/analytics data', () => {
    const h = H1;
    const shared = computeSharedItems(h, h);
    const curatedCount = getCuratedItems(h).length;
    const analyticsCount = getAnalyticsItems(h).length;
    expect(shared.curated.size).toBe(curatedCount);
    expect(shared.analytics.size).toBe(analyticsCount);
    for (const entry of getCuratedItems(h)) {
      expect(shared.curated.has(entry.item)).toBe(true);
    }
    for (const entry of getAnalyticsItems(h)) {
      expect(shared.analytics.has(entry.item)).toBe(true);
    }
  });

  it('returns empty curated set when one hero has no curated data', () => {
    // Force the "missing curated" branch by using a slug that only exists in
    // analytics, then pair it with itself.
    const ghost = 'hero_does_not_exist';
    const shared = computeSharedItems(ghost, ghost);
    expect(shared.curated.size).toBe(0);
    expect(shared.analytics.size).toBe(0);
  });

  it('returns empty sets when one hero is in curated data only and the other is unknown', () => {
    const shared = computeSharedItems(H1, 'hero_does_not_exist');
    expect(shared.curated.size).toBe(0);
    expect(shared.analytics.size).toBe(0);
  });

  it('does not cross-match curated slugs from hero A with analytics slugs from hero B', () => {
    const shared = computeSharedItems(H1, H2);
    const curatedH1 = new Set(getCuratedItems(H1).map((e) => e.item));
    const analyticsH2 = new Set(getAnalyticsItems(H2).map((e) => e.item));
    // Every curated "shared" item must also appear in hero B's curated list,
    // NOT in hero B's analytics list.
    for (const slug of shared.curated) {
      expect(curatedH1.has(slug)).toBe(true);
      // It must not have leaked in from analytics. If a slug happens to also
      // be in hero B's analytics, it would only be in the analytics set.
      if (analyticsH2.has(slug)) {
        expect(shared.analytics.has(slug)).toBe(true);
      }
    }
    for (const slug of shared.analytics) {
      const analyticsH1 = new Set(getAnalyticsItems(H1).map((e) => e.item));
      expect(analyticsH1.has(slug)).toBe(true);
    }
  });

  it('symmetric: computeSharedItems(A, B) equals computeSharedItems(B, A)', () => {
    const ab = computeSharedItems(H1, H2);
    const ba = computeSharedItems(H2, H1);
    expect([...ab.curated].sort()).toEqual([...ba.curated].sort());
    expect([...ab.analytics].sort()).toEqual([...ba.analytics].sort());
  });
});

describe('getCuratedItems / getAnalyticsItems', () => {
  it('getCuratedItems returns the typed itemCounters array for known heroes', () => {
    const items = getCuratedItems(H1);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]?.item).toBeTypeOf('string');
    expect(items[0]?.confidence).toMatch(/^(high|medium|low)$/);
  });

  it('getCuratedItems returns [] for unknown hero slugs', () => {
    expect(getCuratedItems('hero_does_not_exist')).toEqual([]);
  });

  it('getAnalyticsItems returns the typed counters array for known heroes', () => {
    const items = getAnalyticsItems(H1);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]?.source).toBe('analytics');
    expect(items[0]?.item).toBeTypeOf('string');
    expect(items[0]?.sampleSize).toBeTypeOf('number');
  });

  it('getAnalyticsItems returns [] for unknown hero slugs', () => {
    expect(getAnalyticsItems('hero_does_not_exist')).toEqual([]);
  });

  it('matches the generated JSON files directly', () => {
    // Cross-check: the helpers should expose the same data as the raw JSON.
    const c = countersData as Record<string, { itemCounters: { item: string }[] } | undefined>;
    const a = analyticsData as {
      heroes: Record<string, { counters: { item: string }[] } | undefined>;
    };
    const curatedHero = Object.keys(c)[0];
    if (!curatedHero) throw new Error('no curated data');
    expect(getCuratedItems(curatedHero).map((e) => e.item)).toEqual(
      c[curatedHero]?.itemCounters.map((e) => e.item) ?? [],
    );
    const analyticsHero = Object.keys(a.heroes)[0];
    if (!analyticsHero) throw new Error('no analytics data');
    expect(getAnalyticsItems(analyticsHero).map((e) => e.item)).toEqual(
      a.heroes[analyticsHero]?.counters.map((e) => e.item) ?? [],
    );
  });
});

describe('format helpers', () => {
  it('formatDelta handles positive, negative, and zero', () => {
    expect(formatDelta(0.042)).toBe('+4.2pp');
    expect(formatDelta(-0.015)).toBe('−1.5pp');
    expect(formatDelta(0)).toBe('0.0pp');
  });

  it('formatDelta rounds to one decimal', () => {
    expect(formatDelta(0.0427)).toBe('+4.3pp');
    expect(formatDelta(-0.0154)).toBe('−1.5pp');
  });

  it('formatSampleSize covers K, M, and raw', () => {
    expect(formatSampleSize(999)).toBe('999');
    expect(formatSampleSize(52_174)).toBe('52K');
    expect(formatSampleSize(1_500_000)).toBe('1.5M');
  });

  it('trendFor buckets ±0.01 threshold correctly', () => {
    expect(trendFor(0.05)).toBe('positive');
    expect(trendFor(0.011)).toBe('positive');
    expect(trendFor(0.01)).toBe('neutral');
    expect(trendFor(0)).toBe('neutral');
    expect(trendFor(-0.01)).toBe('neutral');
    expect(trendFor(-0.011)).toBe('negative');
    expect(trendFor(-0.05)).toBe('negative');
  });
});
