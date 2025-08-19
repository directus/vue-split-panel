import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick, ref } from 'vue';
import SplitPanel from './SplitPanel.vue';

// Enhanced mocks for @vueuse/core used by SplitPanel to keep mounts deterministic and testable
vi.mock('@vueuse/core', () => {
	const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

	// stable element size refs
	const __width = ref(1000);
	const __height = ref(500);
	const useElementSize = () => ({ width: __width, height: __height });

	// stable draggable refs that tests can mutate
	const __dragX = ref(0);
	const __dragY = ref(0);
	const useDraggable = () => ({ x: __dragX, y: __dragY });

	// capture resize observers and expose a trigger util
	const __resizeCallbacks: Array<(entries: Array<{ contentRect: { width: number; height: number } }>) => void> = [];

	const useResizeObserver = (_el: unknown, cb: (entries: Array<{ contentRect: { width: number; height: number } }>) => void) => {
		__resizeCallbacks.push(cb);
	};

	const __triggerResize = (width: number, height: number) => {
		const entry = { contentRect: { width, height } } as const;
		for (const cb of __resizeCallbacks) cb([entry]);
	};

	return { clamp, useElementSize, useDraggable, useResizeObserver, __dragX, __dragY, __triggerResize };
});

// Helper to mount the component with sensible defaults
// Placeholder: mounting helpers will be added alongside tests

describe('SplitPanel', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		// Reset mocked draggable refs between tests to avoid cross-test interference
		const vueuse: any = await import('@vueuse/core');
		vueuse.__dragX.value = 0;
		vueuse.__dragY.value = 0;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('render & accessibility', () => {
		it('renders with default props', () => {
			const wrapper = mount(SplitPanel, {
				slots: {
					start: () => 'Start',
					end: () => 'End',
				},
			});

			// root element
			expect(wrapper.find('.split-panel').exists()).toBe(true);
			// default orientation class
			expect(wrapper.find('.split-panel.horizontal').exists()).toBe(true);
			// divider is present and accessible
			expect(wrapper.find('[role="separator"]').exists()).toBe(true);
		});

		it('renders slot content and has orientation classes', () => {
			const wrapper = mount(SplitPanel, {
				slots: {
					start: () => 'Start Slot',
					end: () => 'End Slot',
				},
			});

			expect(wrapper.text()).toContain('Start Slot');
			expect(wrapper.text()).toContain('End Slot');
			expect(wrapper.find('.divider.horizontal').exists()).toBe(true);
		});

		it('exposes proper accessibility attributes on the divider', () => {
			const wrapper = mount(SplitPanel, {
				slots: { start: () => 'Start', end: () => 'End' },
			});

			const divider = wrapper.find('[role="separator"]');
			expect(divider.exists()).toBe(true);
			expect(divider.attributes('aria-label')).toBe('Resize');
			expect(divider.attributes('aria-valuemin')).toBe('0');
			expect(divider.attributes('aria-valuemax')).toBe('100');
			// default v-model:size is 50
			expect(divider.attributes('aria-valuenow')).toBe('50');
			// focusable by default
			expect(divider.attributes('tabindex')).toBe('0');
		});

		it('removes focusability and adds class when disabled', () => {
			const wrapper = mount(SplitPanel, { props: { disabled: true } });
			const divider = wrapper.find('[role="separator"]');
			expect(divider.classes()).toContain('disabled');
			expect(divider.attributes('tabindex')).toBeUndefined();
		});

		it('reflects v-model size in aria-valuenow', async () => {
			const wrapper = mount(SplitPanel, { props: { size: 30 } });
			let divider = wrapper.find('[role="separator"]');
			expect(divider.attributes('aria-valuenow')).toBe('30');

			await wrapper.setProps({ size: 70 });
			await nextTick();
			divider = wrapper.find('[role="separator"]');
			expect(divider.attributes('aria-valuenow')).toBe('70');
		});

		it('renders a custom divider slot and keeps it focusable', () => {
			const wrapper = mount(SplitPanel, {
				slots: {
					divider: () => h('div', { 'data-testid': 'custom-divider' }),
				},
			});

			const divider = wrapper.find('[role="separator"]');
			expect(divider.attributes('tabindex')).toBe('0');
			expect(wrapper.find('[data-testid="custom-divider"]').exists()).toBe(true);
		});
	});

	describe('keyboard interactions', () => {
		it('arrow right increases in rtl as well', async () => {
			const wrapper = mount(SplitPanel, { props: { direction: 'rtl' } });
			const divider = wrapper.find('[role="separator"]');
			await divider.trigger('keydown', { key: 'ArrowRight' });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('51');
		});

		it('arrow right increases by 1% in horizontal orientation', async () => {
			const wrapper = mount(SplitPanel);
			const divider = wrapper.find('[role="separator"]');
			expect(divider.attributes('aria-valuenow')).toBe('50');

			await divider.trigger('keydown', { key: 'ArrowRight' });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('51');
		});

		it('emits percentage values when sizeUnit = "%"', async () => {
			const wrapper = mount(SplitPanel, { props: { sizeUnit: '%' } });
			const divider = wrapper.find('[role="separator"]');
			await divider.trigger('keydown', { key: 'ArrowRight' }); // 50 -> 51
			await nextTick();
			const emissions = wrapper.emitted('update:size') as unknown[][] | undefined;
			expect((emissions?.length ?? 0) > 0).toBe(true);
			const last = emissions![emissions!.length - 1];
			expect(last[0]).toBe(51);
		});

		it('emits pixel values when sizeUnit = "px"', async () => {
			// Start at 500px (50% of 1000). ArrowRight -> 51% => 510px
			const wrapper = mount(SplitPanel, { props: { sizeUnit: 'px', size: 500 } });
			const divider = wrapper.find('[role="separator"]');
			await divider.trigger('keydown', { key: 'ArrowRight' });
			await nextTick();
			const emissions = wrapper.emitted('update:size') as unknown[][] | undefined;
			expect((emissions?.length ?? 0) > 0).toBe(true);
			const last = emissions![emissions!.length - 1];
			expect(last[0]).toBe(510);
		});

		it('shift+arrow right increases by 10%', async () => {
			const wrapper = mount(SplitPanel);
			const divider = wrapper.find('[role="separator"]');
			await divider.trigger('keydown', { key: 'ArrowRight', shiftKey: true });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('60');
		});

		it('arrow left decreases by 1% and clamps at 0', async () => {
			const wrapper = mount(SplitPanel, { props: { size: 0 } });
			const divider = wrapper.find('[role="separator"]');
			expect(divider.attributes('aria-valuenow')).toBe('0');
			await divider.trigger('keydown', { key: 'ArrowLeft' });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('0');
		});

		it('home and end jump to extremes (primary start)', async () => {
			const wrapper = mount(SplitPanel, { props: { size: 42 } });
			const divider = wrapper.find('[role="separator"]');
			await divider.trigger('keydown', { key: 'Home' });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('0');
			await divider.trigger('keydown', { key: 'End' });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('100');
		});

		it('primary=end inverts increments and home/end', async () => {
			const wrapper = mount(SplitPanel, { props: { primary: 'end' } });
			const divider = wrapper.find('[role="separator"]');
			// ArrowRight should decrease from 50 to 49
			await divider.trigger('keydown', { key: 'ArrowRight' });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('49');
			// ArrowLeft should increase to 50
			await divider.trigger('keydown', { key: 'ArrowLeft' });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('50');
			// Home => 100, End => 0
			await divider.trigger('keydown', { key: 'Home' });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('100');
			await divider.trigger('keydown', { key: 'End' });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('0');
		});

		it('vertical orientation uses up/down for changes', async () => {
			const wrapper = mount(SplitPanel, { props: { orientation: 'vertical' } });
			const divider = wrapper.find('[role="separator"]');
			// ArrowLeft/Right should not change in vertical
			await divider.trigger('keydown', { key: 'ArrowRight' });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('50');
			// ArrowDown increases
			await divider.trigger('keydown', { key: 'ArrowDown' });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('51');
			// ArrowUp decreases
			await divider.trigger('keydown', { key: 'ArrowUp' });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('50');
		});

		it('disabled prevents keyboard updates', async () => {
			const wrapper = mount(SplitPanel, { props: { disabled: true } });
			const divider = wrapper.find('[role="separator"]');
			expect(divider.attributes('aria-valuenow')).toBe('50');
			await divider.trigger('keydown', { key: 'ArrowRight' });
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('50');
		});

		it.todo('enter key toggles collapse/expand (future)');
	});

	describe('emissions', () => {
		it('emits a sequence for multiple key presses in % mode', async () => {
			const wrapper = mount(SplitPanel, { props: { sizeUnit: '%', size: 50 } });
			const divider = wrapper.find('[role="separator"]');
			await divider.trigger('keydown', { key: 'ArrowRight' }); // 51
			await divider.trigger('keydown', { key: 'ArrowRight' }); // 52
			await nextTick();
			const emissions = wrapper.emitted('update:size') as unknown[][] | undefined;
			expect((emissions?.length ?? 0) >= 2).toBe(true);
			const lastTwo = emissions!.slice(-2).map((e) => e[0]);
			expect(lastTwo).toEqual([51, 52]);
		});

		it('emits pixels on drag when sizeUnit = px', async () => {
			const wrapper = mount(SplitPanel, { props: { sizeUnit: 'px', size: 500 } });
			const vueuse: any = await import('@vueuse/core');
			vueuse.__dragX.value = 600; // 60% of 1000 => 600px
			await nextTick();
			const emissions = wrapper.emitted('update:size') as unknown[][] | undefined;
			expect((emissions?.length ?? 0) > 0).toBe(true);
			const last = emissions![emissions!.length - 1][0];
			expect(last).toBe(600);
		});
	});

	describe('drag interactions', () => {
		it('drag clamps between 0 and 100', async () => {
			const wrapper = mount(SplitPanel);
			const vueuse: any = await import('@vueuse/core');
			const divider = wrapper.find('[role="separator"]');
			vueuse.__dragX.value = -100; // below 0
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('0');
			vueuse.__dragX.value = 5000; // above 100%
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('100');
		});

		it('drag inverts with primary=end', async () => {
			const wrapper = mount(SplitPanel, { props: { primary: 'end' } });
			const vueuse: any = await import('@vueuse/core');
			const divider = wrapper.find('[role="separator"]');
			// With primary=end, position is size - x; x=600 -> 1000-600 = 400 => 40%
			vueuse.__dragX.value = 600;
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('40');
		});

		it('vertical orientation uses drag y', async () => {
			const wrapper = mount(SplitPanel, { props: { orientation: 'vertical' } });
			const vueuse: any = await import('@vueuse/core');
			const divider = wrapper.find('[role="separator"]');
			// height defaults to 500; y=250 => 50%
			vueuse.__dragY.value = 250;
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('50');
			vueuse.__dragY.value = 125; // 25%
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('25');
		});
	});

	describe('resize behavior', () => {
		it('recalculates percentage on container resize when primary is set', async () => {
			const wrapper = mount(SplitPanel, { props: { primary: 'start', size: 50 } });
			const vueuse: any = await import('@vueuse/core');
			const divider = wrapper.find('[role="separator"]');
			// On mount cached primary pixels = 50% of 1000 = 500px
			// Resize width to 800 => 500/800 * 100 = 62.5%
			vueuse.__triggerResize(800, 500);
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('62.5');
		});

		it('does not change percentage on resize when no primary is set', async () => {
			const wrapper = mount(SplitPanel, { props: { size: 50 } });
			const vueuse: any = await import('@vueuse/core');
			const divider = wrapper.find('[role="separator"]');
			vueuse.__triggerResize(800, 500);
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('50');
		});

		it('recalculates using height for vertical orientation', async () => {
			// Start at 50% of 500 => 250px cached. Resize height to 1000 => 250/1000 = 25%
			const wrapper = mount(SplitPanel, { props: { orientation: 'vertical', primary: 'start', size: 50 } });
			const vueuse: any = await import('@vueuse/core');
			const divider = wrapper.find('[role="separator"]');
			vueuse.__triggerResize(1000, 1000);
			await nextTick();
			expect(divider.attributes('aria-valuenow')).toBe('25');
		});
	});
});
