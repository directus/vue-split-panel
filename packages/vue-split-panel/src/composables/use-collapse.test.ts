import { describe, expect, it } from 'vite-plus/test';
import { nextTick, ref } from 'vue';
import { useCollapse } from './use-collapse';

describe('useCollapse', () => {
	it('should return expected methods and properties', () => {
		const collapsed = ref(false);
		const sizePercentage = ref(50);
		const options = { transitionDuration: 300, collapsedSize: 0 };

		const result = useCollapse(collapsed, sizePercentage, options);

		expect(result).toHaveProperty('collapse');
		expect(result).toHaveProperty('expand');
		expect(result).toHaveProperty('toggle');
		expect(result).toHaveProperty('collapseTransitionState');
		expect(result).toHaveProperty('transitionDurationCss');
		expect(typeof result.collapse).toBe('function');
		expect(typeof result.expand).toBe('function');
		expect(typeof result.toggle).toBe('function');
		expect(result.collapseTransitionState.value).toBeNull();
		expect(result.transitionDurationCss.value).toBe('300ms');
	});

	describe('collapse method', () => {
		it('should set collapsed to true', () => {
			const collapsed = ref(false);
			const sizePercentage = ref(50);
			const options = { transitionDuration: 300, collapsedSize: 0 };

			const { collapse } = useCollapse(collapsed, sizePercentage, options);

			collapse();

			expect(collapsed.value).toBe(true);
		});
	});

	describe('expand method', () => {
		it('should set collapsed to false', () => {
			const collapsed = ref(true);
			const sizePercentage = ref(0);
			const options = { transitionDuration: 300, collapsedSize: 0 };

			const { expand } = useCollapse(collapsed, sizePercentage, options);

			expand();

			expect(collapsed.value).toBe(false);
		});
	});

	describe('toggle method', () => {
		it('should set collapsed to the provided value', () => {
			const collapsed = ref(false);
			const sizePercentage = ref(50);
			const options = { transitionDuration: 300, collapsedSize: 0 };

			const { toggle } = useCollapse(collapsed, sizePercentage, options);

			toggle(true);
			expect(collapsed.value).toBe(true);

			toggle(false);
			expect(collapsed.value).toBe(false);
		});
	});

	describe('collapsed watcher behavior', () => {
		it('should store size and set to collapsedSize when collapsing', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(75);
			const options = { transitionDuration: 300, collapsedSize: 0 };

			const { collapseTransitionState } = useCollapse(collapsed, sizePercentage, options);

			collapsed.value = true;
			await nextTick();

			expect(sizePercentage.value).toBe(0);
			expect(collapseTransitionState.value).toBe('collapsing');
		});

		it('should restore size when expanding', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(60);
			const options = { transitionDuration: 300, collapsedSize: 0 };

			const { collapseTransitionState } = useCollapse(collapsed, sizePercentage, options);

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
			const options = { transitionDuration: 300, collapsedSize: 0 };

			useCollapse(collapsed, sizePercentage, options);

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
			const options = { transitionDuration: 300, collapsedSize: 0 };

			useCollapse(collapsed, sizePercentage, options);

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
			const options = { transitionDuration: 300, collapsedSize: 0 };

			const { collapseTransitionState } = useCollapse(collapsed, sizePercentage, options);

			expect(collapseTransitionState.value).toBeNull();
		});

		it('should set collapsing state when collapsed becomes true', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(50);
			const options = { transitionDuration: 300, collapsedSize: 0 };

			const { collapseTransitionState } = useCollapse(collapsed, sizePercentage, options);

			collapsed.value = true;
			await nextTick();

			expect(collapseTransitionState.value).toBe('collapsing');
		});

		it('should set expanding state when collapsed becomes false', async () => {
			const collapsed = ref(true);
			const sizePercentage = ref(0);
			const options = { transitionDuration: 300, collapsedSize: 0 };

			const { collapseTransitionState } = useCollapse(collapsed, sizePercentage, options);

			collapsed.value = false;
			await nextTick();

			expect(collapseTransitionState.value).toBe('expanding');
		});
	});

	describe('transitionDurationCss', () => {
		it('should return CSS transition duration', () => {
			const collapsed = ref(false);
			const sizePercentage = ref(50);
			const options = { transitionDuration: 500, collapsedSize: 0 };

			const { transitionDurationCss } = useCollapse(collapsed, sizePercentage, options);

			expect(transitionDurationCss.value).toBe('500ms');
		});

		it('should be reactive to transition duration changes', () => {
			const collapsed = ref(false);
			const sizePercentage = ref(50);
			const transitionDuration = ref(300);
			const options = { transitionDuration, collapsedSize: 0 };

			const { transitionDurationCss } = useCollapse(collapsed, sizePercentage, options);

			expect(transitionDurationCss.value).toBe('300ms');

			transitionDuration.value = 600;
			expect(transitionDurationCss.value).toBe('600ms');
		});
	});

	describe('integration scenarios', () => {
		it('should handle rapid collapse/expand operations', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(65);
			const options = { transitionDuration: 300, collapsedSize: 0 };

			const { collapseTransitionState } = useCollapse(collapsed, sizePercentage, options);

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
		});

		it('should work with methods triggering state changes', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(45);
			const options = { transitionDuration: 300, collapsedSize: 0 };

			const { collapse, expand, toggle, collapseTransitionState } = useCollapse(collapsed, sizePercentage, options);

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
			const options = { transitionDuration: 300, collapsedSize: 0 };

			useCollapse(collapsed, sizePercentage, options);

			// Collapse when already at 0
			collapsed.value = true;
			await nextTick();
			expect(sizePercentage.value).toBe(0);

			// Expand - should restore to 0
			collapsed.value = false;
			await nextTick();
			expect(sizePercentage.value).toBe(0);
		});

		it('should use custom collapsedSize value', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(60);
			const options = { transitionDuration: 300, collapsedSize: 10 };

			const { collapseTransitionState } = useCollapse(collapsed, sizePercentage, options);

			// Collapse to custom size
			collapsed.value = true;
			await nextTick();
			expect(sizePercentage.value).toBe(10);
			expect(collapseTransitionState.value).toBe('collapsing');

			// Expand should restore original size
			collapsed.value = false;
			await nextTick();
			expect(sizePercentage.value).toBe(60);
			expect(collapseTransitionState.value).toBe('expanding');
		});

		it('should support reactive collapsedSize value', async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(70);
			const collapsedSize = ref(5);
			const options = { transitionDuration: 300, collapsedSize };

			useCollapse(collapsed, sizePercentage, options);

			// Collapse with initial collapsedSize
			collapsed.value = true;
			await nextTick();
			expect(sizePercentage.value).toBe(5);

			// Change collapsedSize while collapsed
			collapsedSize.value = 15;

			// Expand and collapse again with new collapsedSize
			collapsed.value = false;
			await nextTick();
			expect(sizePercentage.value).toBe(70);

			collapsed.value = true;
			await nextTick();
			expect(sizePercentage.value).toBe(15);
		});
	});
});
