vi.mock('@deadlock-api/ui-core/loader', () => ({
  defineCustomElements: vi.fn(),
}));

// Mock analytics JSON — must be hoisted before imports
vi.mock('~/generated/counters-analytics.json', () => ({
  default: {
    schemaVersion: 1,
    generatedAt: '2026-06-05T00:00:00.000Z',
    config: { minAverageBadge: 50, minMatchesPlayed: 100, minWinRateDelta: 0.025 },
    heroes: {
      hero_test_analytics: {
        heroId: 8888,
        status: 'ok',
        refreshedAt: '2026-06-05T00:00:00.000Z',
        counters: [
          {
            source: 'analytics',
            item: 'upgrade_grit',
            winRateDelta: 0.042,
            sampleSize: 1000,
            reason: '+4.2pp win rate over 1000 matches',
            generatedAt: '2026-06-05T00:00:00.000Z',
          },
          {
            source: 'analytics',
            item: 'upgrade_metal_skin',
            winRateDelta: 0.035,
            sampleSize: 800,
            reason: '+3.5pp win rate over 800 matches',
            generatedAt: '2026-06-05T00:00:00.000Z',
          },
        ],
      },
      // hero_haze intentionally OMITTED → analytics counters = [] → preserves existing test counting 3 curated items only
      // hero_test_uncurated intentionally OMITTED → analytics counters = [] → preserves existing test counting 0 items
    },
  },
}));

import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import type { Hero } from '~/lib/types';
import HeroCard from '../HeroCard';

const hero: Hero = {
  id: 1,
  name: 'Abrams',
  class_name: 'hero_abrams',
  images: {
    icon_image_small: 'https://example.com/small.png',
    icon_image_small_webp: 'https://example.com/small.webp',
    icon_hero_card: 'https://example.com/card.png',
    icon_hero_card_webp: 'https://example.com/card.webp',
  },
};

const hazeHero: Hero = {
  id: 5,
  name: 'Haze',
  class_name: 'hero_haze',
  images: {
    icon_image_small: 'https://example.com/small.png',
    icon_image_small_webp: 'https://example.com/small.webp',
    icon_hero_card: 'https://example.com/card.png',
    icon_hero_card_webp: 'https://example.com/card.webp',
  },
};

const heroNoImage: Hero = {
  id: 99,
  name: 'Bomber',
  class_name: 'hero_bomber',
  images: {
    icon_image_small: '',
    icon_image_small_webp: '',
    icon_hero_card: '',
    icon_hero_card_webp: '',
  },
};

// Deliberately fabricated class_name that does NOT appear in counters.json.
// Using a real hero with curated counters would yield 3 cards; using a real
// uncurated hero would silently start failing if curation later expands to
// cover them. A clearly-fake slug keeps this test stable across curation churn.
const heroUncurated: Hero = {
  id: 9999,
  name: 'Uncurated',
  class_name: 'hero_test_uncurated',
  images: {
    icon_image_small: 'https://example.com/small.png',
    icon_image_small_webp: 'https://example.com/small.webp',
    icon_hero_card: 'https://example.com/card.png',
    icon_hero_card_webp: 'https://example.com/card.webp',
  },
};

const heroWithAnalytics: Hero = {
  id: 8888,
  name: 'Analytics Test',
  class_name: 'hero_test_analytics',
  images: {
    icon_image_small: 'https://example.com/small.png',
    icon_image_small_webp: 'https://example.com/small.webp',
    icon_hero_card: 'https://example.com/card.png',
    icon_hero_card_webp: 'https://example.com/card.webp',
  },
};

describe('HeroCard', () => {
  it('renders ? placeholder when no hero provided', () => {
    render(() => <HeroCard hero={undefined} />);
    const placeholder = document.querySelector('[data-placeholder="true"]');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder?.textContent).toBe('?');
    expect(document.querySelector('.hero-card')).toBeInTheDocument();
  });

  it('renders card image when hero has images', () => {
    render(() => <HeroCard hero={hero} />);
    const img = screen.getByRole('img', { name: 'Abrams' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', hero.images.icon_hero_card);
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('renders fallback letter when hero has empty images', () => {
    render(() => <HeroCard hero={heroNoImage} />);
    const fallback = document.querySelector('.hero-card__fallback');
    expect(fallback).toBeInTheDocument();
    expect(fallback?.textContent).toBe('B');
  });

  it('root element has class hero-card', () => {
    render(() => <HeroCard hero={hero} />);
    expect(document.querySelector('.hero-card')).toBeInTheDocument();
  });

  it('renders 3 dl-item-card elements for hero with curated counters', () => {
    render(() => <HeroCard hero={hazeHero} />);
    expect(document.querySelectorAll('dl-item-card').length).toBe(3);
  });

  it('renders 0 dl-item-card elements for hero without curated counters', () => {
    render(() => <HeroCard hero={heroUncurated} />);
    expect(document.querySelectorAll('dl-item-card').length).toBe(0);
  });

  it('renders .hero-card__section--curated for hero with curated data', () => {
    render(() => <HeroCard hero={hazeHero} />);
    expect(document.querySelector('.hero-card__section--curated')).toBeInTheDocument();
  });

  it('does not render .hero-card__section--curated for hero without curated data', () => {
    render(() => <HeroCard hero={heroUncurated} />);
    expect(document.querySelector('.hero-card__section--curated')).not.toBeInTheDocument();
  });

  it('always renders .hero-card__section--analytics', () => {
    render(() => <HeroCard hero={heroUncurated} />);
    expect(document.querySelector('.hero-card__section--analytics')).toBeInTheDocument();
  });

  it('renders analytics dl-item-card elements when hero has analytics data', () => {
    render(() => <HeroCard hero={heroWithAnalytics} />);
    const analyticsSection = document.querySelector('.hero-card__section--analytics');
    expect(analyticsSection).toBeInTheDocument();
    expect(analyticsSection?.querySelectorAll('dl-item-card').length).toBe(2);
  });

  it('renders empty state text when hero has no analytics data', () => {
    render(() => <HeroCard hero={heroUncurated} />);
    expect(document.querySelector('.hero-card__section-empty')).toBeInTheDocument();
    expect(document.querySelector('.hero-card__section-empty')?.textContent).toBe(
      'Not enough match data.',
    );
  });
});
