import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Hero } from '~/lib/types';
import HeroPicker from '../HeroPicker';

afterEach(cleanup);

const HEROES: Hero[] = [
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
    name: 'Wraith',
    class_name: 'hero_wraith',
    images: {
      icon_image_small: '',
      icon_image_small_webp: '',
      icon_hero_card: '',
      icon_hero_card_webp: '',
    },
  },
];

describe('HeroPicker', () => {
  it('initial render: no dialog, trigger has aria-expanded="false" and aria-haspopup="dialog"', () => {
    render(() => <HeroPicker heroes={HEROES} selected={undefined} onChange={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    // trigger may not have accessible name — fallback: find button with aria-haspopup
    const btn = document.querySelector('.hero-picker__trigger') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('click trigger → dialog appears with role=dialog, aria-modal=true, aria-label="Pick a hero"; trigger aria-expanded="true"', async () => {
    render(() => <HeroPicker heroes={HEROES} selected={undefined} onChange={vi.fn()} />);
    const btn = document.querySelector('.hero-picker__trigger') as HTMLButtonElement;
    fireEvent.click(btn);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Pick a hero');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('when open: N hero options present inside dialog', async () => {
    render(() => <HeroPicker heroes={HEROES} selected={undefined} onChange={vi.fn()} />);
    fireEvent.click(document.querySelector('.hero-picker__trigger') as HTMLButtonElement);
    await screen.findByRole('dialog');
    const options = document.querySelectorAll('[role="dialog"] [role="option"]');
    expect(options.length).toBe(HEROES.length);
  });

  it('click hero option → onChange called with that hero + dialog closes', async () => {
    const onChange = vi.fn();
    render(() => <HeroPicker heroes={HEROES} selected={undefined} onChange={onChange} />);
    fireEvent.click(document.querySelector('.hero-picker__trigger') as HTMLButtonElement);
    await screen.findByRole('dialog');
    const firstOption = document.querySelector('[role="dialog"] [role="option"]') as HTMLElement;
    fireEvent.click(firstOption);
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(HEROES[0]);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Escape key closes dialog; onChange NOT called', async () => {
    const onChange = vi.fn();
    render(() => <HeroPicker heroes={HEROES} selected={undefined} onChange={onChange} />);
    fireEvent.click(document.querySelector('.hero-picker__trigger') as HTMLButtonElement);
    await screen.findByRole('dialog');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('mousedown outside overlay closes dialog', async () => {
    render(() => <HeroPicker heroes={HEROES} selected={undefined} onChange={vi.fn()} />);
    fireEvent.click(document.querySelector('.hero-picker__trigger') as HTMLButtonElement);
    await screen.findByRole('dialog');
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('mousedown inside overlay does NOT close dialog', async () => {
    render(() => <HeroPicker heroes={HEROES} selected={undefined} onChange={vi.fn()} />);
    fireEvent.click(document.querySelector('.hero-picker__trigger') as HTMLButtonElement);
    const dialog = await screen.findByRole('dialog');
    fireEvent.mouseDown(dialog);
    expect(screen.queryByRole('dialog')).toBeTruthy();
  });

  it('on open: document.activeElement is first option inside dialog (after setTimeout)', async () => {
    vi.useFakeTimers();
    render(() => <HeroPicker heroes={HEROES} selected={undefined} onChange={vi.fn()} />);
    fireEvent.click(document.querySelector('.hero-picker__trigger') as HTMLButtonElement);
    await screen.findByRole('dialog');
    vi.runAllTimers();
    const firstOption = document.querySelector('[role="dialog"] [role="option"]') as HTMLElement;
    expect(document.activeElement).toBe(firstOption);
    vi.useRealTimers();
  });

  it('on close: document.activeElement is the trigger button', async () => {
    render(() => <HeroPicker heroes={HEROES} selected={undefined} onChange={vi.fn()} />);
    const btn = document.querySelector('.hero-picker__trigger') as HTMLButtonElement;
    fireEvent.click(btn);
    await screen.findByRole('dialog');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(btn);
  });

  it('overlay container has tabindex="-1"', async () => {
    render(() => <HeroPicker heroes={HEROES} selected={undefined} onChange={vi.fn()} />);
    fireEvent.click(document.querySelector('.hero-picker__trigger') as HTMLButtonElement);
    const dialog = await screen.findByRole('dialog');
    expect(dialog.getAttribute('tabindex')).toBe('-1');
  });
});
