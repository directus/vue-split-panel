import type { MaybeRefOrGetter, Ref } from 'vue';
import { refAutoReset } from '@vueuse/core';
import { computed, toValue, watch } from 'vue';

export interface UseCollapseOptions {
	transitionDuration: MaybeRefOrGetter<number>;
	collapsedSize: MaybeRefOrGetter<number>;
}

export const useCollapse = (collapsed: Ref<boolean>, sizePercentage: Ref<number>, options: UseCollapseOptions) => {
	let expandedSizePercentage = 0;

	const collapseTransitionState = refAutoReset<null | 'expanding' | 'collapsing'>(null, toValue(options.transitionDuration));

	const transitionDurationCss = computed(() => `${toValue(options.transitionDuration)}ms`);

	watch(collapsed, (newCollapsed) => {
		if (newCollapsed === true) {
			expandedSizePercentage = sizePercentage.value;
			sizePercentage.value = toValue(options.collapsedSize);
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

	return { collapse, expand, toggle, collapseTransitionState, transitionDurationCss };
};
