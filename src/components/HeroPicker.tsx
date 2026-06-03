import { Show, createEffect, createSignal, onCleanup } from 'solid-js';
import type { Hero } from '~/lib/types';
import HeroCard from './HeroCard';
import HeroGrid from './HeroGrid';

interface HeroPickerProps {
  heroes: ReadonlyArray<Hero>;
  selected: Hero | undefined;
  onChange: (hero: Hero) => void;
}

export default function HeroPicker(props: HeroPickerProps) {
  const [open, setOpen] = createSignal(false);
  let overlayEl: HTMLDivElement | undefined;
  let triggerEl: HTMLButtonElement | undefined;

  const close = () => {
    setOpen(false);
    triggerEl?.focus();
  };

  const onDocMouseDown = (e: MouseEvent) => {
    if (!overlayEl) return;
    if (!overlayEl.contains(e.target as Node)) close();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab' && overlayEl) {
      const focusables = overlayEl.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0] as HTMLElement;
      const last = focusables[focusables.length - 1] as HTMLElement;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  createEffect(() => {
    if (open()) {
      document.addEventListener('mousedown', onDocMouseDown);
      document.addEventListener('keydown', onKeyDown);
      const t = window.setTimeout(() => {
        overlayEl?.querySelector<HTMLElement>('[role="option"]')?.focus();
      }, 100);
      onCleanup(() => {
        window.clearTimeout(t);
        document.removeEventListener('mousedown', onDocMouseDown);
        document.removeEventListener('keydown', onKeyDown);
      });
    }
  });

  const handleSelect = (hero: Hero) => {
    props.onChange(hero);
    close();
  };

  return (
    <div class="hero-picker">
      <button
        ref={triggerEl}
        type="button"
        class="hero-picker__trigger"
        aria-haspopup="dialog"
        aria-expanded={open() ? 'true' : 'false'}
        onClick={() => setOpen((v) => !v)}
      >
        <HeroCard hero={props.selected} />
      </button>
      <Show when={open()}>
        <dialog
          ref={overlayEl}
          class="hero-picker__overlay"
          aria-modal="true"
          aria-label="Pick a hero"
          tabindex="-1"
        >
          <button
            type="button"
            class="hero-picker__close"
            aria-label="Close hero picker"
            onClick={close}
          >
            ×
          </button>
          <HeroGrid heroes={props.heroes} selectedId={props.selected?.id} onSelect={handleSelect} />
        </dialog>
      </Show>
    </div>
  );
}
