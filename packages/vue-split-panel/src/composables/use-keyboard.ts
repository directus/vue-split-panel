import type { MaybeRefOrGetter, Ref } from 'vue';
import type { Orientation, Primary } from '../types';
import { clamp } from '@vueuse/core';
import { toValue } from 'vue';

export interface UseKeyboardOptions {
	disabled: MaybeRefOrGetter<boolean>;
	collapsible: MaybeRefOrGetter<boolean>;
	primary: MaybeRefOrGetter<Primary | undefined>;
	orientation: MaybeRefOrGetter<Orientation>;
}

export const useKeyboard = (sizePercentage: Ref<number>, collapsed: Ref<boolean>, options: UseKeyboardOptions) => {
	const handleKeydown = (event: KeyboardEvent) => {
		if (toValue(options.disabled)) return;

		if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'].includes(event.key)) {
			event.preventDefault();

			let newPosition = sizePercentage.value;

			const increment = (event.shiftKey ? 10 : 1) * (toValue(options.primary) === 'end' ? -1 : 1);

			if (
				(event.key === 'ArrowLeft' && toValue(options.orientation) === 'horizontal')
				|| (event.key === 'ArrowUp' && toValue(options.orientation) === 'vertical')
			) {
				newPosition -= increment;
			}

			if (
				(event.key === 'ArrowRight' && toValue(options.orientation) === 'horizontal')
				|| (event.key === 'ArrowDown' && toValue(options.orientation) === 'vertical')
			) {
				newPosition += increment;
			}

			if (event.key === 'Home') {
				newPosition = toValue(options.primary) === 'end' ? 100 : 0;
			}

			if (event.key === 'End') {
				newPosition = toValue(options.primary) === 'end' ? 0 : 100;
			}

			if (event.key === 'Enter' && toValue(options.collapsible)) {
				collapsed.value = !collapsed.value;
			}

			sizePercentage.value = clamp(newPosition, 0, 100);
		}
	};

	return { handleKeydown };
};
