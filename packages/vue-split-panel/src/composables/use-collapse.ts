import type { Ref } from 'vue';
import { ref, watch } from 'vue';

export const useCollapse = (collapsed: Ref<boolean>, sizePercentage: Ref<number>, emits: (evt: 'transitionend', event: TransitionEvent) => void) => {
	let expandedSizePercentage = 0;

	const collapseTransitionState = ref<null | 'expanding' | 'collapsing'>(null);

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

	return { onTransitionEnd, collapse, expand, toggle, collapseTransitionState };
};
