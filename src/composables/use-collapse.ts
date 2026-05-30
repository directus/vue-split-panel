import type { MaybeRefOrGetter, Ref } from "vue";
import { refAutoReset } from "@vueuse/core";
import { computed, toValue, watch } from "vue";

export interface UseCollapseOptions {
	transitionDuration: MaybeRefOrGetter<number>;
}

export const useCollapse = (collapsed: Ref<boolean>, options: UseCollapseOptions) => {
	const collapseTransitionState = refAutoReset<null | "expanding" | "collapsing">(
		null,
		toValue(options.transitionDuration),
	);

	const transitionDurationCss = computed(() => `${toValue(options.transitionDuration)}ms`);

	watch(collapsed, (newCollapsed) => {
		collapseTransitionState.value = newCollapsed ? "collapsing" : "expanding";
	});

	const collapse = () => (collapsed.value = true);
	const expand = () => (collapsed.value = false);
	const toggle = (val: boolean) => (collapsed.value = val);

	return { collapse, expand, toggle, collapseTransitionState, transitionDurationCss };
};
