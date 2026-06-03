import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import type { Hero } from '~/lib/types';
import HeroGrid from '../HeroGrid';

const heroes: Hero[] = [
  {
    id: 1,
    name: 'Abrams',
    class_name: 'hero_abrams',
    images: {
      icon_image_small: 'a.png',
      icon_image_small_webp: 'a.webp',
      icon_hero_card: 'ac.png',
      icon_hero_card_webp: 'ac.webp',
    },
  },
  {
    id: 2,
    name: 'Bebop',
    class_name: 'hero_bebop',
    images: {
      icon_image_small: 'b.png',
      icon_image_small_webp: 'b.webp',
      icon_hero_card: 'bc.png',
      icon_hero_card_webp: 'bc.webp',
    },
  },
  {
    id: 3,
    name: 'Calico',
    class_name: 'hero_calico',
    images: {
      icon_image_small: '',
      icon_image_small_webp: '',
      icon_hero_card: '',
      icon_hero_card_webp: '',
    },
  },
];

describe('HeroGrid', () => {
  it('renders root with role="listbox" and aria-label="Heroes"', () => {
    render(() => <HeroGrid heroes={heroes} selectedId={undefined} onSelect={() => {}} />);
    const listbox = screen.getByRole('listbox', { name: 'Heroes' });
    expect(listbox).toBeInTheDocument();
    expect(listbox.className).toContain('hero-picker__grid');
  });

  it('renders one option per hero', () => {
    render(() => <HeroGrid heroes={heroes} selectedId={undefined} onSelect={() => {}} />);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('marks only the selected hero with aria-selected="true"', () => {
    render(() => <HeroGrid heroes={heroes} selectedId={2} onSelect={() => {}} />);
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(options[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onSelect with clicked hero', () => {
    const onSelect = vi.fn();
    render(() => <HeroGrid heroes={heroes} selectedId={undefined} onSelect={onSelect} />);
    const option = screen.getAllByRole('option')[0];
    if (!option) throw new Error('No option found');
    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(heroes[0]);
  });

  it('renders tiles with correct data-hero-id attributes', () => {
    render(() => <HeroGrid heroes={heroes} selectedId={undefined} onSelect={() => {}} />);
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('data-hero-id', '1');
    expect(options[1]).toHaveAttribute('data-hero-id', '2');
    expect(options[2]).toHaveAttribute('data-hero-id', '3');
  });
});
