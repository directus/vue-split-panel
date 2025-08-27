<script lang="ts" setup>
import type { SplitPanelProps } from './types';
import { useTemplateRef } from 'vue';
import { useCollapse } from './composables/use-collapse';
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
	minSizePercentage,
	maxSizePercentage,
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

const { onTransitionEnd, collapseTransitionState, toggle, expand, collapse } = useCollapse(collapsed, sizePercentage, emits);

defineExpose({ collapse, expand, toggle });
</script>

<template>
	<div
		ref="split-panel"
		class="sp-root"
		:class="[
			`sp-${orientation}`,
			`sp-${collapseTransitionState}`,
			{ 'sp-collapsed': collapsed, 'sp-dragging': isDragging },
		]"
		data-testid="root"
		@transitionend="onTransitionEnd"
	>
		<div class="sp-start" :class="ui?.start" data-testid="start">
			<slot name="start" />
		</div>
		<div
			ref="divider"
			class="sp-divider"
			:class="[{ 'sp-disabled': disabled }, `sp-${orientation}`, ui?.divider]"
			:tabindex="disabled ? undefined : 0"
			role="separator"
			:aria-valuenow="sizePercentage"
			aria-valuemin="0"
			aria-valuemax="100"
			aria-label="Resize"
			data-testid="divider"
			@keydown="handleKeydown"
			@dblclick="handleDblClick"
		>
			<slot name="divider">
				<div />
			</slot>
		</div>
		<div class="sp-end" :class="ui?.end" data-testid="end">
			<slot name="end" />
		</div>
	</div>
</template>

<style scoped>
.sp-root {
	display: grid;

	&.sp-horizontal {
		transition-property: grid-template-columns;
		grid-template-columns: v-bind(gridTemplate);

		&.sp-dragging {
			cursor: ew-resize;
		}
	}

	&.sp-vertical {
		grid-template-rows: v-bind(gridTemplate);
		transition-property: grid-template-rows;

		&.sp-dragging {
			cursor: ns-resize;
		}
	}

	&.sp-dragging {
		user-select: none;
	}

	&.sp-collapsing {
		transition-duration: v-bind(transitionDuration);
		transition-timing-function: v-bind(transitionTimingFunctionCollapse);
	}

	&.sp-expanding {
		transition-duration: v-bind(transitionDuration);
		transition-timing-function: v-bind(transitionTimingFunctionExpand);
	}
}

.sp-start, .sp-end {
	overflow: hidden;
}

.sp-divider {
	position: relative;
	z-index: 1;

	&:not(.disabled) {
		& :deep(> :first-child) {
			&::after {
				content: '';
				position: absolute;
			}
		}

		&.sp-horizontal {
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

		&.sp-vertical {
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
