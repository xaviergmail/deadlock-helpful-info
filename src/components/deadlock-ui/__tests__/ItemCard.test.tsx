vi.mock('@deadlock-api/ui-core/loader', () => ({
  defineCustomElements: vi.fn(),
}));

import { fireEvent, render } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import ItemCard from '../ItemCard';

type DlItemCardElement = HTMLElement & { itemClassName?: string };

describe('ItemCard', () => {
  it('renders dl-item-card with itemClassName property set to itemId', () => {
    render(() => <ItemCard itemId="decay" />);
    const el = document.querySelector('dl-item-card') as DlItemCardElement | null;
    expect(el).toBeInTheDocument();
    expect(el?.itemClassName).toBe('decay');
  });

  it('passes extra class to dl-item-card', () => {
    render(() => <ItemCard itemId="knockdown" class="my-custom" />);
    const el = document.querySelector('dl-item-card');
    expect(el).toBeInTheDocument();
    expect(el?.className).toContain('my-custom');
  });

  it('toggles .is-active class on click', () => {
    render(() => <ItemCard itemId="decay" />);
    // biome-ignore lint/style/noNonNullAssertion: element is asserted present above via render
    const el = document.querySelector('dl-item-card')!;
    expect(el.className).not.toContain('is-active');
    fireEvent.click(el);
    expect(el.className).toContain('is-active');
    fireEvent.click(el);
    expect(el.className).not.toContain('is-active');
  });
});
