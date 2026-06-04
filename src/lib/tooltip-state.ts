import { createSignal } from 'solid-js';

// Module-level signal — single source of truth for the global item tooltip.
// Only one <ItemTooltip> exists (mounted at AppShell level); this signal drives it.
const [hoveredItem, setHoveredItem] = createSignal<string | null>(null);

export { hoveredItem, setHoveredItem };
