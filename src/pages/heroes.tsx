import { createSignal } from 'solid-js';
import HeroCard from '~/components/HeroCard';
import HeroGrid from '~/components/HeroGrid';
import '~/components/HeroPicker.css';
import heroesData from '~/generated/heroes.json';
import type { Hero } from '~/lib/types';

const heroes = heroesData as ReadonlyArray<Hero>;

export default function HeroesPage() {
  const [selected, setSelected] = createSignal<Hero | undefined>(undefined);
  return (
    <section class="page-heroes">
      <HeroCard hero={selected()} />
      <HeroGrid heroes={heroes} selectedId={selected()?.id} onSelect={setSelected} />
    </section>
  );
}
