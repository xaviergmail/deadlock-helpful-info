import { fireEvent, render, screen } from '@solidjs/testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Hero } from '~/lib/types';
import HeroPicker from '../HeroPicker';

const heroes: ReadonlyArray<Hero> = [
  {
    id: 1,
    name: 'Abrams',
    class_name: 'hero_abrams',
    images: {
      icon_image_small: 'https://example.com/abrams-small.png',
      icon_image_small_webp: 'https://example.com/abrams-small.webp',
      icon_hero_card: 'https://example.com/abrams-card.png',
      icon_hero_card_webp: 'https://example.com/abrams-card.webp',
    },
  },
  {
    id: 2,
    name: 'Bebop',
    class_name: 'hero_bebop',
    images: {
      icon_image_small: 'https://example.com/bebop-small.png',
      icon_image_small_webp: 'https://example.com/bebop-small.webp',
      icon_hero_card: 'https://example.com/bebop-card.png',
      icon_hero_card_webp: 'https://example.com/bebop-card.webp',
    },
  },
  {
    id: 3,
    name: 'Calico',
    class_name: 'hero_calico',
    images: {
      icon_image_small: 'https://example.com/calico-small.png',
      icon_image_small_webp: 'https://example.com/calico-small.webp',
      icon_hero_card: 'https://example.com/calico-card.png',
      icon_hero_card_webp: 'https://example.com/calico-card.webp',
    },
  },
];

afterEach(() => {
  vi.useRealTimers();
});

describe('HeroPicker', () => {
  it('initial render — no dialog', () => {
    render(() => <HeroPicker heroes={heroes} selected={undefined} onChange={vi.fn()} />);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    const trigger = screen.getByRole('button', { expanded: false });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('click trigger → opens dialog', () => {
    render(() => <HeroPicker heroes={heroes} selected={undefined} onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { expanded: false });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('overlay shows all hero options', () => {
    render(() => <HeroPicker heroes={heroes} selected={undefined} onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { expanded: false });
    fireEvent.click(trigger);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
  });

  it('select hero → onChange called + dialog closes', () => {
    const onChange = vi.fn();
    render(() => <HeroPicker heroes={heroes} selected={undefined} onChange={onChange} />);
    const trigger = screen.getByRole('button', { expanded: false });
    fireEvent.click(trigger);
    const options = screen.getAllByRole('option');
    // biome-ignore lint/style/noNonNullAssertion: safe in test fixture
    fireEvent.click(options[0]!);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(heroes[0]);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('Escape key closes overlay', () => {
    const onChange = vi.fn();
    render(() => <HeroPicker heroes={heroes} selected={undefined} onChange={onChange} />);
    const trigger = screen.getByRole('button', { expanded: false });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('mousedown outside closes overlay', () => {
    render(() => <HeroPicker heroes={heroes} selected={undefined} onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { expanded: false });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('mousedown inside overlay does NOT close', () => {
    render(() => <HeroPicker heroes={heroes} selected={undefined} onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { expanded: false });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog');
    fireEvent.mouseDown(dialog);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('focus moves to first option on open', () => {
    vi.useFakeTimers();
    render(() => <HeroPicker heroes={heroes} selected={undefined} onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { expanded: false });
    fireEvent.click(trigger);
    vi.advanceTimersByTime(100);
    const options = screen.getAllByRole('option');
    expect(document.activeElement).toBe(options[0]);
  });

  it('focus returns to trigger on close', () => {
    render(() => <HeroPicker heroes={heroes} selected={undefined} onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { expanded: false });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('overlay container has tabindex="-1"', () => {
    render(() => <HeroPicker heroes={heroes} selected={undefined} onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { expanded: false });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('tabindex')).toBe('-1');
  });
});
