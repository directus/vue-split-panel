<script lang="ts">
export interface SplitPanelProps {
	/** Sets the split panel's orientation */
	orientation?: 'horizontal' | 'vertical';

	/** Sets the split panel's text direction */
	direction?: 'ltr' | 'rtl';

	/** If no primary panel is designated, both panels will resize proportionally when the host element is resized. If a primary panel is designated, it will maintain its size and the other panel will grow or shrink as needed when the panels component is resized */
	primary?: 'start' | 'end';

	/** The minimum allowed size of the primary panel. Accepts CSS like `"15px"` or `"5em"` */
	min?: string;

	/** The maximum allowed size of the primary panel. Accepts CSS like `"15px"` or `"5em"` */
	max?: string;

	/** The invisible region around the divider where dragging can occur. This is usually wider than the divider to facilitate easier dragging. */
	dividerHitArea?: string;

	/** Whether the size v-model should be in relative percentages or absolute pixels */
	sizeUnit?: '%' | 'px';

	/** Disable the manual resizing of the panels */
	disabled?: boolean;
}
</script>

<script lang="ts" setup>
import { clamp, useDraggable, useElementSize, useResizeObserver } from '@vueuse/core';
import { computed, onMounted, useTemplateRef, watch } from 'vue';
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
	direction: 'ltr',
});

const panelEl = useTemplateRef('split-panel');
const dividerEl = useTemplateRef('divider');

const { width: componentWidth, height: componentHeight } = useElementSize(panelEl);
const componentSize = computed(() => props.orientation === 'horizontal' ? componentWidth.value : componentHeight.value);

const { width: dividerWidth, height: dividerHeight } = useElementSize(dividerEl);
const dividerSize = computed(() => props.orientation === 'horizontal' ? dividerWidth.value : dividerHeight.value);

const { x: dividerX, y: dividerY } = useDraggable(dividerEl, { containerElement: panelEl });

/** Size of the primary panel in either percentages or pixels as defined by the sizeUnit property */
const primaryPanelSize = defineModel<number>('size', { default: 50 });

const primaryPanelSizePercentage = computed({
	get() {
		if (props.sizeUnit === '%') return primaryPanelSize.value;
		return pixelsToPercentage(componentSize.value, primaryPanelSize.value);
	},
	set(newValue: number) {
		if (props.sizeUnit === '%') {
			primaryPanelSize.value = newValue;
		}
		else {
			primaryPanelSize.value = percentageToPixels(componentSize.value, newValue);
		}
	},
});

const primaryPanelSizePixels = computed({
	get() {
		if (props.sizeUnit === 'px') return primaryPanelSize.value;
		return percentageToPixels(componentSize.value, primaryPanelSize.value);
	},
	set(newValue: number) {
		if (props.sizeUnit === 'px') {
			primaryPanelSize.value = newValue;
		}
		else {
			primaryPanelSize.value = pixelsToPercentage(componentSize.value, newValue);
		}
	},
});

let cachedPrimaryPanelSizePixels = 0;

onMounted(() => {
	cachedPrimaryPanelSizePixels = primaryPanelSizePixels.value;
});

watch([dividerX, dividerY], ([newX, newY]) => {
	if (props.disabled) return;

	let newPositionInPixels = props.orientation === 'horizontal' ? newX : newY;

	if (props.primary === 'end') {
		newPositionInPixels = componentSize.value - newPositionInPixels;
	}

	primaryPanelSizePercentage.value = clamp(pixelsToPercentage(componentSize.value, newPositionInPixels), 0, 100);
});

watch(primaryPanelSizePixels, (newPixels, oldPixels) => {
	if (newPixels === oldPixels) return;
	cachedPrimaryPanelSizePixels = newPixels;
});

useResizeObserver(panelEl, (entries) => {
	const entry = entries[0];
	const { width, height } = entry.contentRect;
	const size = props.orientation === 'horizontal' ? width : height;

	if (props.primary) {
		primaryPanelSizePercentage.value = pixelsToPercentage(size, cachedPrimaryPanelSizePixels);
	}
});

const gridTemplate = computed(() => {
	const primary = `clamp(0%, clamp(${props.min}, ${primaryPanelSizePercentage.value}%, ${props.max}), calc(100% - ${dividerSize.value}px))`;
	const secondary = 'auto';

	if (props.primary === 'start') {
		if (props.direction === 'ltr' || props.orientation === 'vertical') {
			return `${primary} ${dividerSize.value}px ${secondary}`;
		}
		else {
			return `${secondary} ${dividerSize.value}px ${primary}`;
		}
	}
	else {
		if (props.direction === 'ltr' || props.orientation === 'vertical') {
			return `${secondary} ${dividerSize.value}px ${primary}`;
		}
		else {
			return `${primary} ${dividerSize.value}px ${secondary}`;
		}
	}
});
</script>

<template>
	<div ref="split-panel" class="split-panel" :class="orientation">
		<div class="start">
			<slot name="start" />
		</div>
		<div ref="divider" class="divider" :class="[{ disabled }, orientation]">
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

	&.horizontal {
		grid-template-columns: v-bind(gridTemplate);
	}

	&.vertical {
		grid-template-rows: v-bind(gridTemplate);
	}
}

.start, .end {
	overflow: hidden;
}

.divider:not(.disabled) {
	position: relative;

	&::after {
		content: '';
		position: absolute;
	}

	&.horizontal {
		inline-size: max-content;
		block-size: 100%;

		&::after {
			block-size: 100%;
			inset-inline-start: calc(v-bind(dividerHitArea) / -2 + v-bind(dividerSize) * 1px / 2);
			inset-block-start: 0;
			inline-size: v-bind(dividerHitArea);
			cursor: ew-resize;
		}
	}

	&.vertical {
		inline-size: 100%;
		block-size: max-content;

		&::after {
			inline-size: 100%;
			inset-block-start: calc(v-bind(dividerHitArea) / -2 + v-bind(dividerSize) * 1px / 2);
			inset-inline-start: 0;
			block-size: v-bind(dividerHitArea);
			cursor: ns-resize;
		}
	}
}
</style>
