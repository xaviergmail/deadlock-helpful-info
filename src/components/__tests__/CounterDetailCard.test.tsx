vi.mock('@deadlock-api/ui-core/loader', () => ({
  defineCustomElements: vi.fn(),
}));

vi.mock('~/generated/counters.json', () => ({
  default: {
    hero_haze: {
      schemaVersion: 1,
      hero: 'hero_haze',
      itemCounters: [
        {
          item: 'upgrade_suppressor',
          confidence: 'medium',
          reason: 'Test',
          lastReviewedPatch: '2026-06-05',
        },
        {
          item: 'upgrade_vex_barrier',
          confidence: 'medium',
          reason: 'Test',
          lastReviewedPatch: '2026-06-05',
        },
        {
          item: 'upgrade_metal_skin',
          confidence: 'medium',
          reason: 'Test',
          lastReviewedPatch: '2026-06-05',
        },
        {
          item: 'upgrade_reduce_debuff_duration',
          confidence: 'medium',
          reason: 'Test',
          lastReviewedPatch: '2026-06-05',
        },
        {
          item: 'upgrade_deflecting_armor',
          confidence: 'medium',
          reason: 'Test',
          lastReviewedPatch: '2026-06-05',
        },
      ],
    },
    hero_shared_a: {
      schemaVersion: 1,
      hero: 'hero_shared_a',
      itemCounters: [
        {
          item: 'upgrade_suppressor',
          confidence: 'medium',
          reason: 'Test',
          lastReviewedPatch: '2026-06-05',
        },
        {
          item: 'upgrade_vex_barrier',
          confidence: 'medium',
          reason: 'Test',
          lastReviewedPatch: '2026-06-05',
        },
      ],
    },
    hero_shared_b: {
      schemaVersion: 1,
      hero: 'hero_shared_b',
      itemCounters: [
        {
          item: 'upgrade_vex_barrier',
          confidence: 'medium',
          reason: 'Test',
          lastReviewedPatch: '2026-06-05',
        },
        {
          item: 'upgrade_metal_skin',
          confidence: 'medium',
          reason: 'Test',
          lastReviewedPatch: '2026-06-05',
        },
      ],
    },
    hero_test_uncurated: {
      schemaVersion: 1,
      hero: 'hero_test_uncurated',
      itemCounters: [],
    },
  },
}));

vi.mock('~/generated/counters-analytics.json', () => ({
  default: {
    schemaVersion: 2,
    generatedAt: '2026-06-05T00:00:00.000Z',
    config: { minAverageBadge: 50, minMatchesPlayed: 100, minWinRateDelta: 0 },
    heroes: {
      hero_haze: {
        heroId: 5,
        status: 'ok',
        refreshedAt: '2026-06-05T00:00:00.000Z',
        counters: [
          {
            source: 'analytics',
            item: 'upgrade_grit',
            winRateDelta: 0.042,
            sampleSize: 1500000,
            reason: 'Test',
            generatedAt: '2026-06-05T00:00:00.000Z',
          },
          {
            source: 'analytics',
            item: 'upgrade_metal_skin',
            winRateDelta: -0.015,
            sampleSize: 52174,
            reason: 'Test',
            generatedAt: '2026-06-05T00:00:00.000Z',
          },
          {
            source: 'analytics',
            item: 'upgrade_combat_barrier',
            winRateDelta: 0.005,
            sampleSize: 999,
            reason: 'Test',
            generatedAt: '2026-06-05T00:00:00.000Z',
          },
        ],
      },
      hero_shared_a: {
        heroId: 9001,
        status: 'ok',
        refreshedAt: '2026-06-05T00:00:00.000Z',
        counters: [
          {
            source: 'analytics',
            item: 'upgrade_grit',
            winRateDelta: 0.03,
            sampleSize: 1000000,
            reason: 'Test',
            generatedAt: '2026-06-05T00:00:00.000Z',
          },
          {
            source: 'analytics',
            item: 'upgrade_metal_skin',
            winRateDelta: 0.02,
            sampleSize: 500000,
            reason: 'Test',
            generatedAt: '2026-06-05T00:00:00.000Z',
          },
        ],
      },
      hero_shared_b: {
        heroId: 9002,
        status: 'ok',
        refreshedAt: '2026-06-05T00:00:00.000Z',
        counters: [
          {
            source: 'analytics',
            item: 'upgrade_metal_skin',
            winRateDelta: 0.025,
            sampleSize: 600000,
            reason: 'Test',
            generatedAt: '2026-06-05T00:00:00.000Z',
          },
          {
            source: 'analytics',
            item: 'upgrade_combat_barrier',
            winRateDelta: -0.01,
            sampleSize: 300000,
            reason: 'Test',
            generatedAt: '2026-06-05T00:00:00.000Z',
          },
        ],
      },
      hero_test_uncurated: {
        heroId: 9999,
        status: 'ok',
        refreshedAt: '2026-06-05T00:00:00.000Z',
        counters: [
          {
            source: 'analytics',
            item: 'upgrade_grit',
            winRateDelta: 0.01,
            sampleSize: 1000,
            reason: 'Test',
            generatedAt: '2026-06-05T00:00:00.000Z',
          },
        ],
      },
    },
  },
}));

import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import type { Hero } from '~/lib/types';
import CounterDetailCard from '../CounterDetailCard';

const heroHaze: Hero = {
  id: 5,
  name: 'Haze',
  class_name: 'hero_haze',
  images: {
    icon_image_small: 'https://example.com/haze-small.png',
    icon_image_small_webp: 'https://example.com/haze-small.webp',
    icon_hero_card: 'https://example.com/haze-card.png',
    icon_hero_card_webp: 'https://example.com/haze-card.webp',
  },
};

const heroSharedA: Hero = {
  id: 9001,
  name: 'Shared A',
  class_name: 'hero_shared_a',
  images: {
    icon_image_small: 'https://example.com/shared-a-small.png',
    icon_image_small_webp: 'https://example.com/shared-a-small.webp',
    icon_hero_card: 'https://example.com/shared-a-card.png',
    icon_hero_card_webp: 'https://example.com/shared-a-card.webp',
  },
};

const heroSharedB: Hero = {
  id: 9002,
  name: 'Shared B',
  class_name: 'hero_shared_b',
  images: {
    icon_image_small: 'https://example.com/shared-b-small.png',
    icon_image_small_webp: 'https://example.com/shared-b-small.webp',
    icon_hero_card: 'https://example.com/shared-b-card.png',
    icon_hero_card_webp: 'https://example.com/shared-b-card.webp',
  },
};

const heroUncurated: Hero = {
  id: 9999,
  name: 'Uncurated',
  class_name: 'hero_test_uncurated',
  images: {
    icon_image_small: 'https://example.com/uncurated-small.png',
    icon_image_small_webp: 'https://example.com/uncurated-small.webp',
    icon_hero_card: 'https://example.com/uncurated-card.png',
    icon_hero_card_webp: 'https://example.com/uncurated-card.webp',
  },
};

describe('CounterDetailCard', () => {
  it('renders placeholder when hero is undefined', () => {
    render(() => (
      <CounterDetailCard
        hero={undefined}
        sharedCuratedItems={new Set()}
        sharedAnalyticsItems={new Set()}
      />
    ));

    const placeholder = document.querySelector('.counter-detail-card__placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(screen.getByText('Select a hero')).toBeInTheDocument();
    expect(document.querySelector('.counter-detail-card__placeholder-icon')).toBeInTheDocument();
  });

  it('renders hero icon and name when hero is defined', () => {
    render(() => (
      <CounterDetailCard
        hero={heroHaze}
        sharedCuratedItems={new Set()}
        sharedAnalyticsItems={new Set()}
      />
    ));

    const img = screen.getByRole('img', { name: 'Haze' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', heroHaze.images.icon_image_small);
    expect(img).toHaveAttribute('width', '48');
    expect(img).toHaveAttribute('height', '48');
    expect(screen.getByText('Haze')).toBeInTheDocument();
  });

  it('renders curated section with ItemCards for hero with curated data', () => {
    render(() => (
      <CounterDetailCard
        hero={heroHaze}
        sharedCuratedItems={new Set()}
        sharedAnalyticsItems={new Set()}
      />
    ));

    expect(document.querySelector('.counter-detail-card__section--curated')).toBeInTheDocument();
    expect(screen.getByText('Curated')).toBeInTheDocument();
    const curatedItems = document.querySelectorAll(
      '.counter-detail-card__section--curated dl-item-card',
    );
    expect(curatedItems.length).toBe(5);
  });

  it('hides curated section when hero has no curated items', () => {
    render(() => (
      <CounterDetailCard
        hero={heroUncurated}
        sharedCuratedItems={new Set()}
        sharedAnalyticsItems={new Set()}
      />
    ));

    expect(
      document.querySelector('.counter-detail-card__section--curated'),
    ).not.toBeInTheDocument();
  });

  it('renders analytics section with ItemCards, deltas, and sample sizes', () => {
    render(() => (
      <CounterDetailCard
        hero={heroHaze}
        sharedCuratedItems={new Set()}
        sharedAnalyticsItems={new Set()}
      />
    ));

    const analyticsSection = document.querySelector('.counter-detail-card__section--analytics');
    expect(analyticsSection).toBeInTheDocument();
    expect(screen.getByText('Item Matchups')).toBeInTheDocument();
    expect(document.querySelector('.counter-detail-card__section-subtitle')?.textContent).toContain(
      'Win-rate delta vs average',
    );

    const analyticsItems = analyticsSection?.querySelectorAll('dl-item-card');
    expect(analyticsItems?.length).toBe(3);

    const deltas = Array.from(document.querySelectorAll('.counter-detail-card__stat-delta')).map(
      (el) => el.textContent,
    );
    expect(deltas).toEqual(['+4.2pp', '−1.5pp', '+0.5pp']);

    const samples = Array.from(document.querySelectorAll('.counter-detail-card__stat-samples')).map(
      (el) => el.textContent,
    );
    expect(samples).toEqual(['1.5M', '52K', '999']);
  });

  it('sets data-trend attribute per delta bucket', () => {
    render(() => (
      <CounterDetailCard
        hero={heroHaze}
        sharedCuratedItems={new Set()}
        sharedAnalyticsItems={new Set()}
      />
    ));

    const trends = Array.from(document.querySelectorAll('.counter-detail-card__stat-item')).map(
      (el) => el.getAttribute('data-trend'),
    );
    expect(trends).toEqual(['positive', 'negative', 'neutral']);
  });

  it('renders shared curated items with highlight class and ×2 badge', () => {
    const sharedCurated = new Set(['upgrade_vex_barrier']);
    render(() => (
      <CounterDetailCard
        hero={heroSharedA}
        sharedCuratedItems={sharedCurated}
        sharedAnalyticsItems={new Set()}
      />
    ));

    const curatedWrappers = document.querySelectorAll(
      '.counter-detail-card__section--curated .counter-detail-card__counter-item',
    );
    expect(curatedWrappers.length).toBe(2);

    const sharedWrapper = curatedWrappers[1]!; // upgrade_vex_barrier is second item
    expect(sharedWrapper.classList.contains('counter-item--shared')).toBe(true);
    expect(sharedWrapper.querySelector('.counter-detail-card__shared-badge')?.textContent).toBe(
      '×2',
    );

    const nonSharedWrapper = curatedWrappers[0]!; // upgrade_suppressor is first item
    expect(nonSharedWrapper.classList.contains('counter-item--shared')).toBe(false);
    expect(
      nonSharedWrapper.querySelector('.counter-detail-card__shared-badge'),
    ).not.toBeInTheDocument();
  });

  it('renders shared analytics items with highlight class and ×2 badge', () => {
    const sharedAnalytics = new Set(['upgrade_metal_skin']);
    render(() => (
      <CounterDetailCard
        hero={heroSharedA}
        sharedCuratedItems={new Set()}
        sharedAnalyticsItems={sharedAnalytics}
      />
    ));

    const statItems = document.querySelectorAll('.counter-detail-card__stat-item');
    expect(statItems.length).toBe(2);

    // hero_shared_a analytics: upgrade_grit (index 0), upgrade_metal_skin (index 1, shared)
    const sharedStatItem = statItems[1]!;
    expect(sharedStatItem.classList.contains('counter-item--shared')).toBe(true);
    expect(sharedStatItem.querySelector('.counter-detail-card__shared-badge')?.textContent).toBe(
      '×2',
    );

    const nonSharedStatItem = statItems[0]!;
    expect(nonSharedStatItem.classList.contains('counter-item--shared')).toBe(false);
    expect(
      nonSharedStatItem.querySelector('.counter-detail-card__shared-badge'),
    ).not.toBeInTheDocument();
  });

  it('renders analytics section even when hero has no curated items', () => {
    render(() => (
      <CounterDetailCard
        hero={heroUncurated}
        sharedCuratedItems={new Set()}
        sharedAnalyticsItems={new Set()}
      />
    ));

    expect(
      document.querySelector('.counter-detail-card__section--curated'),
    ).not.toBeInTheDocument();
    expect(document.querySelector('.counter-detail-card__section--analytics')).toBeInTheDocument();
    const analyticsItems = document.querySelectorAll(
      '.counter-detail-card__section--analytics dl-item-card',
    );
    expect(analyticsItems.length).toBe(1);
  });
});
