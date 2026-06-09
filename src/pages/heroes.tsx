import { createSignal } from 'solid-js';
import HeroCard from '~/components/HeroCard';
import HeroGrid from '~/components/HeroGrid';
import heroesData from '~/generated/heroes.json';
import type { Hero } from '~/lib/types';

const heroes = heroesData as ReadonlyArray<Hero>;

export default function HeroesPage() {
  const [selected, setSelected] = createSignal<Hero | undefined>(undefined);
  const selectedIds = () => {
    const s = selected();
    return s ? [s.id] : [];
  };
  return (
    <section class="page-heroes">
      <HeroCard hero={selected()} />
      <HeroGrid
        heroes={heroes}
        selectedIds={selectedIds()}
        disabledIds={[]}
        onSelect={setSelected}
      />
    </section>
  );
}
