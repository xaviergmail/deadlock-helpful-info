import { Show, createSignal } from 'solid-js';
import CounterDetailCard from '~/components/CounterDetailCard';
import HeroGrid from '~/components/HeroGrid';
import heroesData from '~/generated/heroes.json';
import { computeSharedItems } from '~/lib/counters';
import type { Hero } from '~/lib/types';
import '~/pages/counters.css';

const heroes = heroesData as ReadonlyArray<Hero>;

export default function CountersPage() {
  const [selection, setSelection] = createSignal<[Hero | undefined, Hero | undefined]>([
    undefined,
    undefined,
  ]);

  const selectedIds = () =>
    selection()
      .filter((h): h is Hero => h !== undefined)
      .map((h) => h.id);

  const disabledIds = () => {
    const sel = selection();
    const filledCount = sel.filter(Boolean).length;
    if (filledCount < 2) return [];
    const selectedIdSet = new Set(selectedIds());
    return heroes.map((h) => h.id).filter((id) => !selectedIdSet.has(id));
  };

  const sharedItems = () => {
    const sel = selection();
    const hero1 = sel[0];
    const hero2 = sel[1];
    if (hero1 && hero2) {
      return computeSharedItems(hero1.class_name, hero2.class_name);
    }
    return { curated: new Set<string>(), analytics: new Set<string>() };
  };

  const handleSelect = (hero: Hero) => {
    setSelection((prev) => {
      const [slot1, slot2] = prev;
      if (slot1?.id === hero.id) {
        // Unselect slot1, promote slot2 if present
        return [slot2, undefined];
      }
      if (slot2?.id === hero.id) {
        // Unselect slot2
        return [slot1, undefined];
      }
      // Hero not in selection — fill first empty slot
      if (!slot1) return [hero, undefined];
      if (!slot2) return [slot1, hero];
      // Both slots filled — do nothing (disabledIds prevents interaction)
      return prev;
    });
  };

  return (
    <section class="page-counters">
      <div class="counters__detail-panel">
        <div class="counters__slot">
          <CounterDetailCard
            hero={selection()[0]}
            sharedCuratedItems={sharedItems().curated}
            sharedAnalyticsItems={sharedItems().analytics}
          />
        </div>
        <Show when={selection()[0] && !selection()[1]}>
          <p class="counters__prompt">Select another hero to see shared counters</p>
        </Show>
        <div class="counters__slot counters__slot--empty">
          <CounterDetailCard
            hero={selection()[1]}
            sharedCuratedItems={sharedItems().curated}
            sharedAnalyticsItems={sharedItems().analytics}
          />
        </div>
      </div>
      <div class="counters__hero-panel">
        <HeroGrid
          heroes={heroes}
          selectedIds={selectedIds()}
          disabledIds={disabledIds()}
          onSelect={handleSelect}
        />
      </div>
    </section>
  );
}
