import { A } from '@solidjs/router';
import { For } from 'solid-js';
import { navRoutes } from '~/routes';

export default function Home() {
  return (
    <section class="page page--home">
      <h1>Deadlock Helpful Info</h1>
      <p>Quick reference for heroes, items, and abilities — built for the Steam Overlay browser.</p>
      <nav aria-label="Primary">
        <ul class="route-list">
          <For each={navRoutes}>
            {(route) => (
              <li>
                <A href={route.path}>{route.label}</A>
              </li>
            )}
          </For>
        </ul>
      </nav>
    </section>
  );
}
