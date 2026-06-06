import { For, Show } from 'solid-js';
import ItemCard from '~/components/deadlock-ui/ItemCard';
import analyticsData from '~/generated/counters-analytics.json';
import countersData from '~/generated/counters.json';
import type { AnalyticsCountersFile, CountersData } from '~/lib/types';
import type { Hero } from '~/lib/types';
import '~/components/HeroCard.css';

interface HeroCardProps {
  hero: Hero | undefined;
}

const SECTION_LABELS = { curated: 'Curated', analytics: 'Item Matchups' } as const;

function formatDelta(d: number): string {
  const pp = Math.round(d * 1000) / 10;
  if (pp === 0) return '0.0pp';
  const sign = pp > 0 ? '+' : '−';
  return `${sign}${Math.abs(pp).toFixed(1)}pp`;
}

function formatSampleSize(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function trendFor(d: number): 'positive' | 'negative' | 'neutral' {
  if (d > 0.01) return 'positive';
  if (d < -0.01) return 'negative';
  return 'neutral';
}

export default function HeroCard(props: HeroCardProps) {
  return (
    <div class="hero-card-wrapper">
      <div class="hero-card">
        <Show
          when={props.hero}
          fallback={
            <span class="hero-card__placeholder" data-placeholder="true">
              ?
            </span>
          }
        >
          {(hero) => (
            <Show
              when={hero().images.icon_hero_card !== ''}
              fallback={
                <span class="hero-card__fallback">{(hero().name[0] ?? '?').toUpperCase()}</span>
              }
            >
              <picture>
                <source type="image/webp" srcset={hero().images.icon_hero_card_webp} />
                <img
                  class="hero-card__img"
                  src={hero().images.icon_hero_card}
                  alt={hero().name}
                  decoding="async"
                />
              </picture>
            </Show>
          )}
        </Show>
      </div>
      <Show when={props.hero}>
        {(hero) => {
          const curated = () =>
            (countersData as CountersData)[hero().class_name]?.itemCounters.slice(0, 3) ?? [];
          const analytics = () =>
            (analyticsData as unknown as AnalyticsCountersFile).heroes[
              hero().class_name
            ]?.counters.slice(0, 3) ?? [];
          return (
            <div class="hero-card__recommendations">
              <Show when={curated().length > 0}>
                <div class="hero-card__section hero-card__section--curated">
                  <h3 class="hero-card__section-header">{SECTION_LABELS.curated}</h3>
                  <div class="hero-card__section-items">
                    <For each={curated()}>
                      {(entry) => <ItemCard itemId={entry.item} class="hero-card__counter-item" />}
                    </For>
                  </div>
                </div>
              </Show>
              <div class="hero-card__section hero-card__section--analytics">
                <h3 class="hero-card__section-header">{SECTION_LABELS.analytics}</h3>
                <p class="hero-card__section-sub">Win-rate delta vs average</p>
                <Show
                  when={analytics().length > 0}
                  fallback={<p class="hero-card__section-empty">Item stats unavailable.</p>}
                >
                  <div class="hero-card__section-items">
                    <For each={analytics()}>
                      {(entry) => (
                        <div class="hero-card__stat-item" data-trend={trendFor(entry.winRateDelta)}>
                          <ItemCard itemId={entry.item} class="hero-card__counter-item" />
                          <span class="hero-card__stat-delta">
                            {formatDelta(entry.winRateDelta)}
                          </span>
                          <span class="hero-card__stat-samples">
                            {formatSampleSize(entry.sampleSize)}
                          </span>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            </div>
          );
        }}
      </Show>
    </div>
  );
}
