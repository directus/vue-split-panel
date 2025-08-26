import type { ComputedRef } from 'vue';
import type { UseGridTemplateOptions } from './use-grid-template';
import { describe, expect, it } from 'vitest';
import { computed, ref } from 'vue';
import { useGridTemplate } from './use-grid-template';

describe('useGridTemplate', () => {
	const createOptions = (overrides = {}): UseGridTemplateOptions => ({
		collapsed: ref(false),
		minSizePercentage: computed(() => {}) as ComputedRef<number | undefined>,
		maxSizePercentage: computed(() => {}) as ComputedRef<number | undefined>,
		sizePercentage: computed(() => 50),
		dividerSize: computed(() => 4),
		primary: 'start',
		direction: 'ltr',
		orientation: 'horizontal',
		...overrides,
	});

	it('returns collapsed state when collapsed is true', () => {
		const options = createOptions({ collapsed: ref(true) });
		const { gridTemplate } = useGridTemplate(options);

		expect(gridTemplate.value).toBe('0 4px auto');
	});

	it('returns basic clamp template when no min/max constraints', () => {
		const options = createOptions();
		const { gridTemplate } = useGridTemplate(options);

		expect(gridTemplate.value).toBe('clamp(0%, 50%, calc(100% - 4px)) 4px auto');
	});

	it('returns complex clamp template with min/max constraints', () => {
		const options = createOptions({
			minSizePercentage: computed(() => 20),
			maxSizePercentage: computed(() => 80),
		});
		const { gridTemplate } = useGridTemplate(options);

		expect(gridTemplate.value).toBe('clamp(0%, clamp(20%, 50%, 80%), calc(100% - 4px)) 4px auto');
	});

	it('reverses order when primary is end and direction is ltr', () => {
		const options = createOptions({ primary: 'end' });
		const { gridTemplate } = useGridTemplate(options);

		expect(gridTemplate.value).toBe('auto 4px clamp(0%, 50%, calc(100% - 4px))');
	});

	it('reverses order when direction is rtl and primary is start', () => {
		const options = createOptions({ direction: 'rtl' });
		const { gridTemplate } = useGridTemplate(options);

		expect(gridTemplate.value).toBe('auto 4px clamp(0%, 50%, calc(100% - 4px))');
	});

	it('handles vertical orientation correctly', () => {
		const options = createOptions({ orientation: 'vertical' });
		const { gridTemplate } = useGridTemplate(options);

		expect(gridTemplate.value).toBe('clamp(0%, 50%, calc(100% - 4px)) 4px auto');
	});

	it('handles vertical orientation with end primary', () => {
		const options = createOptions({
			orientation: 'vertical',
			primary: 'end',
		});
		const { gridTemplate } = useGridTemplate(options);

		expect(gridTemplate.value).toBe('auto 4px clamp(0%, 50%, calc(100% - 4px))');
	});

	it('uses custom divider size', () => {
		const options = createOptions({ dividerSize: computed(() => 8) });
		const { gridTemplate } = useGridTemplate(options);

		expect(gridTemplate.value).toBe('clamp(0%, 50%, calc(100% - 8px)) 8px auto');
	});

	it('handles undefined primary as start', () => {
		const options = createOptions({ primary: undefined });
		const { gridTemplate } = useGridTemplate(options);

		expect(gridTemplate.value).toBe('clamp(0%, 50%, calc(100% - 4px)) 4px auto');
	});
});
