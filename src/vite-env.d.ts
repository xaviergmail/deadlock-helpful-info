/// <reference types="vite/client" />

// `export {}` makes this a TypeScript module so that `declare module 'solid-js'`
// below is a module AUGMENTATION (merges with solid-js types) rather than an
// ambient declaration (which would replace all solid-js exports entirely).
export {};

// JSX intrinsic element declarations for @deadlock-api/ui-core web components.
// Only `dl-item-card` is consumed by the adapter layer today. The other
// components in the library (`dl-item-tooltip`, `dl-item-grid`, `dl-provider`,
// `dl-shop-panel`) are intentionally NOT declared — add them here only when
// the adapter layer starts rendering them, otherwise the surface area gives
// false impressions about what is supported.
declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'dl-item-card': {
        /** Numeric item ID. Use as `item-id={123}` or `item-id="123"`. */
        'item-id'?: number | string;
        /** Item class name slug (e.g. `"upgrade_metal_skin"`, `"upgrade_rupture"`). */
        'item-class-name'?: string;
        /** Visual variant: `"card"` | `"image"` | `"inline-image"` | `"inline-image-name"` | `"icon"` */
        variant?: string;
        /** Hover effect: `"none"` | `"scale"` */
        'hover-effect'?: string;
        /** Show tier badge on hover. */
        'show-tier-badge'?: boolean;
        /** Language override for item name only. */
        'item-name-language'?: string;
        /** Per-card tooltip trigger. `"hover"` | `"click"` | `"none"`. Required when no `<dl-provider>` ancestor exists; otherwise falls back to provider state. */
        'tooltip-trigger'?: string;
        class?: string;
        style?: string;
        [key: string]: unknown;
      };
    }
  }
}
