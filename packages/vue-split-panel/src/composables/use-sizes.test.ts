import type { Ref } from 'vue';
import type { UseSizesOptions } from './use-sizes';
import { beforeEach, describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useSizes } from './use-sizes';

describe('useSizes', () => {
	let mockPanelEl: HTMLElement;
	let mockDividerEl: HTMLElement;
	let size: Ref<number>;
	let defaultOptions: UseSizesOptions;

	beforeEach(() => {
		mockPanelEl = document.createElement('div');
		mockDividerEl = document.createElement('div');

		Object.defineProperty(mockPanelEl, 'offsetWidth', { value: 400, writable: true });
		Object.defineProperty(mockPanelEl, 'offsetHeight', { value: 300, writable: true });
		Object.defineProperty(mockDividerEl, 'offsetWidth', { value: 8, writable: true });
		Object.defineProperty(mockDividerEl, 'offsetHeight', { value: 8, writable: true });

		size = ref(50);

		defaultOptions = {
			disabled: false,
			collapsible: false,
			primary: 'start',
			orientation: 'horizontal',
			sizeUnit: '%',
			minSize: 10,
			maxSize: 90,
			snapPoints: [25, 50, 75],
			panelEl: mockPanelEl,
			dividerEl: mockDividerEl,
		};
	});

	describe('componentSize', () => {
		it('should return width for horizontal orientation', () => {
			const { componentSize } = useSizes(size, defaultOptions);
			expect(componentSize.value).toBe(400);
		});

		it('should return height for vertical orientation', () => {
			const options = { ...defaultOptions, orientation: 'vertical' as const };
			const { componentSize } = useSizes(size, options);
			expect(componentSize.value).toBe(300);
		});
	});

	describe('dividerSize', () => {
		it('should return divider width for horizontal orientation', () => {
			const { dividerSize } = useSizes(size, defaultOptions);
			expect(dividerSize.value).toBe(8);
		});

		it('should return divider height for vertical orientation', () => {
			const options = { ...defaultOptions, orientation: 'vertical' as const };
			const { dividerSize } = useSizes(size, options);
			expect(dividerSize.value).toBe(8);
		});
	});

	describe('sizePercentage', () => {
		it('should return size value when sizeUnit is percentage', () => {
			const { sizePercentage } = useSizes(size, defaultOptions);
			expect(sizePercentage.value).toBe(50);
		});

		it('should convert pixels to percentage when sizeUnit is pixels', () => {
			const options = { ...defaultOptions, sizeUnit: 'px' as const };
			size.value = 200; // 200px out of 400px = 50%
			const { sizePercentage } = useSizes(size, options);
			expect(sizePercentage.value).toBe(50);
		});

		it('should update size when setting percentage value with percentage unit', () => {
			const { sizePercentage } = useSizes(size, defaultOptions);
			sizePercentage.value = 75;
			expect(size.value).toBe(75);
		});

		it('should convert and update size when setting percentage value with pixel unit', () => {
			const options = { ...defaultOptions, sizeUnit: 'px' as const };
			const { sizePercentage } = useSizes(size, options);
			sizePercentage.value = 75; // 75% of 400px = 300px
			expect(size.value).toBe(300);
		});
	});

	describe('sizePixels', () => {
		it('should return size value when sizeUnit is pixels', () => {
			const options = { ...defaultOptions, sizeUnit: 'px' as const };
			size.value = 200;
			const { sizePixels } = useSizes(size, options);
			expect(sizePixels.value).toBe(200);
		});

		it('should convert percentage to pixels when sizeUnit is percentage', () => {
			size.value = 50; // 50% of 400px = 200px
			const { sizePixels } = useSizes(size, defaultOptions);
			expect(sizePixels.value).toBe(200);
		});

		it('should update size when setting pixel value with pixel unit', () => {
			const options = { ...defaultOptions, sizeUnit: 'px' as const };
			const { sizePixels } = useSizes(size, options);
			sizePixels.value = 300;
			expect(size.value).toBe(300);
		});

		it('should convert and update size when setting pixel value with percentage unit', () => {
			const { sizePixels } = useSizes(size, defaultOptions);
			sizePixels.value = 300; // 300px out of 400px = 75%
			expect(size.value).toBe(75);
		});
	});

	describe('minSizePercentage', () => {
		it('should return undefined when minSize is undefined', () => {
			const options = { ...defaultOptions, minSize: undefined };
			const { minSizePercentage } = useSizes(size, options);
			expect(minSizePercentage.value).toBeUndefined();
		});

		it('should return minSize value when sizeUnit is percentage', () => {
			const { minSizePercentage } = useSizes(size, defaultOptions);
			expect(minSizePercentage.value).toBe(10);
		});

		it('should convert pixels to percentage when sizeUnit is pixels', () => {
			const options = { ...defaultOptions, sizeUnit: 'px' as const, minSize: 40 };
			const { minSizePercentage } = useSizes(size, options);
			expect(minSizePercentage.value).toBe(10); // 40px out of 400px = 10%
		});
	});

	describe('minSizePixels', () => {
		it('should return undefined when minSize is undefined', () => {
			const options = { ...defaultOptions, minSize: undefined };
			const { minSizePixels } = useSizes(size, options);
			expect(minSizePixels.value).toBeUndefined();
		});

		it('should return minSize value when sizeUnit is pixels', () => {
			const options = { ...defaultOptions, sizeUnit: 'px' as const, minSize: 40 };
			const { minSizePixels } = useSizes(size, options);
			expect(minSizePixels.value).toBe(40);
		});

		it('should convert percentage to pixels when sizeUnit is percentage', () => {
			const { minSizePixels } = useSizes(size, defaultOptions);
			expect(minSizePixels.value).toBe(40); // 10% of 400px = 40px
		});
	});

	describe('maxSizePercentage', () => {
		it('should return undefined when maxSize is undefined', () => {
			const options = { ...defaultOptions, maxSize: undefined };
			const { maxSizePercentage } = useSizes(size, options);
			expect(maxSizePercentage.value).toBeUndefined();
		});

		it('should return maxSize value when sizeUnit is percentage', () => {
			const { maxSizePercentage } = useSizes(size, defaultOptions);
			expect(maxSizePercentage.value).toBe(90);
		});

		it('should convert pixels to percentage when sizeUnit is pixels', () => {
			const options = { ...defaultOptions, sizeUnit: 'px' as const, maxSize: 360 };
			const { maxSizePercentage } = useSizes(size, options);
			expect(maxSizePercentage.value).toBe(90); // 360px out of 400px = 90%
		});
	});

	describe('snapPixels', () => {
		it('should return snapPoints as-is when sizeUnit is pixels', () => {
			const options = { ...defaultOptions, sizeUnit: 'px' as const, snapPoints: [100, 200, 300] };
			const { snapPixels } = useSizes(size, options);
			expect(snapPixels.value).toEqual([100, 200, 300]);
		});

		it('should convert percentage snapPoints to pixels when sizeUnit is percentage', () => {
			const { snapPixels } = useSizes(size, defaultOptions);
			expect(snapPixels.value).toEqual([100, 200, 300]); // 25%, 50%, 75% of 400px
		});
	});
});
