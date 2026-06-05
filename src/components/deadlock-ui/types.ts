import type { JSX } from 'solid-js';

/**
 * Props for the {@link ItemCard} wrapper component.
 *
 * Note: `class` and attribute-level props for `<dl-item-card>` are declared
 * globally in `src/vite-env.d.ts`. This interface defines the Solid-facing API
 * only — not JSX intrinsics.
 */
export interface ItemCardProps {
  /** Item class-name slug (e.g. `"decay"`, `"metal_skin"`). */
  itemId: string;
  /** Additional CSS class(es) to merge onto the root element. */
  class?: string;
}

/**
 * Props for the {@link DeadlockUiProvider} wrapper component.
 */
export interface DeadlockUiProviderProps {
  children: JSX.Element;
  /** BCP-47 language tag for item name localisation (e.g. `"en"`, `"de"`). */
  language?: string;
}
