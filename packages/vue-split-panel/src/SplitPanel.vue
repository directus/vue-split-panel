<script lang="ts" setup>
import type { SplitPanelProps } from './types';
import { ref, useTemplateRef, watch } from 'vue';
import { useGridTemplate } from './composables/use-grid-template';
import { useKeyboard } from './composables/use-keyboard';
import { usePointer } from './composables/use-pointer';
import { useResize } from './composables/use-resize';
import { useSizes } from './composables/use-sizes';

const props = withDefaults(defineProps<SplitPanelProps>(), {
	orientation: 'horizontal',
	disabled: false,
	minSize: 0,
	dividerHitArea: '12px',
	sizeUnit: '%',
	direction: 'ltr',
	collapsible: false,
	transitionDuration: '0',
	transitionTimingFunctionCollapse: 'cubic-bezier(0.4, 0, 0.6, 1)',
	transitionTimingFunctionExpand: 'cubic-bezier(0, 0, 0.2, 1)',
	snapPoints: () => [],
	snapThreshold: 12,
});

const emits = defineEmits<{
	transitionend: [event: TransitionEvent];
}>();

/** Size of the primary panel in either percentages or pixels as defined by the sizeUnit property */
const size = defineModel<number>('size', { default: 50 });

/** Whether the primary column is collapsed or not */
const collapsed = defineModel<boolean>('collapsed', { default: false });

const panelEl = useTemplateRef('split-panel');
const dividerEl = useTemplateRef('divider');

let expandedSizePercentage = 0;

const collapseTransitionState = ref<null | 'expanding' | 'collapsing'>(null);

const {
	sizePercentage,
	sizePixels,
	maxSizePercentage,
	minSizePercentage,
	minSizePixels,
	componentSize,
	dividerSize,
	snapPixels,
} = useSizes(size, {
	disabled: () => props.disabled,
	collapsible: () => props.collapsible,
	primary: () => props.primary,
	orientation: () => props.orientation,
	sizeUnit: () => props.sizeUnit,
	minSize: () => props.minSize,
	maxSize: () => props.maxSize,
	snapPoints: () => props.snapPoints,
	panelEl,
	dividerEl,
});

const { handleKeydown } = useKeyboard(sizePercentage, collapsed, {
	disabled: () => props.disabled,
	collapsible: () => props.collapsible,
	primary: () => props.primary,
	orientation: () => props.orientation,
});

const { isDragging, handleDblClick } = usePointer(collapsed, sizePercentage, sizePixels, {
	collapseThreshold: () => props.collapseThreshold,
	collapsible: () => props.collapsible,
	direction: () => props.direction,
	disabled: () => props.disabled,
	orientation: () => props.orientation,
	primary: () => props.primary,
	snapThreshold: () => props.snapThreshold,
	panelEl,
	dividerEl,
	minSizePixels,
	componentSize,
	snapPixels,
});

const { gridTemplate } = useGridTemplate({
	collapsed,
	direction: () => props.direction,
	dividerSize,
	maxSizePercentage,
	minSizePercentage,
	orientation: () => props.orientation,
	primary: () => props.primary,
	sizePercentage,
});

useResize(sizePercentage, {
	sizePixels,
	panelEl,
	orientation: () => props.orientation,
	primary: () => props.primary,
});

const onTransitionEnd = (event: TransitionEvent) => {
	collapseTransitionState.value = null;
	emits('transitionend', event);
};

watch(collapsed, (newCollapsed) => {
	if (newCollapsed === true) {
		expandedSizePercentage = sizePercentage.value;
		sizePercentage.value = 0;
		collapseTransitionState.value = 'collapsing';
	}
	else {
		sizePercentage.value = expandedSizePercentage;
		collapseTransitionState.value = 'expanding';
	}
});

const collapse = () => collapsed.value = true;
const expand = () => collapsed.value = false;
const toggle = (val: boolean) => collapsed.value = val;

defineExpose({ collapse, expand, toggle });
</script>

<template>
	<div ref="split-panel" class="split-panel" :class="[orientation, collapseTransitionState, { collapsed, dragging: isDragging }]" @transitionend="onTransitionEnd">
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
			@keydown="handleKeydown"
			@dblclick="handleDblClick"
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
		transition-property: grid-template-columns;
		grid-template-columns: v-bind(gridTemplate);

		&.dragging {
			cursor: ew-resize;
		}
	}

	&.vertical {
		grid-template-rows: v-bind(gridTemplate);
		transition-property: grid-template-rows;

		&.dragging {
			cursor: ns-resize;
		}
	}

	&.dragging {
		user-select: none;
	}

	&.collapsing {
		transition-duration: v-bind(transitionDuration);
		transition-timing-function: v-bind(transitionTimingFunctionCollapse);
	}

	&.expanding {
		transition-duration: v-bind(transitionDuration);
		transition-timing-function: v-bind(transitionTimingFunctionExpand);
	}
}

.start, .end {
	overflow: hidden;
}

.divider {
	position: relative;
	z-index: 1;

	&:not(.disabled) {
		& :deep(> :first-child) {
			&::after {
				content: '';
				position: absolute;
			}
		}

		&.horizontal {
			block-size: 100%;
			inline-size: max-content;

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
			block-size: max-content;

			& :deep(> :first-child)::after {
				inline-size: 100%;
				inset-block-start: calc(v-bind(dividerHitArea) / -2 + v-bind(dividerSize) * 1px / 2);
				inset-inline-start: 0;
				block-size: v-bind(dividerHitArea);
				cursor: ns-resize;
			}
		}
	}
}
</style>
