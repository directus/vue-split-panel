import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useKeyboard } from './use-keyboard';

describe('useKeyboard', () => {
	const createMockKeyboardEvent = (key: string, shiftKey = false): KeyboardEvent => {
		const event = new KeyboardEvent('keydown', { key, shiftKey });
		vi.spyOn(event, 'preventDefault');
		return event;
	};

	it('should return handleKeydown function', () => {
		const sizePercentage = ref(50);
		const collapsed = ref(false);
		const options = {
			disabled: false,
			collapsible: true,
			primary: 'start' as const,
			orientation: 'horizontal' as const,
		};

		const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);

		expect(typeof handleKeydown).toBe('function');
	});

	it('should do nothing when disabled', () => {
		const sizePercentage = ref(50);
		const collapsed = ref(false);
		const options = {
			disabled: true,
			collapsible: true,
			primary: 'start' as const,
			orientation: 'horizontal' as const,
		};

		const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
		const event = createMockKeyboardEvent('ArrowRight');

		handleKeydown(event);

		expect(sizePercentage.value).toBe(50);
		expect(event.preventDefault).not.toHaveBeenCalled();
	});

	describe('horizontal orientation', () => {
		it('should decrease size on ArrowLeft when primary is start', () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = {
				disabled: false,
				collapsible: true,
				primary: 'start' as const,
				orientation: 'horizontal' as const,
			};

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const event = createMockKeyboardEvent('ArrowLeft');

			handleKeydown(event);

			expect(sizePercentage.value).toBe(49);
			expect(event.preventDefault).toHaveBeenCalled();
		});

		it('should increase size on ArrowRight when primary is start', () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = {
				disabled: false,
				collapsible: true,
				primary: 'start' as const,
				orientation: 'horizontal' as const,
			};

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const event = createMockKeyboardEvent('ArrowRight');

			handleKeydown(event);

			expect(sizePercentage.value).toBe(51);
			expect(event.preventDefault).toHaveBeenCalled();
		});

		it('should increase size on ArrowLeft when primary is end', () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = {
				disabled: false,
				collapsible: true,
				primary: 'end' as const,
				orientation: 'horizontal' as const,
			};

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const event = createMockKeyboardEvent('ArrowLeft');

			handleKeydown(event);

			expect(sizePercentage.value).toBe(51);
		});
	});

	describe('vertical orientation', () => {
		it('should decrease size on ArrowUp when primary is start', () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = {
				disabled: false,
				collapsible: true,
				primary: 'start' as const,
				orientation: 'vertical' as const,
			};

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const event = createMockKeyboardEvent('ArrowUp');

			handleKeydown(event);

			expect(sizePercentage.value).toBe(49);
		});

		it('should increase size on ArrowDown when primary is start', () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = {
				disabled: false,
				collapsible: true,
				primary: 'start' as const,
				orientation: 'vertical' as const,
			};

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const event = createMockKeyboardEvent('ArrowDown');

			handleKeydown(event);

			expect(sizePercentage.value).toBe(51);
		});
	});

	describe('shift key modifier', () => {
		it('should change by 10 when shift key is pressed', () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = {
				disabled: false,
				collapsible: true,
				primary: 'start' as const,
				orientation: 'horizontal' as const,
			};

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const event = createMockKeyboardEvent('ArrowRight', true);

			handleKeydown(event);

			expect(sizePercentage.value).toBe(60);
		});
	});

	describe('Home and End keys', () => {
		it('should set to 0 on Home when primary is start', () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = {
				disabled: false,
				collapsible: true,
				primary: 'start' as const,
				orientation: 'horizontal' as const,
			};

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const event = createMockKeyboardEvent('Home');

			handleKeydown(event);

			expect(sizePercentage.value).toBe(0);
		});

		it('should set to 100 on End when primary is start', () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = {
				disabled: false,
				collapsible: true,
				primary: 'start' as const,
				orientation: 'horizontal' as const,
			};

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const event = createMockKeyboardEvent('End');

			handleKeydown(event);

			expect(sizePercentage.value).toBe(100);
		});

		it('should set to 100 on Home when primary is end', () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = {
				disabled: false,
				collapsible: true,
				primary: 'end' as const,
				orientation: 'horizontal' as const,
			};

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const event = createMockKeyboardEvent('Home');

			handleKeydown(event);

			expect(sizePercentage.value).toBe(100);
		});
	});

	describe('Enter key and collapsible', () => {
		it('should toggle collapsed state on Enter when collapsible is true', () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = {
				disabled: false,
				collapsible: true,
				primary: 'start' as const,
				orientation: 'horizontal' as const,
			};

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const event = createMockKeyboardEvent('Enter');

			handleKeydown(event);

			expect(collapsed.value).toBe(true);
		});

		it('should not toggle collapsed state on Enter when collapsible is false', () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = {
				disabled: false,
				collapsible: false,
				primary: 'start' as const,
				orientation: 'horizontal' as const,
			};

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const event = createMockKeyboardEvent('Enter');

			handleKeydown(event);

			expect(collapsed.value).toBe(false);
		});
	});

	describe('clamping values', () => {
		it('should clamp size to 0 minimum', () => {
			const sizePercentage = ref(2);
			const collapsed = ref(false);
			const options = {
				disabled: false,
				collapsible: true,
				primary: 'start' as const,
				orientation: 'horizontal' as const,
			};

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const event = createMockKeyboardEvent('ArrowLeft', true);

			handleKeydown(event);

			expect(sizePercentage.value).toBe(0);
		});

		it('should clamp size to 100 maximum', () => {
			const sizePercentage = ref(98);
			const collapsed = ref(false);
			const options = {
				disabled: false,
				collapsible: true,
				primary: 'start' as const,
				orientation: 'horizontal' as const,
			};

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const event = createMockKeyboardEvent('ArrowRight', true);

			handleKeydown(event);

			expect(sizePercentage.value).toBe(100);
		});
	});

	it('should ignore non-handled keys', () => {
		const sizePercentage = ref(50);
		const collapsed = ref(false);
		const options = {
			disabled: false,
			collapsible: true,
			primary: 'start' as const,
			orientation: 'horizontal' as const,
		};

		const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
		const event = createMockKeyboardEvent('KeyA');

		handleKeydown(event);

		expect(sizePercentage.value).toBe(50);
		expect(event.preventDefault).not.toHaveBeenCalled();
	});
});
