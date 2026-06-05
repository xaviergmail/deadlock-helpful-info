import { For, Show } from 'solid-js';
import ItemCard from '~/components/deadlock-ui/ItemCard';
import countersData from '~/generated/counters.json';
import type { CountersData } from '~/lib/types';
import type { Hero } from '~/lib/types';
import '~/components/HeroCard.css';

interface HeroCardProps {
  hero: Hero | undefined;
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
          const topCounters = () =>
            (countersData as CountersData)[hero().class_name]?.itemCounters.slice(0, 3) ?? [];
          return (
            <Show when={topCounters().length > 0}>
              <div class="hero-card__counters">
                <For each={topCounters()}>
                  {(entry) => <ItemCard itemId={entry.item} class="hero-card__counter-item" />}
                </For>
              </div>
            </Show>
          );
        }}
      </Show>
    </div>
  );
}
