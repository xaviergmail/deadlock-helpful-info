import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
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
});
