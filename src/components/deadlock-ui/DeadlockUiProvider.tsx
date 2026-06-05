import type { ParentComponent } from 'solid-js';
import type { DeadlockUiProviderProps } from './types';

/**
 * Passthrough wrapper kept as a seam for future global config.
 *
 * Rendering a real `<dl-provider>` here would force every route to load the
 * Stencil lazy chunks (`*.entry.js`) which Vite does not copy to `dist/`
 * during production builds — see Stencil's `/* @vite-ignore *\/` dynamic import.
 * Until we either adopt eager `defineCustomElement` (which would blow the
 * 60 KB initial-JS budget) or wire a static-copy plugin, configure tooltips
 * per-card via the `tooltip-trigger` attribute on `<dl-item-card>` instead.
 */
const DeadlockUiProvider: ParentComponent<DeadlockUiProviderProps> = (props) => {
  return <>{props.children}</>;
};

export default DeadlockUiProvider;
