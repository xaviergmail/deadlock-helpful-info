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
      ],
    },
    hero_inferno: {
      schemaVersion: 1,
      hero: 'hero_inferno',
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
        {
          item: 'upgrade_decay',
          confidence: 'medium',
          reason: 'Test',
          lastReviewedPatch: '2026-06-05',
        },
      ],
    },
    hero_bebop: {
      schemaVersion: 1,
      hero: 'hero_bebop',
      itemCounters: [
        {
          item: 'upgrade_silencer',
          confidence: 'medium',
          reason: 'Test',
          lastReviewedPatch: '2026-06-05',
        },
      ],
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
        heroId: 13,
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
        ],
      },
      hero_inferno: {
        heroId: 1,
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
      hero_bebop: {
        heroId: 15,
        status: 'ok',
        refreshedAt: '2026-06-05T00:00:00.000Z',
        counters: [
          {
            source: 'analytics',
            item: 'upgrade_combat_barrier',
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

import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import CountersPage from '../counters';

describe('CountersPage', () => {
  it('renders two empty slots initially', () => {
    render(() => <CountersPage />);

    const placeholders = document.querySelectorAll('.counter-detail-card__placeholder');
    expect(placeholders.length).toBe(2);
    expect(screen.getAllByText('Select a hero').length).toBe(2);
  });

  it('renders hero grid with all heroes', () => {
    render(() => <CountersPage />);

    const listbox = screen.getByRole('listbox', { name: 'Heroes' });
    expect(listbox).toBeInTheDocument();
    // heroes.json has 38 heroes
    expect(screen.getAllByRole('option').length).toBe(38);
  });

  it('clicking a hero fills Slot 1', () => {
    render(() => <CountersPage />);

    const hazeOption = screen.getByRole('option', { name: 'Haze' });
    fireEvent.click(hazeOption);

    const imgs = screen.getAllByRole('img', { name: 'Haze' });
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Haze')).toBeInTheDocument();
  });

  it('shows prompt when only one hero is selected', () => {
    render(() => <CountersPage />);

    const hazeOption = screen.getByRole('option', { name: 'Haze' });
    fireEvent.click(hazeOption);

    expect(screen.getByText('Select another hero to see shared counters')).toBeInTheDocument();
  });

  it('clicking a second hero fills Slot 2 and hides prompt', () => {
    render(() => <CountersPage />);

    const hazeOption = screen.getByRole('option', { name: 'Haze' });
    const infernusOption = screen.getByRole('option', { name: 'Infernus' });

    fireEvent.click(hazeOption);
    expect(screen.getByText('Select another hero to see shared counters')).toBeInTheDocument();

    fireEvent.click(infernusOption);
    expect(
      screen.queryByText('Select another hero to see shared counters'),
    ).not.toBeInTheDocument();

    // Both heroes should be rendered
    expect(screen.getByText('Haze')).toBeInTheDocument();
    expect(screen.getByText('Infernus')).toBeInTheDocument();
  });

  it('unselecting Slot 1 promotes Slot 2 hero', () => {
    render(() => <CountersPage />);

    const hazeOption = screen.getByRole('option', { name: 'Haze' });
    const infernusOption = screen.getByRole('option', { name: 'Infernus' });

    fireEvent.click(hazeOption);
    fireEvent.click(infernusOption);

    // Both selected
    expect(screen.getByText('Haze')).toBeInTheDocument();
    expect(screen.getByText('Infernus')).toBeInTheDocument();

    // Click Haze again to unselect Slot 1
    fireEvent.click(hazeOption);

    // Haze should be gone, Infernus should still be present
    expect(screen.queryByText('Haze')).not.toBeInTheDocument();
    expect(screen.getByText('Infernus')).toBeInTheDocument();

    // Prompt should reappear since only one hero remains
    expect(screen.getByText('Select another hero to see shared counters')).toBeInTheDocument();
  });

  it('unselecting Slot 2 leaves Slot 1 intact', () => {
    render(() => <CountersPage />);

    const hazeOption = screen.getByRole('option', { name: 'Haze' });
    const infernusOption = screen.getByRole('option', { name: 'Infernus' });

    fireEvent.click(hazeOption);
    fireEvent.click(infernusOption);

    // Click Infernus again to unselect Slot 2
    fireEvent.click(infernusOption);

    // Haze should still be present, Infernus gone
    expect(screen.getByText('Haze')).toBeInTheDocument();
    expect(screen.queryByText('Infernus')).not.toBeInTheDocument();
  });

  it('disables unselected heroes when two are selected', () => {
    render(() => <CountersPage />);

    const hazeOption = screen.getByRole('option', { name: 'Haze' });
    const infernusOption = screen.getByRole('option', { name: 'Infernus' });

    fireEvent.click(hazeOption);
    fireEvent.click(infernusOption);

    // Bebop should be disabled (not selected)
    const bebopOption = screen.getByRole('option', { name: 'Bebop' });
    expect(bebopOption).toHaveAttribute('aria-disabled', 'true');
    expect(bebopOption.classList.contains('hero-tile--disabled')).toBe(true);

    // Selected heroes should NOT be disabled
    expect(hazeOption).not.toHaveAttribute('aria-disabled');
    expect(infernusOption).not.toHaveAttribute('aria-disabled');
  });

  it('clicking a disabled hero does nothing', () => {
    const onSelect = vi.fn();
    render(() => <CountersPage />);

    const hazeOption = screen.getByRole('option', { name: 'Haze' });
    const infernusOption = screen.getByRole('option', { name: 'Infernus' });

    fireEvent.click(hazeOption);
    fireEvent.click(infernusOption);

    // Bebop is disabled
    const bebopOption = screen.getByRole('option', { name: 'Bebop' });
    expect(bebopOption).toHaveAttribute('aria-disabled', 'true');

    // Clicking disabled hero should not change state
    fireEvent.click(bebopOption);

    // Still only Haze and Infernus selected
    expect(screen.getByText('Haze')).toBeInTheDocument();
    expect(screen.getByText('Infernus')).toBeInTheDocument();
    expect(screen.queryByText('Bebop')).not.toBeInTheDocument();
  });

  it('computes shared items when two heroes are selected', () => {
    render(() => <CountersPage />);

    const hazeOption = screen.getByRole('option', { name: 'Haze' });
    const infernusOption = screen.getByRole('option', { name: 'Infernus' });

    fireEvent.click(hazeOption);
    fireEvent.click(infernusOption);

    // Haze and Infernus share: upgrade_vex_barrier (curated), upgrade_metal_skin (curated), upgrade_grit (analytics), upgrade_metal_skin (analytics)
    // Check that shared items have the highlight class
    const sharedCurated = document.querySelectorAll('.counter-item--shared');
    expect(sharedCurated.length).toBeGreaterThan(0);

    // Verify ×2 badges are present
    const badges = document.querySelectorAll('.counter-detail-card__shared-badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('does not compute shared items when only one hero is selected', () => {
    render(() => <CountersPage />);

    const hazeOption = screen.getByRole('option', { name: 'Haze' });
    fireEvent.click(hazeOption);

    // No shared badges should appear with only one hero
    const badges = document.querySelectorAll('.counter-detail-card__shared-badge');
    expect(badges.length).toBe(0);
  });

  it('prevents selecting the same hero twice', () => {
    render(() => <CountersPage />);

    const hazeOption = screen.getByRole('option', { name: 'Haze' });

    fireEvent.click(hazeOption);
    // Clicking Haze again should unselect it, not add it to Slot 2
    fireEvent.click(hazeOption);

    // Both slots should be empty
    const placeholders = document.querySelectorAll('.counter-detail-card__placeholder');
    expect(placeholders.length).toBe(2);
  });
});
