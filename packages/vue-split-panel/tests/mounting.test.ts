import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { SplitPanel } from '../src';

describe('basic mounting and rendering', () => {
	it('mounts without crashing', () => {
		const wrapper = mount(SplitPanel);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders start, divider, and end slots', () => {
		const wrapper = mount(SplitPanel);
		expect(wrapper.find('[data-testid="start"]').exists()).toBe(true);
		expect(wrapper.find('[data-testid="divider"]').exists()).toBe(true);
		expect(wrapper.find('[data-testid="end"]').exists()).toBe(true);
	});

	it('renders slot content correctly', () => {
		const wrapper = mount(SplitPanel, {
			slots: {
				start: '<div class="test-panel-start">Start Panel</div>',
				divider: '<div class="test-divider">Divider</div>',
				end: '<div class="test-panel-end">End Panel</div>',
			},
		});

		expect(wrapper.find('.test-panel-start').text()).toBe('Start Panel');
		expect(wrapper.find('.test-divider').text()).toBe('Divider');
		expect(wrapper.find('.test-panel-end').text()).toBe('End Panel');
	});

	it('renders default divider div when no divider slot content is given', () => {
		const wrapper = mount(SplitPanel);
		const divider = wrapper.find('.divider');

		expect(divider.exists()).toBe(true);
		expect(divider.find('div').exists()).toBe(true);
	});
});
