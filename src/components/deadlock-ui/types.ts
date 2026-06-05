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
 * declared here. The provider is currently a passthrough wrapper kept as a
 * seam — see `DeadlockUiProvider.tsx` for why rendering `<dl-provider>` is
 * deferred. Tooltip + language config is set per-card via attributes on
 * `<dl-item-card>` until then.
 */
export interface DeadlockUiProviderProps {
  /** Reserved for future global language switching. Has no effect today. */
  language?: string;
}
