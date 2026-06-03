import { Show } from 'solid-js';
import type { Hero } from '~/lib/types';

interface HeroCardProps {
  hero: Hero | undefined;
}

export default function HeroCard(props: HeroCardProps) {
  return (
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
  );
}
