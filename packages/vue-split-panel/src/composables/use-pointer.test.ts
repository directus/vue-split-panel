import type { Ref } from 'vue';
import type { UsePointerOptions } from './use-pointer';
import { beforeEach, describe, expect, it } from 'vitest';
import { computed, ref } from 'vue';
import { usePointer } from './use-pointer';

describe('usePointer', () => {
	let collapsed: Ref<boolean>;
	let sizePercentage: Ref<number>;
	let sizePixels: Ref<number>;
	let options: UsePointerOptions;
	let dividerEl: Ref<HTMLElement | null>;
	let panelEl: Ref<HTMLElement | null>;

	beforeEach(() => {
		collapsed = ref(false);
		sizePercentage = ref(50);
		sizePixels = ref(200);

		// Create mock DOM elements using real HTMLElements for better type safety
		const dividerElement = document.createElement('div');
		dividerElement.getBoundingClientRect = () => new DOMRect(0, 0, 10, 10);
		dividerEl = ref(dividerElement);

		const panelElement = document.createElement('div');
		panelElement.getBoundingClientRect = () => new DOMRect(0, 0, 400, 400);
		panelEl = ref(panelElement);

		options = {
			disabled: ref(false),
			collapsible: ref(true),
			primary: ref('start'),
			orientation: ref('horizontal'),
			direction: ref('ltr'),
			collapseThreshold: ref(10),
			snapThreshold: ref(5),
			dividerEl,
			panelEl,
			componentSize: computed(() => 400),
			minSizePixels: computed(() => 50),
			snapPixels: computed(() => [100, 200, 300]),
		};
	});

	it('should return handleDblClick and isDragging', () => {
		const result = usePointer(collapsed, sizePercentage, sizePixels, options);

		expect(result).toHaveProperty('handleDblClick');
		expect(result).toHaveProperty('isDragging');
		expect(typeof result.handleDblClick).toBe('function');
		expect(typeof result.isDragging.value).toBe('boolean');
	});

	it('should handle double click to snap to closest point', () => {
		const { handleDblClick } = usePointer(collapsed, sizePercentage, sizePixels, options);

		sizePixels.value = 195; // Close to 200
		handleDblClick();

		expect(sizePixels.value).toBe(200);
	});

	it('should remain collapsed on handle double click when collapsed', () => {
		collapsed.value = true;
		const { handleDblClick } = usePointer(collapsed, sizePercentage, sizePixels, options);

		handleDblClick();

		expect(collapsed.value).toBe(true);
	});

	it('should not snap on double click when disabled', () => {
		options.disabled = ref(true);
		const originalSize = sizePixels.value;
		const { handleDblClick } = usePointer(collapsed, sizePercentage, sizePixels, options);

		handleDblClick();

		expect(sizePixels.value).toBe(originalSize);
	});

	it('should not snap on double click when no snap points exist', () => {
		options.snapPixels = computed(() => []);
		const originalSize = sizePixels.value;
		const { handleDblClick } = usePointer(collapsed, sizePercentage, sizePixels, options);

		handleDblClick();

		expect(sizePixels.value).toBe(originalSize);
	});

	it('should handle when collapsible is false', () => {
		options.collapsible = ref(false);
		collapsed.value = false;
		const { handleDblClick } = usePointer(collapsed, sizePercentage, sizePixels, options);

		handleDblClick();

		expect(collapsed.value).toBe(false); // Should remain visible when not collapsible
	});
});
