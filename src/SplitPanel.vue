<script lang="ts">
export interface SplitPanelProps {
	/** Sets the split panel's orientation. */
	orientation?: 'horizontal' | 'vertical';

	/** If no primary panel is designated, both panels will resize proportionally when the host element is resized. If a primary panel is designated, it will maintain its size and the other panel will grow or shrink as needed when the host element is resized. */
	primary?: 'start' | 'end';

	/** One or more space-separated values at which the divider should snap. Values can be in pixels or percentages, e.g. `["100px", "50%"]` */
	snap?: string[];

	/** How close the divider must be to a snap point until snapping occurs. */
	snapThreshold?: number;

	/** The minimum allowed size of the primary panel. */
	min?: string;

	/** The maximum allowed size of the primary panel. */
	max?: string;

	/** The invisible region around the divider where dragging can occur. This is usually wider than the divider to facilitate easier dragging. */
	dividerHitArea?: string;
}

export interface SplitPanelEmits {
	reposition: [];
}
</script>

<script lang="ts" setup>
import { clamp, useDraggable, useElementSize, useResizeObserver } from '@vueuse/core';
import { computed, defineProps, onMounted, useTemplateRef, watch, withDefaults } from 'vue';
import { percentageToPixels } from './utils/percentage-to-pixels';
import { pixelsToPercentage } from './utils/pixels-to-percentage';

const props = withDefaults(defineProps<SplitPanelProps>(), {
	position: 50,
	orientation: 'horizontal',
	disabled: false,
	snapThreshold: 12,
	min: '0',
	max: '100%',
	dividerHitArea: '12px',
});

const panelEl = useTemplateRef('split-panel');
const dividerEl = useTemplateRef('divider');

const { width: panelsWidth } = useElementSize(panelEl);
const { width: dividerWidth } = useElementSize(dividerEl);
const { x: dividerX } = useDraggable(dividerEl, { containerElement: panelEl });

/** The current position of the divider from the primary panel's edge as a percentage 0-100. Defaults to 50% of the container's initial size. */
const position = defineModel<number>('position', { default: 50 });

/** The current position of the divider from the primary panel's edge in pixels. */
const positionInPixels = defineModel<number>('positionInPixels', { default: 0 });

let cachedPositionInPixels = 0;

onMounted(() => {
	cachedPositionInPixels = percentageToPixels(panelsWidth.value, position.value);
});

watch(dividerX, (newX) => {
	position.value = clamp(pixelsToPercentage(panelsWidth.value, newX), 0, 100);
});

watch(position, (newPos, oldPos) => {
	if (newPos === oldPos) return;

	const pixels = percentageToPixels(panelsWidth.value, newPos);
	cachedPositionInPixels = pixels;
	positionInPixels.value = pixels;
});

useResizeObserver(panelEl, (entries) => {
	const entry = entries[0];
	const { width } = entry.contentRect;

	if (props.primary) {
		position.value = pixelsToPercentage(width, cachedPositionInPixels);
	}
});

// TODO LTR support
const gridTemplate = computed(() => {
	const primary = `clamp(0%, clamp(${props.min}, ${position.value}%, ${props.max}), calc(100% - ${dividerWidth.value}px))`;

	const secondary = 'auto';

	return `${primary} ${dividerWidth.value}px ${secondary}`;
});
</script>

<template>
	<div ref="split-panel" class="split-panel">
		<slot name="start" />
		<div ref="divider" class="divider">
			<slot name="divider" />
		</div>
		<slot name="end" />
	</div>
</template>

<style scoped>
.split-panel {
	display: grid;
	grid-template-columns: v-bind(gridTemplate);
}

.divider {
	width: max-content;
	position: relative;

	&::after {
		content: '';
		position: absolute;
		block-size: 100%;
		inset-inline-start: calc(v-bind(dividerHitArea) / -2 + v-bind(dividerHitArea) / 2);
		inline-size: v-bind(dividerHitArea);
	}
}
</style>
