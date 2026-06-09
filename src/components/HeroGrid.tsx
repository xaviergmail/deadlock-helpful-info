import { For } from 'solid-js';
import '~/components/HeroGrid.css';
import type { Hero } from '~/lib/types';
import HeroTile from './HeroTile';

interface HeroGridProps {
  heroes: ReadonlyArray<Hero>;
  selectedIds: number[];
  disabledIds: number[];
  onSelect: (hero: Hero) => void;
}

export default function HeroGrid(props: HeroGridProps) {
  return (
    <div role="listbox" aria-label="Heroes" class="hero-picker__grid" tabIndex={0}>
      <For each={props.heroes}>
        {(hero) => (
          <HeroTile
            hero={hero}
            selected={props.selectedIds.includes(hero.id)}
            disabled={props.disabledIds.includes(hero.id)}
            onSelect={props.onSelect}
          />
        )}
      </For>
    </div>
  );
}
