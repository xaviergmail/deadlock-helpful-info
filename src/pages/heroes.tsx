import { createSignal } from 'solid-js';
import HeroPicker from '~/components/HeroPicker';
import '~/components/HeroPicker.css';
import heroesData from '~/generated/heroes.json';
import type { Hero } from '~/lib/types';

const heroes = heroesData as ReadonlyArray<Hero>;

export default function HeroesPage() {
  const [selected, setSelected] = createSignal<Hero | undefined>(undefined);
  return (
    <section class="page-heroes">
      <HeroPicker heroes={heroes} selected={selected()} onChange={setSelected} />
    </section>
  );
}
