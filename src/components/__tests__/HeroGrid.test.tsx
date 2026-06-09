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
    render(() => (
      <HeroGrid heroes={heroes} selectedIds={[]} disabledIds={[]} onSelect={() => {}} />
    ));
    const listbox = screen.getByRole('listbox', { name: 'Heroes' });
    expect(listbox).toBeInTheDocument();
    expect(listbox.className).toContain('hero-picker__grid');
  });

  it('renders one option per hero', () => {
    render(() => (
      <HeroGrid heroes={heroes} selectedIds={[]} disabledIds={[]} onSelect={() => {}} />
    ));
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('marks only the selected heroes with aria-selected="true"', () => {
    render(() => (
      <HeroGrid heroes={heroes} selectedIds={[2]} disabledIds={[]} onSelect={() => {}} />
    ));
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(options[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('marks multiple selected heroes with aria-selected="true"', () => {
    render(() => (
      <HeroGrid heroes={heroes} selectedIds={[1, 3]} disabledIds={[]} onSelect={() => {}} />
    ));
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onSelect with clicked hero', () => {
    const onSelect = vi.fn();
    render(() => (
      <HeroGrid heroes={heroes} selectedIds={[]} disabledIds={[]} onSelect={onSelect} />
    ));
    const option = screen.getAllByRole('option')[0];
    if (!option) throw new Error('No option found');
    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(heroes[0]);
  });

  it('renders tiles with correct data-hero-id attributes', () => {
    render(() => (
      <HeroGrid heroes={heroes} selectedIds={[]} disabledIds={[]} onSelect={() => {}} />
    ));
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('data-hero-id', '1');
    expect(options[1]).toHaveAttribute('data-hero-id', '2');
    expect(options[2]).toHaveAttribute('data-hero-id', '3');
  });

  it('applies disabled state to heroes in disabledIds', () => {
    render(() => (
      <HeroGrid heroes={heroes} selectedIds={[]} disabledIds={[2]} onSelect={() => {}} />
    ));
    const options = screen.getAllByRole('option');
    expect(options[0]).not.toHaveAttribute('aria-disabled');
    expect(options[1]).toHaveAttribute('aria-disabled', 'true');
    expect(options[2]).not.toHaveAttribute('aria-disabled');
  });
});
