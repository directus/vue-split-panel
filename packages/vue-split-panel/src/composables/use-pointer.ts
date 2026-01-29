import { clamp, useDraggable } from "@vueuse/core";
import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";
import { toValue, watch } from "vue";
import type { Direction, Orientation, Primary } from "../types";
import { closestNumber } from "../utils/closest-number";
import { pixelsToPercentage } from "../utils/pixels-to-percentage";

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
	minSizePixels: ComputedRef<number>;
	snapPixels: ComputedRef<number[]>;
}

export const usePointer = (
	collapsed: Ref<boolean>,
	sizePercentage: Ref<number>,
	sizePixels: Ref<number>,
	options: UsePointerOptions,
) => {
	const {
		x: dividerX,
		y: dividerY,
		isDragging,
	} = useDraggable(options.dividerEl, { containerElement: options.panelEl });

	let thresholdLocation: "expand" | "collapse" = collapsed.value ? "expand" : "collapse";

	watch([dividerX, dividerY], ([newX, newY]) => {
		if (toValue(options.disabled)) return;

		let newPositionInPixels = toValue(options.orientation) === "horizontal" ? newX : newY;

		if (toValue(options.orientation) === "horizontal" && toValue(options.direction) === "rtl") {
			newPositionInPixels = options.componentSize.value - newPositionInPixels;
		}

		if (toValue(options.primary) === "end") {
			newPositionInPixels = options.componentSize.value - newPositionInPixels;
		}

		if (toValue(options.collapsible) && toValue(options.collapseThreshold) !== undefined) {
			let threshold: number;

			if (thresholdLocation === "collapse")
				threshold = options.minSizePixels.value - (toValue(options.collapseThreshold) ?? 0);
			else threshold = toValue(options.collapseThreshold) ?? 0;

			if (newPositionInPixels < threshold && collapsed.value === false) {
				collapsed.value = true;
			} else if (newPositionInPixels > threshold && collapsed.value === true) {
				collapsed.value = false;
			}
		}

		for (const snapPoint of options.snapPixels.value) {
			if (
				newPositionInPixels >= snapPoint - toValue(options.snapThreshold) &&
				newPositionInPixels <= snapPoint + toValue(options.snapThreshold)
			) {
				newPositionInPixels = snapPoint;
			}
		}

		sizePercentage.value = clamp(
			pixelsToPercentage(options.componentSize.value, newPositionInPixels),
			0,
			100,
		);
	});

	watch(isDragging, (newDragging) => {
		if (newDragging === false) {
			thresholdLocation = collapsed.value ? "expand" : "collapse";
		}
	});

	const handleDblClick = () => {
		const closest = closestNumber(options.snapPixels.value, sizePixels.value);

		if (closest !== undefined) {
			sizePixels.value = closest;
		}

		if (collapsed.value === true) {
			collapsed.value = false;
		}
	};

	return { handleDblClick, isDragging };
};
