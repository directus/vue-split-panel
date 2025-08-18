<script lang="ts">
export interface SplitPanelProps {
	/** Sets the split panel's orientation */
	orientation?: 'horizontal' | 'vertical';

	/** Sets the split panel's text direction */
	direction?: 'ltr' | 'rtl';

	/** If no primary panel is designated, both panels will resize proportionally when the host element is resized. If a primary panel is designated, it will maintain its size and the other panel will grow or shrink as needed when the panels component is resized */
	primary?: 'start' | 'end';

	/** The invisible region around the divider where dragging can occur. This is usually wider than the divider to facilitate easier dragging. CSS value */
	dividerHitArea?: string;

	/** Whether the size v-model should be in relative percentages or absolute pixels */
	sizeUnit?: '%' | 'px';

	/** Disable the manual resizing of the panels */
	disabled?: boolean;

	/** The minimum allowed size of the primary panel */
	minSize?: number;

	/** The maximum allowed size of the primary panel */
	maxSize?: number;

	/** Whether to allow the primary panel to be collapsed on enter key on divider or when the collapse threshold is met */
	collapsible?: boolean;

	/** How far to drag beyond the minSize to collapse/expand the primary panel */
	collapseThreshold?: number;
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
	minSize: 0,
	maxSize: 100,
	dividerHitArea: '12px',
	sizeUnit: '%',
	direction: 'ltr',
	collapsible: false,
});

const panelEl = useTemplateRef('split-panel');
const dividerEl = useTemplateRef('divider');

const { width: componentWidth, height: componentHeight } = useElementSize(panelEl);
const componentSize = computed(() => props.orientation === 'horizontal' ? componentWidth.value : componentHeight.value);

const { width: dividerWidth, height: dividerHeight } = useElementSize(dividerEl);
const dividerSize = computed(() => props.orientation === 'horizontal' ? dividerWidth.value : dividerHeight.value);

/** Size of the primary panel in either percentages or pixels as defined by the sizeUnit property */
const size = defineModel<number>('size', { default: 50 });

const sizePercentage = computed({
	get() {
		if (props.sizeUnit === '%') return size.value;
		return pixelsToPercentage(componentSize.value, size.value);
	},
	set(newValue: number) {
		if (props.sizeUnit === '%') {
			size.value = newValue;
		}
		else {
			size.value = percentageToPixels(componentSize.value, newValue);
		}
	},
});

const sizePixels = computed({
	get() {
		if (props.sizeUnit === 'px') return size.value;
		return percentageToPixels(componentSize.value, size.value);
	},
	set(newValue: number) {
		if (props.sizeUnit === 'px') {
			size.value = newValue;
		}
		else {
			size.value = pixelsToPercentage(componentSize.value, newValue);
		}
	},
});

const minSizePercentage = computed(() => {
	if (props.minSize === undefined) return;

	if (props.sizeUnit === '%') return props.minSize;
	return pixelsToPercentage(componentSize.value, props.minSize);
});

const minSizePixels = computed(() => {
	if (props.minSize === undefined) return;

	if (props.sizeUnit === 'px') return props.minSize;
	return percentageToPixels(componentSize.value, props.minSize);
});

const maxSizePercentage = computed(() => {
	if (props.maxSize === undefined) return;

	if (props.sizeUnit === '%') return props.maxSize;
	return pixelsToPercentage(componentSize.value, props.maxSize);
});

const maxSizePixels = computed(() => {
	if (props.maxSize === undefined) return;

	if (props.sizeUnit === 'px') return props.maxSize;
	return percentageToPixels(componentSize.value, props.maxSize);
});

let expandedSizePercentage = 0;

/** Whether the primary column is collapsed or not */
const collapsed = defineModel<boolean>('collapsed', { default: false });

watch(collapsed, (newCollapsed) => {
	if (newCollapsed === true) {
		expandedSizePercentage = sizePercentage.value;
		sizePercentage.value = 0;
	}
	else {
		sizePercentage.value = expandedSizePercentage;
	}
});

let cachedSizePixels = 0;

onMounted(() => {
	cachedSizePixels = sizePixels.value;
});

const { x: dividerX, y: dividerY } = useDraggable(dividerEl, { containerElement: panelEl });

watch([dividerX, dividerY], ([newX, newY]) => {
	if (props.disabled) return;

	let newPositionInPixels = props.orientation === 'horizontal' ? newX : newY;

	if (props.primary === 'end') {
		newPositionInPixels = componentSize.value - newPositionInPixels;
	}

	// if (props.collapsible && props.minSize !== undefined && props.collapseThreshold !== undefined) {
	// 	const threshold = props.minSize - (props.collapseThreshold ?? 0);

	// 	console.log(threshold, newPositionInPixels);

	// 	if (newPositionInPixels < threshold) {
	// 		collapsed.value = true;
	// 	}
	// }

	sizePercentage.value = clamp(pixelsToPercentage(componentSize.value, newPositionInPixels), 0, 100);
});

watch(sizePixels, (newPixels, oldPixels) => {
	if (newPixels === oldPixels) return;
	cachedSizePixels = newPixels;
});

useResizeObserver(panelEl, (entries) => {
	const entry = entries[0];
	const { width, height } = entry.contentRect;
	const size = props.orientation === 'horizontal' ? width : height;

	if (props.primary) {
		sizePercentage.value = pixelsToPercentage(size, cachedSizePixels);
	}
});

const handleKeydown = (event: KeyboardEvent) => {
	if (props.disabled) return;

	if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'].includes(event.key)) {
		let newPosition = sizePercentage.value;

		const increment = (event.shiftKey ? 10 : 1) * (props.primary === 'end' ? -1 : 1);

		if (
			(event.key === 'ArrowLeft' && props.orientation === 'horizontal')
			|| (event.key === 'ArrowUp' && props.orientation === 'vertical')
		) {
			newPosition -= increment;
		}

		if (
			(event.key === 'ArrowRight' && props.orientation === 'horizontal')
			|| (event.key === 'ArrowDown' && props.orientation === 'vertical')
		) {
			newPosition += increment;
		}

		if (event.key === 'Home') {
			newPosition = props.primary === 'end' ? 100 : 0;
		}

		if (event.key === 'End') {
			newPosition = props.primary === 'end' ? 0 : 100;
		}

		sizePercentage.value = clamp(newPosition, 0, 100);
	}
};

const gridTemplate = computed(() => {
	const primary = `clamp(0%, clamp(${minSizePercentage.value}%, ${sizePercentage.value}%, ${maxSizePercentage.value}%), calc(100% - ${dividerSize.value}px))`;
	const secondary = 'auto';

	if (!props.primary || props.primary === 'start') {
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

const collapse = () => collapsed.value = true;
const expand = () => collapsed.value = false;
const toggle = (val: boolean) => collapsed.value = val;

defineExpose({ collapse, expand, toggle });
</script>

<template>
	<div ref="split-panel" class="split-panel" :class="[orientation, { collapsed }]">
		<div class="start">
			<slot name="start" />
		</div>
		<div
			ref="divider"
			class="divider"
			:class="[{ disabled }, orientation]"
			:tabindex="disabled ? undefined : 0"
			role="separator"
			:aria-valuenow="sizePercentage"
			aria-valuemin="0"
			aria-valuemax="100"
			aria-label="Resize"
			@keydown.prevent="handleKeydown"
		>
			<slot name="divider">
				<div />
			</slot>
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

	& :deep(> :first-child) {
		&::after {
			content: '';
			position: absolute;
		}
	}

	&.horizontal {
		block-size: 100%;
		inline-size: 0;

		& :deep(> :first-child)::after {
			block-size: 100%;
			inset-inline-start: calc(v-bind(dividerHitArea) / -2 + v-bind(dividerSize) * 1px / 2);
			inset-block-start: 0;
			inline-size: v-bind(dividerHitArea);
			cursor: ew-resize;
		}
	}

	&.vertical {
		inline-size: 100%;
		block-size: 0;

		& :deep(> :first-child)::after {
			inline-size: 100%;
			inset-block-start: calc(v-bind(dividerHitArea) / -2 + v-bind(dividerSize) * 1px / 2);
			inset-inline-start: 0;
			block-size: v-bind(dividerHitArea);
			cursor: ns-resize;
		}
	}
}
</style>
