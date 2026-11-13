import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";
import type { Orientation, Primary } from "../types";
import { computed, toValue } from "vue";

export interface UseGridTemplateOptions {
	collapsed: Ref<boolean>;
	minSizePercentage: ComputedRef<number | undefined>;
	maxSizePercentage: ComputedRef<number | undefined>;
	sizePercentage: ComputedRef<number>;
	dividerSize: ComputedRef<number>;
	primary: MaybeRefOrGetter<Primary | undefined>;
	orientation: MaybeRefOrGetter<Orientation>;
	collapsedSizePercentage: ComputedRef<number>;
}

export const useGridTemplate = (options: UseGridTemplateOptions) => {
	const gridTemplate = computed(() => {
		let primary: string;

		if (options.collapsed.value) {
			primary = `${options.collapsedSizePercentage.value}%`;
		} else if (
			options.minSizePercentage.value !== undefined &&
			options.maxSizePercentage.value !== undefined
		) {
			primary = `clamp(0%, clamp(${options.minSizePercentage.value}%, ${options.sizePercentage.value}%, ${options.maxSizePercentage.value}%), calc(100% - ${options.dividerSize.value}px))`;
		} else if (options.minSizePercentage.value !== undefined) {
			// clamp() lets the minimum beat the maximum, so an oversized minSize would push the divider past the container edge
			primary = `clamp(min(${options.minSizePercentage.value}%, calc(100% - ${options.dividerSize.value}px)), ${options.sizePercentage.value}%, calc(100% - ${options.dividerSize.value}px))`;
		} else {
			primary = `clamp(0%, ${options.sizePercentage.value}%, calc(100% - ${options.dividerSize.value}px))`;
		}

		const secondary = "auto";

		if (!toValue(options.primary) || toValue(options.primary) === "start") {
			return `${primary} ${options.dividerSize.value}px ${secondary}`;
		} else {
			return `${secondary} ${options.dividerSize.value}px ${primary}`;
		}
	});

	return { gridTemplate };
};
