import { defineCustomElements } from '@deadlock-api/ui-core/loader';
import { createSignal } from 'solid-js';
import type { ItemCardProps } from './types';

// Register <dl-item-card> and sibling custom elements once at module load time.
// Stencil's defineCustomElements is idempotent — safe to import from multiple
// modules (subsequent calls are no-ops once the registry entry exists).
defineCustomElements();

export default function ItemCard(props: ItemCardProps) {
  const [isActive, setIsActive] = createSignal(false);

  const cardClass = () => {
    const parts: string[] = [];
    if (props.class) parts.push(props.class);
    if (isActive()) parts.push('is-active');
    return parts.join(' ') || undefined;
  };

  return (
    <dl-item-card
      item-class-name={props.itemId}
      tooltip-trigger="hover"
      class={cardClass()}
      onClick={() => setIsActive((a) => !a)}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') setIsActive((a) => !a);
      }}
    />
  );
}
