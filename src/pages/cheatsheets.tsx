import { For } from 'solid-js';
import sheet2 from '~/assets/cheatsheets/counter-item-cheatsheet-2.png?url';
import sheet1 from '~/assets/cheatsheets/counter-item-cheatsheet.png?url';

const cheatsheets = [
  { src: sheet1, alt: 'Deadlock Counter Item Cheatsheet (Page 1)' },
  { src: sheet2, alt: 'Deadlock Counter Item Cheatsheet (Page 2)' },
] as const;

export default function Cheatsheets() {
  return (
    <section class="page page--cheatsheets">
      <h1>Counter-Item Cheatsheets</h1>
      <p>Quick reference cheatsheets from the community.</p>
      <div class="cheatsheets">
        <For each={cheatsheets}>
          {(sheet) => (
            <figure>
              <img src={sheet.src} alt={sheet.alt} loading="lazy" decoding="async" />
            </figure>
          )}
        </For>
      </div>
    </section>
  );
}
