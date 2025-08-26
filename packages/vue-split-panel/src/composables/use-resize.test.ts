import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { computed, defineComponent, ref } from 'vue';
import { useResize } from './use-resize';

describe('useResize', () => {
	let mockObserver: ResizeObserver;

	beforeEach(() => {
		mockObserver = new ResizeObserver(() => {});
	});

	it('should not reset sizePercentage when no primary has been set', () => {
		const sizePercentage = ref(100);

		const wrapper = mount(defineComponent({
			template: '<div />',
			setup() {
				return useResize(sizePercentage, {
					sizePixels: computed(() => 50),
					panelEl: document.createElement('div'),
					orientation: ref('horizontal'),
					primary: ref(undefined),
				});
			},
		}));

		const entry = { contentRect: { width: 75, height: 75 } } as ResizeObserverEntry;

		wrapper.vm.onResize([entry], mockObserver);

		expect(sizePercentage.value).toBe(100);
	});

	it('should set the sizePercentage based on the primary size width', () => {
		const sizePercentage = ref(50);

		const wrapper = mount(defineComponent({
			template: '<div />',
			setup() {
				return useResize(sizePercentage, {
					sizePixels: computed(() => 250),
					panelEl: document.createElement('div'),
					orientation: ref('horizontal'),
					primary: ref('start'),
				});
			},
		}));

		const entry = { contentRect: { width: 400, height: 150 } } as ResizeObserverEntry;

		wrapper.vm.onResize([entry], mockObserver);

		// Pixel size of 250 on a total width of 400 = 62.5%
		expect(sizePercentage.value).toBe(62.5);
	});

	it('should use the height when orientation is vertical', () => {
		const sizePercentage = ref(50);

		const wrapper = mount(defineComponent({
			template: '<div />',
			setup() {
				return useResize(sizePercentage, {
					sizePixels: computed(() => 250),
					panelEl: document.createElement('div'),
					orientation: ref('vertical'),
					primary: ref('start'),
				});
			},
		}));

		const entry = { contentRect: { width: 150, height: 400 } } as ResizeObserverEntry;

		wrapper.vm.onResize([entry], mockObserver);

		// Pixel size of 250 on a total width of 400 = 62.5%
		expect(sizePercentage.value).toBe(62.5);
	});
});
