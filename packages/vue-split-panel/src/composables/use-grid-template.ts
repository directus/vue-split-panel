import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue';
import type { Direction, Orientation, Primary } from '../types';
import { computed, toValue } from 'vue';

export interface UseGridTemplateOptions {
	collapsed: Ref<boolean>;
	minSizePercentage: ComputedRef<number | undefined>;
	maxSizePercentage: ComputedRef<number | undefined>;
	sizePercentage: ComputedRef<number>;
	dividerSize: ComputedRef<number>;
	primary: MaybeRefOrGetter<Primary | undefined>;
	direction: MaybeRefOrGetter<Direction>;
	orientation: MaybeRefOrGetter<Orientation>;
}

export const useGridTemplate = (options: UseGridTemplateOptions) => {
	const gridTemplate = computed(() => {
		let primary: string;

		if (options.collapsed.value) {
			primary = '0';
		}
		else if (options.minSizePercentage.value !== undefined && options.maxSizePercentage.value !== undefined) {
			primary = `clamp(0%, clamp(${options.minSizePercentage.value}%, ${options.sizePercentage.value}%, ${options.maxSizePercentage.value}%), calc(100% - ${options.dividerSize.value}px))`;
		}
		else if (options.minSizePercentage.value !== undefined) {
			primary = `clamp(${options.minSizePercentage.value}%, max(${options.minSizePercentage.value}%, ${options.sizePercentage.value}%), calc(100% - ${options.dividerSize.value}px))`;
		}
		else {
			primary = `clamp(0%, ${options.sizePercentage.value}%, calc(100% - ${options.dividerSize.value}px))`;
		}

		const secondary = 'auto';

		if (!toValue(options.primary) || toValue(options.primary) === 'start') {
			if (toValue(options.direction) === 'ltr' || toValue(options.orientation) === 'vertical') {
				return `${primary} ${options.dividerSize.value}px ${secondary}`;
			}
			else {
				return `${secondary} ${options.dividerSize.value}px ${primary}`;
			}
		}
		else {
			if (toValue(options.direction) === 'ltr' || toValue(options.orientation) === 'vertical') {
				return `${secondary} ${options.dividerSize.value}px ${primary}`;
			}
			else {
				return `${primary} ${options.dividerSize.value}px ${secondary}`;
			}
		}
	});

	return { gridTemplate };
};
