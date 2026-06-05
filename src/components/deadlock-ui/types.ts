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
 *
 * `children` is provided implicitly by Solid's `ParentComponent<T>` and is NOT
 * declared here. The provider is a Phase 1 noop wrapper kept so call-sites
 * (currently only `AppShell`) don't change when `<dl-provider>` is adopted in
 * a future phase for global language switching.
 */
export interface DeadlockUiProviderProps {
  /** BCP-47 language tag for item name localisation (e.g. `"en"`, `"de"`). */
  language?: string;
}
