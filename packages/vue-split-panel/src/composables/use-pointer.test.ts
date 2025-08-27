import type { UseDraggableReturn } from '@vueuse/core';
import type { Ref } from 'vue';
import type { UsePointerOptions } from './use-pointer';
import { useDraggable } from '@vueuse/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, ref } from 'vue';
import { usePointer } from './use-pointer';

vi.mock('@vueuse/core', async () => {
	const actual = await vi.importActual('@vueuse/core');

	return {
		...actual,
		useDraggable: vi.fn(),
	};
});

describe('usePointer', () => {
	let collapsed: Ref<boolean>;
	let sizePercentage: Ref<number>;
	let sizePixels: Ref<number>;
	let options: UsePointerOptions;
	let dividerEl: Ref<HTMLElement | null>;
	let panelEl: Ref<HTMLElement | null>;

	let mockDragX: Ref<number>;
	let mockDragY: Ref<number>;
	let mockDragDragging: Ref<boolean>;

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

		mockDragX = ref(75);
		mockDragY = ref(75);
		mockDragDragging = ref(false);

		vi.mocked(useDraggable).mockReturnValue({ x: mockDragX, y: mockDragY, isDragging: mockDragDragging } as UseDraggableReturn);
	});

	it('should return handleDblClick and isDragging', () => {
		const result = usePointer(collapsed, sizePercentage, sizePixels, options);

		expect(result).toHaveProperty('handleDblClick');
		expect(result).toHaveProperty('isDragging');
		expect(typeof result.handleDblClick).toBe('function');
		expect(typeof result.isDragging.value).toBe('boolean');
	});

	describe('dbl click', () => {
		it('should handle double click to snap to closest point', () => {
			const { handleDblClick } = usePointer(collapsed, sizePercentage, sizePixels, options);

			sizePixels.value = 195; // Close to 200
			handleDblClick();

			expect(sizePixels.value).toBe(200);
		});

		it('should expand on double click when collapsed', () => {
			collapsed.value = true;
			const { handleDblClick } = usePointer(collapsed, sizePercentage, sizePixels, options);

			handleDblClick();

			expect(collapsed.value).toBe(false);
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

	describe('dragging', () => {
		it('should not do anything when disabled', async () => {
			options.disabled = true;

			usePointer(collapsed, sizePercentage, sizePixels, options);

			mockDragDragging.value = true;
			mockDragX.value = 30; // below the minsize - threshold
			await nextTick();
			expect(collapsed.value).toBe(false);
		});

		it('should update sizePercentage when dragging horizontally', async () => {
			usePointer(collapsed, sizePercentage, sizePixels, options);

			mockDragX.value = 100; // Move to 100px
			await nextTick();
			expect(sizePercentage.value).toBe(25); // 100/400 * 100 = 25%
		});

		it('should update sizePercentage when dragging vertically', async () => {
			options.orientation = ref('vertical');
			usePointer(collapsed, sizePercentage, sizePixels, options);

			mockDragY.value = 150; // Move to 150px
			await nextTick();
			expect(sizePercentage.value).toBe(37.5); // 150/400 * 100 = 37.5%
		});

		it('should handle primary end positioning', async () => {
			options.primary = ref('end');
			usePointer(collapsed, sizePercentage, sizePixels, options);

			mockDragX.value = 100; // Drag position at 100px
			await nextTick();
			// With primary end, actual position = 400 - 100 = 300px

			expect(sizePercentage.value).toBe(75); // 300/400 * 100 = 75%
		});

		it('should collapse when dragging below collapse threshold', async () => {
			options.minSizePixels = computed(() => 50);
			options.collapseThreshold = ref(10);
			usePointer(collapsed, sizePercentage, sizePixels, options);

			mockDragX.value = 30; // Below minSize (50) - collapseThreshold (10) = 40
			await nextTick();
			expect(collapsed.value).toBe(true);
		});

		it('should expand when dragging above expand threshold', async () => {
			collapsed.value = true;
			options.collapseThreshold = ref(15);
			usePointer(collapsed, sizePercentage, sizePixels, options);

			mockDragX.value = 20; // Above collapseThreshold (15)
			await nextTick();
			expect(collapsed.value).toBe(false);
		});

		it('should not collapse when collapsible is false', async () => {
			options.collapsible = ref(false);
			usePointer(collapsed, sizePercentage, sizePixels, options);

			mockDragX.value = 10; // Very low position
			await nextTick();
			expect(collapsed.value).toBe(false);
		});

		it('should snap to snap points within threshold', async () => {
			options.snapPixels = computed(() => [100, 200, 300]);
			options.snapThreshold = ref(8);
			usePointer(collapsed, sizePercentage, sizePixels, options);

			mockDragX.value = 195; // Within 8px of snap point 200
			await nextTick();
			expect(sizePercentage.value).toBe(50); // 200/400 * 100 = 50%
		});

		it('should not snap when outside snap threshold', async () => {
			options.snapPixels = computed(() => [100, 200, 300]);
			options.snapThreshold = ref(5);
			usePointer(collapsed, sizePercentage, sizePixels, options);

			mockDragX.value = 190; // Outside 5px threshold of snap point 200
			await nextTick();
			expect(sizePercentage.value).toBe(47.5); // 190/400 * 100 = 47.5%
		});

		it('should handle RTL direction with horizontal orientation', async () => {
			options.direction = ref('rtl');
			options.orientation = ref('horizontal');
			options.snapPixels = computed(() => [100]);
			options.snapThreshold = ref(5);
			usePointer(collapsed, sizePercentage, sizePixels, options);

			// With RTL, snap point 100 becomes 400 - 100 = 300
			mockDragX.value = 298; // Within threshold of transformed snap point
			await nextTick();
			expect(sizePercentage.value).toBe(75); // 300/400 * 100 = 75%
		});

		it('should clamp sizePercentage between 0 and 100', async () => {
			usePointer(collapsed, sizePercentage, sizePixels, options);

			mockDragX.value = -50; // Negative position
			await nextTick();
			expect(sizePercentage.value).toBe(0);

			mockDragX.value = 500; // Beyond component size
			await nextTick();
			expect(sizePercentage.value).toBe(100);
		});

		it('should update threshold location when dragging stops', async () => {
			usePointer(collapsed, sizePercentage, sizePixels, options);

			// Start dragging
			mockDragDragging.value = true;
			await nextTick();

			// Collapse during drag
			mockDragX.value = 30;
			await nextTick();
			expect(collapsed.value).toBe(true);

			// Stop dragging
			mockDragDragging.value = false;
			await nextTick();

			// Should now be in expand mode for next drag
			mockDragX.value = 5; // Below expand threshold
			await nextTick();
			expect(collapsed.value).toBe(true); // Should remain collapsed
		});
	});
});
