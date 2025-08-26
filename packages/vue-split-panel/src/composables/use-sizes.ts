import type { MaybeComputedElementRef } from '@vueuse/core';
import type { MaybeRefOrGetter, Ref } from 'vue';
import type { Orientation, Primary, SizeUnit } from '../types';
import { useElementSize } from '@vueuse/core';
import { computed, toValue } from 'vue';
import { percentageToPixels } from '../utils/percentage-to-pixels';
import { pixelsToPercentage } from '../utils/pixels-to-percentage';

export interface UseSizesOptions {
	disabled: MaybeRefOrGetter<boolean>;
	collapsible: MaybeRefOrGetter<boolean>;
	primary: MaybeRefOrGetter<Primary | undefined>;
	orientation: MaybeRefOrGetter<Orientation>;
	sizeUnit: MaybeRefOrGetter<SizeUnit>;
	minSize: MaybeRefOrGetter<number>;
	maxSize: MaybeRefOrGetter<number | undefined>;
	snapPoints: MaybeRefOrGetter<number[]>;
	panelEl: MaybeComputedElementRef;
	dividerEl: MaybeComputedElementRef;
}

export const useSizes = (size: Ref<number>, options: UseSizesOptions) => {
	const { width: componentWidth, height: componentHeight } = useElementSize(options.panelEl);
	const componentSize = computed(() => toValue(options.orientation) === 'horizontal' ? componentWidth.value : componentHeight.value);

	const { width: dividerWidth, height: dividerHeight } = useElementSize(options.dividerEl);
	const dividerSize = computed(() => toValue(options.orientation) === 'horizontal' ? dividerWidth.value : dividerHeight.value);

	const sizePercentage = computed({
		get() {
			if (toValue(options.sizeUnit) === '%') return size.value;
			return pixelsToPercentage(componentSize.value, size.value);
		},
		set(newValue: number) {
			if (toValue(options.sizeUnit) === '%') {
				size.value = newValue;
			}
			else {
				size.value = percentageToPixels(componentSize.value, newValue);
			}
		},
	});

	const sizePixels = computed({
		get() {
			if (toValue(options.sizeUnit) === 'px') return size.value;
			return percentageToPixels(componentSize.value, size.value);
		},
		set(newValue: number) {
			if (toValue(options.sizeUnit) === 'px') {
				size.value = newValue;
			}
			else {
				size.value = pixelsToPercentage(componentSize.value, newValue);
			}
		},
	});

	const minSizePercentage = computed(() => {
		if (toValue(options.minSize) === undefined) return;

		if (toValue(options.sizeUnit) === '%') return toValue(options.minSize);
		return pixelsToPercentage(componentSize.value, toValue(options.minSize));
	});

	const minSizePixels = computed(() => {
		if (toValue(options.minSize) === undefined) return;

		if (toValue(options.sizeUnit) === 'px') return toValue(options.minSize);
		return percentageToPixels(componentSize.value, toValue(options.minSize));
	});

	const maxSizePercentage = computed(() => {
		if (toValue(options.maxSize) === undefined) return;

		if (toValue(options.sizeUnit) === '%') return toValue(options.maxSize);
		return pixelsToPercentage(componentSize.value, toValue(options.maxSize)!);
	});

	const snapPixels = computed(() => {
		if (toValue(options.sizeUnit) === 'px') return toValue(options.snapPoints);
		return toValue(options.snapPoints).map((snapPercentage) => percentageToPixels(componentSize.value, snapPercentage));
	});

	return {
		componentSize,
		dividerSize,
		sizePercentage,
		sizePixels,
		minSizePercentage,
		minSizePixels,
		maxSizePercentage,
		snapPixels,
	};
};
