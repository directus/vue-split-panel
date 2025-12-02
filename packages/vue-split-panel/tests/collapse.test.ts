import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { SplitPanel } from '../src';

// There's a tsdown/vitest issue causing false positives here, so we skip these tests for now
//   => TypeError: Cannot define property split-panel, object is not extensible
describe.todo('collapse', () => {
	it('collapses when collapsed is set to true', () => {
		const wrapper = mount(SplitPanel, {
			props: { collapsed: true },
		});

		expect(wrapper.find('[data-testid="root"]').classes()).toContain('sp-collapsed');
	});

	it('is not collapsed when collapsed is set to false', () => {
		const wrapper = mount(SplitPanel, {
			props: { collapsed: false },
		});

		expect(wrapper.find('[data-testid="root"]').classes()).not.toContain('sp-collapsed');
	});

	it('can be collapsed through a prop even when collapsible is false', () => {
		const wrapper = mount(SplitPanel, {
			props: { collapsible: false, collapsed: true },
		});

		expect(wrapper.find('[data-testid="root"]').classes()).toContain('sp-collapsed');
	});

	it('sets size to 0 when collapsed', async () => {
		const wrapper = mount(SplitPanel, {
			props: { size: 30, collapsed: false },
			slots: { start: 'Start', end: 'End' },
		});

		await wrapper.setProps({ collapsed: true });

		expect(wrapper.find('[data-testid="divider"]').attributes('aria-valuenow')).toBe('0');
	});

	it('preserves size when expanding back from collapsed state', async () => {
		const wrapper = mount(SplitPanel, {
			props: { size: 75 },
		});

		// Collapse
		await wrapper.setProps({ collapsed: true });
		expect(wrapper.find('[data-testid="divider"]').attributes('aria-valuenow')).toBe('0');

		// Expand back
		await wrapper.setProps({ collapsed: false });
		expect(wrapper.find('[data-testid="divider"]').attributes('aria-valuenow')).toBe('75');
	});
});
