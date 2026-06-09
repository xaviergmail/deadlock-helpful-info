import { For, Show } from 'solid-js';
import ItemCard from '~/components/deadlock-ui/ItemCard';
import {
  formatDelta,
  formatSampleSize,
  getAnalyticsItems,
  getCuratedItems,
  trendFor,
} from '~/lib/counters';
import type { Hero } from '~/lib/types';
import '~/components/CounterDetailCard.css';

interface CounterDetailCardProps {
  hero: Hero | undefined;
  sharedCuratedItems: ReadonlySet<string>;
  sharedAnalyticsItems: ReadonlySet<string>;
}

export default function CounterDetailCard(props: CounterDetailCardProps) {
  const curated = () => (props.hero ? getCuratedItems(props.hero.class_name) : []);
  const analytics = () => (props.hero ? getAnalyticsItems(props.hero.class_name).slice(0, 3) : []);

  return (
    <div class="counter-detail-card">
      <Show
        when={props.hero}
        fallback={
          <div class="counter-detail-card__placeholder">
            <div class="counter-detail-card__placeholder-icon" />
            <p class="counter-detail-card__placeholder-text">Select a hero</p>
          </div>
        }
      >
        {(hero) => (
          <>
            <div class="counter-detail-card__header">
              <img
                class="counter-detail-card__icon"
                src={hero().images.icon_image_small}
                alt={hero().name}
                width={48}
                height={48}
                decoding="async"
              />
              <h2 class="counter-detail-card__name">{hero().name}</h2>
            </div>

            <Show when={curated().length > 0}>
              <div class="counter-detail-card__section counter-detail-card__section--curated">
                <h3 class="counter-detail-card__section-header">Curated</h3>
                <div class="counter-detail-card__section-items">
                  <For each={curated()}>
                    {(entry) => {
                      const isShared = () => props.sharedCuratedItems.has(entry.item);
                      const wrapperClass = () =>
                        isShared()
                          ? 'counter-detail-card__counter-item counter-item--shared'
                          : 'counter-detail-card__counter-item';
                      return (
                        <div class={wrapperClass()}>
                          <ItemCard itemId={entry.item} />
                          <Show when={isShared()}>
                            <span class="counter-detail-card__shared-badge">×2</span>
                          </Show>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            </Show>

            <div class="counter-detail-card__section counter-detail-card__section--analytics">
              <div class="counter-detail-card__section-header-row">
                <h3 class="counter-detail-card__section-header">Item Matchups</h3>
                <span class="counter-detail-card__section-subtitle">
                  Win-rate delta vs average
                  <span class="counter-detail-card__help-wrap">
                    <span class="counter-detail-card__help-button">?</span>
                    <span class="counter-detail-card__help-tooltip">
                      pp = percentage points. Shows how much the win rate changes when buying this
                      item vs. the hero's average.
                    </span>
                  </span>
                </span>
              </div>
              <div class="counter-detail-card__section-items">
                <For each={analytics()}>
                  {(entry) => {
                    const isShared = () => props.sharedAnalyticsItems.has(entry.item);
                    const statClass = () =>
                      isShared()
                        ? 'counter-detail-card__stat-item counter-item--shared'
                        : 'counter-detail-card__stat-item';
                    return (
                      <div class={statClass()} data-trend={trendFor(entry.winRateDelta)}>
                        <ItemCard itemId={entry.item} />
                        <Show when={isShared()}>
                          <span class="counter-detail-card__shared-badge">×2</span>
                        </Show>
                        <span class="counter-detail-card__stat-delta">
                          {formatDelta(entry.winRateDelta)}
                        </span>
                        <span class="counter-detail-card__stat-samples">
                          {formatSampleSize(entry.sampleSize)}
                        </span>
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
