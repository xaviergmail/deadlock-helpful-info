/// <reference types="vite/client" />

// `export {}` makes this a TypeScript module so that `declare module 'solid-js'`
// below is a module AUGMENTATION (merges with solid-js types) rather than an
// ambient declaration (which would replace all solid-js exports entirely).
export {};

// JSX intrinsic element declarations for @deadlock-api/ui-core web components.
// These are KEPT after the spike — they are the foundation for the adapter layer.
declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'dl-item-card': {
        /** Numeric item ID. Use as `item-id={123}` or `item-id="123"`. */
        'item-id'?: number | string;
        /** Item class name slug (e.g. `"decay"`, `"metal_skin"`). */
        'item-class-name'?: string;
        /** Visual variant: `"card"` | `"image"` | `"inline-image"` | `"inline-image-name"` | `"icon"` */
        variant?: string;
        /** Hover effect: `"none"` | `"scale"` */
        'hover-effect'?: string;
        /** Show tier badge on hover. */
        'show-tier-badge'?: boolean;
        /** Language override for item name only. */
        'item-name-language'?: string;
        class?: string;
        style?: string;
        [key: string]: unknown;
      };
      'dl-item-tooltip': {
        /** Numeric item ID. */
        'item-id'?: number | string;
        /** Item class name slug. */
        'item-class-name'?: string;
        class?: string;
        style?: string;
        [key: string]: unknown;
      };
      'dl-item-grid': {
        /** Filter by slot type: `"weapon"` | `"vitality"` | `"spirit"` */
        'slot-type'?: string;
        /** Filter by tier (1–4). */
        tier?: number | string;
        /** Only show shopable items. */
        'shopable-only'?: boolean;
        class?: string;
        style?: string;
        [key: string]: unknown;
      };
      'dl-provider': {
        /** Language code for localized item names. */
        language?: string;
        /** Global tooltip trigger: `"hover"` | `"click"` | `"none"` */
        'tooltip-trigger'?: string;
        /** Show tier badge globally. */
        'show-tier-badge'?: boolean;
        class?: string;
        style?: string;
        [key: string]: unknown;
      };
      'dl-shop-panel': {
        class?: string;
        style?: string;
        [key: string]: unknown;
      };
    }
  }
}
