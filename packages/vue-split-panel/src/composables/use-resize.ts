import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue';
import type { Orientation, Primary } from '../types';
import { useResizeObserver } from '@vueuse/core';
import { onMounted, toValue, watch } from 'vue';
import { pixelsToPercentage } from '../utils/pixels-to-percentage';

export interface UseResizeOptions {
	sizePixels: ComputedRef<number>;
	panelEl: MaybeRefOrGetter<HTMLElement | null>;
	orientation: MaybeRefOrGetter<Orientation>;
	primary: MaybeRefOrGetter<Primary | undefined>;
}

export const useResize = (sizePercentage: Ref<number>, options: UseResizeOptions) => {
	let cachedSizePixels = 0;

	onMounted(() => {
		cachedSizePixels = options.sizePixels.value;
	});

	watch(options.sizePixels, (newPixels, oldPixels) => {
		if (newPixels === oldPixels) return;
		cachedSizePixels = newPixels;
	});

	useResizeObserver(options.panelEl, (entries) => {
		const entry = entries[0];
		const { width, height } = entry.contentRect;
		const size = toValue(options.orientation) === 'horizontal' ? width : height;

		if (toValue(options.primary)) {
			sizePercentage.value = pixelsToPercentage(size, cachedSizePixels);
		}
	});
};
