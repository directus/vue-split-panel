<script lang="ts">
export interface SplitPanelProps {
	/** Sets the split panel's direction. */
	direction?: 'horizontal' | 'vertical';

	/** If no primary panel is designated, both panels will resize proportionally when the host element is resized. If a primary panel is designated, it will maintain its size and the other panel will grow or shrink as needed when the host element is resized. */
	primary?: 'start' | 'end';

	/** The minimum allowed size of the primary panel. */
	min?: string;

	/** The maximum allowed size of the primary panel. */
	max?: string;

	/** The invisible region around the divider where dragging can occur. This is usually wider than the divider to facilitate easier dragging. */
	dividerHitArea?: string;

	sizeUnit?: '%' | 'px';
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
	sizeUnit: '%',
});

const panelEl = useTemplateRef('split-panel');
const dividerEl = useTemplateRef('divider');

const { width: panelsWidth } = useElementSize(panelEl);
const { width: dividerWidth } = useElementSize(dividerEl);
const { x: dividerX } = useDraggable(dividerEl, { containerElement: panelEl });

const size = defineModel<number>('size', { default: 50 });

const sizePercentage = computed({
	get() {
		if (props.sizeUnit === '%') return size.value;
		return pixelsToPercentage(panelsWidth.value, size.value);
	},
	set(newValue: number) {
		if (props.sizeUnit === '%') {
			size.value = newValue;
		}
		else {
			size.value = percentageToPixels(panelsWidth.value, newValue);
		}
	},
});

const sizePixels = computed({
	get() {
		if (props.sizeUnit === 'px') return size.value;
		return percentageToPixels(panelsWidth.value, size.value);
	},
	set(newValue: number) {
		if (props.sizeUnit === 'px') {
			size.value = newValue;
		}
		else {
			size.value = pixelsToPercentage(panelsWidth.value, newValue);
		}
	},
});

let cachedSizePx = 0;

onMounted(() => {
	cachedSizePx = sizePixels.value;
});

watch(dividerX, (newX) => {
	sizePercentage.value = clamp(pixelsToPercentage(panelsWidth.value, newX), 0, 100);
});

watch(sizePixels, (newPixels, oldPixels) => {
	if (newPixels === oldPixels) return;
	cachedSizePx = newPixels;
});

useResizeObserver(panelEl, (entries) => {
	const entry = entries[0];
	const { width } = entry.contentRect;

	if (props.primary) {
		sizePercentage.value = pixelsToPercentage(width, cachedSizePx);
	}
});

// TODO LTR support
const gridTemplate = computed(() => {
	const primary = `clamp(0%, clamp(${props.min}, ${sizePercentage.value}%, ${props.max}), calc(100% - ${dividerWidth.value}px))`;

	const secondary = 'auto';

	return `${primary} ${dividerWidth.value}px ${secondary}`;
});
</script>

<template>
	<div ref="split-panel" class="split-panel">
		<div class="start">
			<slot name="start" />
		</div>
		<div ref="divider" class="divider">
			<slot name="divider" />
		</div>
		<div class="end">
			<slot name="end" />
		</div>
	</div>
</template>

<style scoped>
.split-panel {
	display: grid;
	grid-template-columns: v-bind(gridTemplate);
}

.start, .end {
	overflow: hidden;
}

.divider {
	width: max-content;
	position: relative;

	&::after {
		content: '';
		position: absolute;
		block-size: 100%;
		inset-inline-start: calc(v-bind(dividerHitArea) / -2 + v-bind(dividerWidth) * 1px / 2);
		inline-size: v-bind(dividerHitArea);
		cursor: ew-resize;
	}
}
</style>
