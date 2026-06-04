import type { ParentComponent } from 'solid-js';

/**
 * Phase 1 stub — renders children directly without wrapping in `<dl-provider>`.
 *
 * Individual `<dl-item-card>` components auto-fetch their item data from the
 * Deadlock API, so a global provider element is not required in Phase 1.
 *
 * Future phases may wrap `<dl-provider>` here when global language switching
 * or a shared `tooltip-trigger` config is needed across all item components
 * simultaneously. The `language` prop is accepted now so call-sites don't
 * need to change when the upgrade happens.
 */
const DeadlockUiProvider: ParentComponent<{ language?: string }> = (props) => {
  return <>{props.children}</>;
};

export default DeadlockUiProvider;
