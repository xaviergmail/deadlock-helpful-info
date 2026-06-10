export interface HeroImages {
  icon_image_small: string;
  icon_image_small_webp: string;
  icon_hero_card: string;
  icon_hero_card_webp: string;
}

export interface Hero {
  id: number;
  name: string;
  class_name: string;
  images: HeroImages;
}

/** Counter data schema version. v1 = hero→item only. Future v2 generalizes target. */
export type CounterSchemaVersion = 1;

/** One counter entry: "buy this item to counter that hero". */
export interface CounterEntry {
  /** Item slug, e.g. "decay", "metal_skin". MUST match an item in the Deadlock API. */
  item: string;
  /** Confidence in this recommendation. */
  confidence: 'high' | 'medium' | 'low';
  /** Human-readable reason; shown in tooltip. */
  reason: string;
  /** Patch date this entry was last reviewed, ISO YYYY-MM-DD. */
  lastReviewedPatch: string;
}

/** All counters for one hero. */
export interface HeroCounters {
  schemaVersion: CounterSchemaVersion;
  /** Hero slug (matches `class_name` in heroes.json, WITH the "hero_" prefix). */
  hero: string;
  /** Items that counter this hero, in display order (top 3 shown by default). */
  itemCounters: CounterEntry[];
}

/** Generated runtime data: { [heroClassName]: HeroCounters }. heroClassName includes "hero_" prefix. */
export type CountersData = Record<string, HeroCounters>;

export interface CuratedCounterEntry {
  readonly source: 'curated';
  readonly item: string;
  readonly confidence: 'high' | 'medium' | 'low';
  readonly reason: string;
  readonly lastReviewedPatch: string;
}

export interface AnalyticsCounterEntry {
  readonly source: 'analytics';
  readonly item: string;
  readonly winRateDelta: number;
  readonly sampleSize: number;
  readonly reason: string;
  readonly generatedAt: string;
}

export type CounterEntryUnion = CuratedCounterEntry | AnalyticsCounterEntry;

export function isCurated(e: CounterEntryUnion): e is CuratedCounterEntry {
  return e.source === 'curated';
}

export function isAnalytics(e: CounterEntryUnion): e is AnalyticsCounterEntry {
  return e.source === 'analytics';
}

export interface AnalyticsHeroData {
  readonly heroId: number;
  readonly status: 'ok' | 'empty' | 'api_error' | 'stale_preserved';
  readonly refreshedAt: string | null;
  readonly counters: readonly AnalyticsCounterEntry[];
}

export interface AnalyticsCountersFile {
  readonly schemaVersion: 2;
  readonly generatedAt: string;
  readonly config: {
    readonly minAverageBadge: number;
    readonly minMatchesPlayed: number;
    readonly minWinRateDelta: number;
  };
  readonly heroes: Readonly<Record<string, AnalyticsHeroData>>;
}
