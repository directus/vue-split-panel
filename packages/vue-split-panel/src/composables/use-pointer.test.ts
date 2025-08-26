import type { UsePointerOptions } from './use-pointer';
import { beforeEach, describe, expect, it } from 'vitest';
import { computed, ref } from 'vue';
import { usePointer } from './use-pointer';

describe('usePointer', () => {
	let collapsed: any;
	let sizePercentage: any;
	let sizePixels: any;
	let options: UsePointerOptions;
	let dividerEl: any;
	let panelEl: any;

	beforeEach(() => {
		collapsed = ref(false);
		sizePercentage = ref(50);
		sizePixels = ref(200);

		// Create mock DOM elements
		dividerEl = ref({
			getBoundingClientRect: () => ({ left: 0, top: 0, width: 10, height: 10 }),
			style: {},
			addEventListener: () => {},
			removeEventListener: () => {},
		});

		panelEl = ref({
			getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 400 }),
			style: {},
		});

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
