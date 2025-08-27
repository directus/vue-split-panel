import type { MaybeRefOrGetter } from '@vueuse/core';
import type { ComputedRef, Ref } from 'vue';
import type { Direction, Orientation, Primary } from '../types';
import { clamp, useDraggable } from '@vueuse/core';
import { toValue, watch } from 'vue';
import { closestNumber } from '../utils/closest-number';
import { pixelsToPercentage } from '../utils/pixels-to-percentage';

export interface UsePointerOptions {
	disabled: MaybeRefOrGetter<boolean>;
	collapsible: MaybeRefOrGetter<boolean>;
	primary: MaybeRefOrGetter<Primary | undefined>;
	orientation: MaybeRefOrGetter<Orientation>;
	direction: MaybeRefOrGetter<Direction>;
	collapseThreshold: MaybeRefOrGetter<number | undefined>;
	snapThreshold: MaybeRefOrGetter<number>;
	dividerEl: MaybeRefOrGetter<HTMLElement | null>;
	panelEl: MaybeRefOrGetter<HTMLElement | null>;
	componentSize: ComputedRef<number>;
	minSizePixels: ComputedRef<number | undefined>;
	snapPixels: ComputedRef<number[]>;
}

export const usePointer = (collapsed: Ref<boolean>, sizePercentage: Ref<number>, sizePixels: Ref<number>, options: UsePointerOptions) => {
	const { x: dividerX, y: dividerY, isDragging } = useDraggable(options.dividerEl, { containerElement: options.panelEl });

	let thresholdLocation: 'expand' | 'collapse' = collapsed.value ? 'expand' : 'collapse';

	watch([dividerX, dividerY], ([newX, newY]) => {
		if (toValue(options.disabled)) return;

		let newPositionInPixels = toValue(options.orientation) === 'horizontal' ? newX : newY;

		if (toValue(options.primary) === 'end') {
			newPositionInPixels = options.componentSize.value - newPositionInPixels;
		}

		if (toValue(options.collapsible) && options.minSizePixels.value !== undefined && toValue(options.collapseThreshold) !== undefined) {
			let threshold: number;

			if (thresholdLocation === 'collapse') threshold = options.minSizePixels.value - (toValue(options.collapseThreshold) ?? 0);
			else threshold = (toValue(options.collapseThreshold) ?? 0);

			if (newPositionInPixels < threshold && collapsed.value === false) {
				collapsed.value = true;
			}
			else if (newPositionInPixels > threshold && collapsed.value === true) {
				collapsed.value = false;
			}
		}

		for (let snapPoint of options.snapPixels.value) {
			if (toValue(options.direction) === 'rtl' && toValue(options.orientation) === 'horizontal') {
				snapPoint = options.componentSize.value - snapPoint;
			}

			if (
				newPositionInPixels >= snapPoint - toValue(options.snapThreshold)
				&& newPositionInPixels <= snapPoint + toValue(options.snapThreshold)
			) {
				newPositionInPixels = snapPoint;
			}
		}

		sizePercentage.value = clamp(pixelsToPercentage(options.componentSize.value, newPositionInPixels), 0, 100);
	});

	watch(isDragging, (newDragging) => {
		if (newDragging === false) {
			thresholdLocation = collapsed.value ? 'expand' : 'collapse';
		}
	});

	const handleDblClick = () => {
		const closest = closestNumber(options.snapPixels.value, sizePixels.value);

		if (closest !== undefined) {
			sizePixels.value = closest;
		}
	};

	return { handleDblClick, isDragging };
};
