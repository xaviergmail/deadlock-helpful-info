import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import type { Hero } from '~/lib/types';
import HeroTile from '../HeroTile';

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

const emptyHero: Hero = {
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

describe('HeroTile', () => {
  it('renders a button with role="option"', () => {
    render(() => <HeroTile hero={hero} onSelect={() => {}} />);
    expect(screen.getByRole('option')).toBeInTheDocument();
    expect(screen.getByRole('option').tagName).toBe('BUTTON');
  });

  it('renders a picture element with webp source and img', () => {
    render(() => <HeroTile hero={hero} onSelect={() => {}} />);
    const img = screen.getByRole('img', { name: 'Abrams' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', hero.images.icon_image_small);
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('renders fallback letter when images are empty', () => {
    render(() => <HeroTile hero={emptyHero} onSelect={() => {}} />);
    const fallback = document.querySelector('.hero-tile__fallback');
    expect(fallback).toBeInTheDocument();
    expect(fallback?.textContent).toBe('B');
  });

  it('has data-hero-id attribute', () => {
    render(() => <HeroTile hero={hero} onSelect={() => {}} />);
    expect(screen.getByRole('option')).toHaveAttribute('data-hero-id', '1');
  });

  it('has aria-selected="true" and selected class when selected', () => {
    render(() => <HeroTile hero={hero} selected={true} onSelect={() => {}} />);
    const btn = screen.getByRole('option');
    expect(btn).toHaveAttribute('aria-selected', 'true');
    expect(btn.className).toContain('hero-tile--selected');
  });

  it('has aria-selected="false" and no selected class when not selected', () => {
    render(() => <HeroTile hero={hero} selected={false} onSelect={() => {}} />);
    const btn = screen.getByRole('option');
    expect(btn).toHaveAttribute('aria-selected', 'false');
    expect(btn.className).not.toContain('hero-tile--selected');
  });

  it('calls onSelect with the hero when clicked', () => {
    const onSelect = vi.fn();
    render(() => <HeroTile hero={hero} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('option'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(hero);
  });

  it('has aria-disabled="true" and disabled class when disabled', () => {
    render(() => <HeroTile hero={hero} disabled={true} onSelect={() => {}} />);
    const btn = screen.getByRole('option');
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    expect(btn.className).toContain('hero-tile--disabled');
  });

  it('has tabIndex={-1} when disabled', () => {
    render(() => <HeroTile hero={hero} disabled={true} onSelect={() => {}} />);
    const btn = screen.getByRole('option');
    expect(btn).toHaveAttribute('tabindex', '-1');
  });

  it('does not have aria-disabled or disabled class when not disabled', () => {
    render(() => <HeroTile hero={hero} onSelect={() => {}} />);
    const btn = screen.getByRole('option');
    expect(btn).not.toHaveAttribute('aria-disabled');
    expect(btn.className).not.toContain('hero-tile--disabled');
  });

  it('suppresses onSelect when disabled', () => {
    const onSelect = vi.fn();
    render(() => <HeroTile hero={hero} disabled={true} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('option'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
