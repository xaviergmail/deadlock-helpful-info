import { Show } from 'solid-js';
import type { Hero } from '~/lib/types';

interface HeroTileProps {
  hero: Hero;
  selected?: boolean;
  onSelect: (hero: Hero) => void;
}

export default function HeroTile(props: HeroTileProps) {
  const hasImage = () => props.hero.images.icon_image_small !== '';
  const initial = () => (props.hero.name[0] ?? '?').toUpperCase();
  const tileClass = () => `hero-tile${props.selected ? ' hero-tile--selected' : ''}`;
  return (
    <button
      type="button"
      role="option"
      aria-selected={props.selected ? 'true' : 'false'}
      data-hero-id={String(props.hero.id)}
      class={tileClass()}
      onClick={() => props.onSelect(props.hero)}
    >
      <Show when={hasImage()} fallback={<span class="hero-tile__fallback">{initial()}</span>}>
        <picture>
          <source type="image/webp" srcset={props.hero.images.icon_image_small_webp} />
          <img
            class="hero-tile__img"
            src={props.hero.images.icon_image_small}
            alt={props.hero.name}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </Show>
    </button>
  );
}
