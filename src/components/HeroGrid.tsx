import { For } from 'solid-js';
import type { Hero } from '~/lib/types';
import HeroTile from './HeroTile';

interface HeroGridProps {
  heroes: ReadonlyArray<Hero>;
  selectedId: number | undefined;
  onSelect: (hero: Hero) => void;
}

export default function HeroGrid(props: HeroGridProps) {
  return (
    <div role="listbox" aria-label="Heroes" class="hero-picker__grid" tabIndex={0}>
      <For each={props.heroes}>
        {(hero) => (
          <HeroTile hero={hero} selected={props.selectedId === hero.id} onSelect={props.onSelect} />
        )}
      </For>
    </div>
  );
}
