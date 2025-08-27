import { describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { useCollapse } from './use-collapse';

describe('useCollapse', () => {
	it('should return expected methods and properties', () => {
		const collapsed = ref(false);
		const sizePercentage = ref(50);
		const emits = vi.fn();

		const result = useCollapse(collapsed, sizePercentage, emits);

		expect(result).toHaveProperty('onTransitionEnd');
		expect(result).toHaveProperty('collapse');
		expect(result).toHaveProperty('expand');
		expect(result).toHaveProperty('toggle');
		expect(result).toHaveProperty('collapseTransitionState');
		expect(typeof result.onTransitionEnd).toBe('function');
		expect(typeof result.collapse).toBe('function');
		expect(typeof result.expand).toBe('function');
		expect(typeof result.toggle).toBe('function');
		expect(result.collapseTransitionState.value).toBeNull();
	});

	describe('collapse method', () => {
		it('should set collapsed to true', () => {
			const collapsed = ref(false);
			const sizePercentage = ref(50);
			const emits = vi.fn();

			const { collapse } = useCollapse(collapsed, sizePercentage, emits);

			collapse();

			expect(collapsed.value).toBe(true);
		});
	});

	describe('expand method', () => {
		it('should set collapsed to false', () => {
			const collapsed = ref(true);
			const sizePercentage = ref(0);
			const emits = vi.fn();

			const { expand } = useCollapse(collapsed, sizePercentage, emits);

			expand();

			expect(collapsed.value).toBe(false);
		});
	});

	describe('toggle method', () => {
		it('should set collapsed to the provided value', () => {
			const collapsed = ref(false);
			const sizePercentage = ref(50);
			const emits = vi.fn();

			const { toggle } = useCollapse(collapsed, sizePercentage, emits);

			toggle(true);
			expect(collapsed.value).toBe(true);

			toggle(false);
			expect(collapsed.value).toBe(false);
		});
	});

	describe('collapsed watcher behavior', () => {
		it('should store size and set to 0 when collapsing', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(75);
			const emits = vi.fn();

			const { collapseTransitionState } = useCollapse(collapsed, sizePercentage, emits);

			collapsed.value = true;
			await nextTick();

			expect(sizePercentage.value).toBe(0);
			expect(collapseTransitionState.value).toBe('collapsing');
		});

		it('should restore size when expanding', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(60);
			const emits = vi.fn();

			const { collapseTransitionState } = useCollapse(collapsed, sizePercentage, emits);

			// First collapse to store the size
			collapsed.value = true;
			await nextTick();
			expect(sizePercentage.value).toBe(0);

			// Then expand to restore
			collapsed.value = false;
			await nextTick();

			expect(sizePercentage.value).toBe(60);
			expect(collapseTransitionState.value).toBe('expanding');
		});

		it('should preserve original size through multiple collapse/expand cycles', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(42);
			const emits = vi.fn();

			useCollapse(collapsed, sizePercentage, emits);

			// First cycle
			collapsed.value = true;
			await nextTick();
			expect(sizePercentage.value).toBe(0);

			collapsed.value = false;
			await nextTick();
			expect(sizePercentage.value).toBe(42);

			// Second cycle
			collapsed.value = true;
			await nextTick();
			expect(sizePercentage.value).toBe(0);

			collapsed.value = false;
			await nextTick();
			expect(sizePercentage.value).toBe(42);
		});

		it('should handle size changes between collapse cycles', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(30);
			const emits = vi.fn();

			useCollapse(collapsed, sizePercentage, emits);

			// First collapse
			collapsed.value = true;
			await nextTick();
			expect(sizePercentage.value).toBe(0);

			// Expand and change size
			collapsed.value = false;
			await nextTick();
			expect(sizePercentage.value).toBe(30);

			// Manually change size while expanded
			sizePercentage.value = 80;

			// Collapse again - should store new size
			collapsed.value = true;
			await nextTick();
			expect(sizePercentage.value).toBe(0);

			// Expand - should restore new size
			collapsed.value = false;
			await nextTick();
			expect(sizePercentage.value).toBe(80);
		});
	});

	describe('transition state management', () => {
		it('should start with null transition state', () => {
			const collapsed = ref(false);
			const sizePercentage = ref(50);
			const emits = vi.fn();

			const { collapseTransitionState } = useCollapse(collapsed, sizePercentage, emits);

			expect(collapseTransitionState.value).toBeNull();
		});

		it('should set collapsing state when collapsed becomes true', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(50);
			const emits = vi.fn();

			const { collapseTransitionState } = useCollapse(collapsed, sizePercentage, emits);

			collapsed.value = true;
			await nextTick();

			expect(collapseTransitionState.value).toBe('collapsing');
		});

		it('should set expanding state when collapsed becomes false', async () => {
			const collapsed = ref(true);
			const sizePercentage = ref(0);
			const emits = vi.fn();

			const { collapseTransitionState } = useCollapse(collapsed, sizePercentage, emits);

			collapsed.value = false;
			await nextTick();

			expect(collapseTransitionState.value).toBe('expanding');
		});
	});

	describe('onTransitionEnd', () => {
		it('should clear transition state and emit event', () => {
			const collapsed = ref(false);
			const sizePercentage = ref(50);
			const emits = vi.fn();

			const { onTransitionEnd, collapseTransitionState } = useCollapse(collapsed, sizePercentage, emits);

			// Set a transition state first
			collapseTransitionState.value = 'collapsing';

			const mockEvent = new TransitionEvent('transitionend', {
				propertyName: 'grid-template-columns',
				elapsedTime: 0.3,
			});

			onTransitionEnd(mockEvent);

			expect(collapseTransitionState.value).toBeNull();
			expect(emits).toHaveBeenCalledWith('transitionend', mockEvent);
		});

		it('should work with expanding state', () => {
			const collapsed = ref(true);
			const sizePercentage = ref(0);
			const emits = vi.fn();

			const { onTransitionEnd, collapseTransitionState } = useCollapse(collapsed, sizePercentage, emits);

			collapseTransitionState.value = 'expanding';

			const mockEvent = new TransitionEvent('transitionend');
			onTransitionEnd(mockEvent);

			expect(collapseTransitionState.value).toBeNull();
			expect(emits).toHaveBeenCalledWith('transitionend', mockEvent);
		});
	});

	describe('integration scenarios', () => {
		it('should handle rapid collapse/expand operations', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(65);
			const emits = vi.fn();

			const { collapseTransitionState, onTransitionEnd } = useCollapse(collapsed, sizePercentage, emits);

			// Rapid collapse
			collapsed.value = true;
			await nextTick();
			expect(collapseTransitionState.value).toBe('collapsing');
			expect(sizePercentage.value).toBe(0);

			// Immediate expand before transition ends
			collapsed.value = false;
			await nextTick();
			expect(collapseTransitionState.value).toBe('expanding');
			expect(sizePercentage.value).toBe(65);

			// Simulate transition end
			const mockEvent = new TransitionEvent('transitionend');
			onTransitionEnd(mockEvent);
			expect(collapseTransitionState.value).toBeNull();
		});

		it('should work with methods triggering state changes', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(45);
			const emits = vi.fn();

			const { collapse, expand, toggle, collapseTransitionState } = useCollapse(collapsed, sizePercentage, emits);

			// Use collapse method
			collapse();
			await nextTick();
			expect(collapsed.value).toBe(true);
			expect(sizePercentage.value).toBe(0);
			expect(collapseTransitionState.value).toBe('collapsing');

			// Use expand method
			expand();
			await nextTick();
			expect(collapsed.value).toBe(false);
			expect(sizePercentage.value).toBe(45);
			expect(collapseTransitionState.value).toBe('expanding');

			// Use toggle method
			toggle(true);
			await nextTick();
			expect(collapsed.value).toBe(true);
			expect(sizePercentage.value).toBe(0);
			expect(collapseTransitionState.value).toBe('collapsing');
		});

		it('should work with zero initial size', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(0);
			const emits = vi.fn();

			useCollapse(collapsed, sizePercentage, emits);

			// Collapse when already at 0
			collapsed.value = true;
			await nextTick();
			expect(sizePercentage.value).toBe(0);

			// Expand - should restore to 0
			collapsed.value = false;
			await nextTick();
			expect(sizePercentage.value).toBe(0);
		});
	});
});
