import type { ResizeObserverCallback } from "@vueuse/core";
import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";
import type { Orientation, Primary, SizeUnit } from "../types";
import { useResizeObserver } from "@vueuse/core";
import { toValue, watch } from "vue";
import { pixelsToPercentage } from "../utils/pixels-to-percentage";

export interface UseResizeOptions {
	sizePixels: ComputedRef<number>;
	panelEl: MaybeRefOrGetter<HTMLElement | null>;
	orientation: MaybeRefOrGetter<Orientation>;
	primary: MaybeRefOrGetter<Primary | undefined>;
	collapsed: MaybeRefOrGetter<boolean>;
	sizeUnit: MaybeRefOrGetter<SizeUnit>;
}

export const useResize = (sizePercentage: Ref<number>, options: UseResizeOptions) => {
	const isValidSize = (size: number | undefined): size is number =>
		typeof size === "number" && Number.isFinite(size) && size > 0;

	let cachedSizePixels: number | undefined = isValidSize(options.sizePixels.value)
		? options.sizePixels.value
		: undefined;

	watch(options.sizePixels, (newPixels, oldPixels) => {
		if (newPixels === oldPixels) return;
		if (!isValidSize(newPixels)) return;

		cachedSizePixels = newPixels;
	});

	const onResize: ResizeObserverCallback = (entries) => {
		const entry = entries[0];
		const { width, height } = entry.contentRect;
		const size = toValue(options.orientation) === "horizontal" ? width : height;

		if (!toValue(options.primary)) return;
		if (toValue(options.collapsed)) return;
		if (toValue(options.sizeUnit) === "px") return;
		if (!isValidSize(size)) return;
		if (!isValidSize(cachedSizePixels)) return;

		sizePercentage.value = pixelsToPercentage(size, cachedSizePixels);
	};

	useResizeObserver(options.panelEl, onResize);

	return { onResize };
};
