import { defineCustomElements } from '@deadlock-api/ui-core/loader';
import { Show } from 'solid-js';
import type { ItemTooltipProps } from './types';

// Register <dl-item-tooltip> and sibling custom elements once at module load time.
defineCustomElements();

export default function ItemTooltip(props: ItemTooltipProps) {
  return <Show when={props.itemId}>{(id) => <dl-item-tooltip item-class-name={id()} />}</Show>;
}
