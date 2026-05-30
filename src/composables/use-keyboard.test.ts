import type { ComputedRef } from "vue";
import type { MockInstance } from "vite-plus/test";
import { describe, expect, it, vi } from "vite-plus/test";
import { computed, ref } from "vue";
import { useKeyboard } from "./use-keyboard";

describe("useKeyboard", () => {
	const createMockKeyboardEvent = (
		key: string,
		shiftKey = false,
	): { event: KeyboardEvent; preventDefaultSpy: MockInstance } => {
		const event = new KeyboardEvent("keydown", { key, shiftKey });
		const preventDefaultSpy = vi.spyOn(event, "preventDefault");
		return { event, preventDefaultSpy };
	};

	// Helper to build options with defaults and optional overrides
	const createOptions = (
		override: Partial<{
			disabled: boolean;
			collapsible: boolean;
			primary: "start" | "end";
			orientation: "horizontal" | "vertical";
			minSizePercentage: ComputedRef<number>;
			maxSizePercentage: ComputedRef<number | undefined>;
		}> = {},
	) => ({
		disabled: override.disabled ?? false,
		collapsible: override.collapsible ?? true,
		primary: override.primary ?? "start",
		orientation: override.orientation ?? "horizontal",
		minSizePercentage: override.minSizePercentage ?? computed(() => 0),
		maxSizePercentage: override.maxSizePercentage ?? computed(() => void 0),
	});

	it("should return handleKeydown function", () => {
		const sizePercentage = ref(50);
		const collapsed = ref(false);
		const options = createOptions();

		const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);

		expect(typeof handleKeydown).toBe("function");
	});

	it("should do nothing when disabled", () => {
		const sizePercentage = ref(50);
		const collapsed = ref(false);
		const options = createOptions({ disabled: true });

		const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
		const { event, preventDefaultSpy } = createMockKeyboardEvent("ArrowRight");

		handleKeydown(event);

		expect(sizePercentage.value).toBe(50);
		expect(preventDefaultSpy).not.toHaveBeenCalled();
	});

	describe("horizontal orientation", () => {
		it("should decrease size on ArrowLeft when primary is start", () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = createOptions();

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const { event, preventDefaultSpy } = createMockKeyboardEvent("ArrowLeft");

			handleKeydown(event);

			expect(sizePercentage.value).toBe(49);
			expect(preventDefaultSpy).toHaveBeenCalled();
		});

		it("should increase size on ArrowRight when primary is start", () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = createOptions();

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const { event, preventDefaultSpy } = createMockKeyboardEvent("ArrowRight");

			handleKeydown(event);

			expect(sizePercentage.value).toBe(51);
			expect(preventDefaultSpy).toHaveBeenCalled();
		});

		it("should increase size on ArrowLeft when primary is end", () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = createOptions({ primary: "end" });

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const { event } = createMockKeyboardEvent("ArrowLeft");

			handleKeydown(event);

			expect(sizePercentage.value).toBe(51);
		});
	});

	describe("vertical orientation", () => {
		it("should decrease size on ArrowUp when primary is start", () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = createOptions({ orientation: "vertical" });

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const { event } = createMockKeyboardEvent("ArrowUp");

			handleKeydown(event);

			expect(sizePercentage.value).toBe(49);
		});

		it("should increase size on ArrowDown when primary is start", () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = createOptions({ orientation: "vertical" });

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const { event } = createMockKeyboardEvent("ArrowDown");

			handleKeydown(event);

			expect(sizePercentage.value).toBe(51);
		});
	});

	describe("shift key modifier", () => {
		it("should change by 10 when shift key is pressed", () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = createOptions();

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const { event } = createMockKeyboardEvent("ArrowRight", true);

			handleKeydown(event);

			expect(sizePercentage.value).toBe(60);
		});
	});

	describe("Home and End keys", () => {
		it("should set to 0 on Home when primary is start", () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = createOptions();

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const { event } = createMockKeyboardEvent("Home");

			handleKeydown(event);

			expect(sizePercentage.value).toBe(0);
		});

		it("should set to 100 on End when primary is start", () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = createOptions();

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const { event } = createMockKeyboardEvent("End");

			handleKeydown(event);

			expect(sizePercentage.value).toBe(100);
		});

		it("should set to 100 on Home when primary is end", () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = createOptions({ primary: "end" });

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const { event } = createMockKeyboardEvent("Home");

			handleKeydown(event);

			expect(sizePercentage.value).toBe(100);
		});
	});

	describe("Enter key and collapsible", () => {
		it("should toggle collapsed state on Enter when collapsible is true", () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = createOptions();

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const { event } = createMockKeyboardEvent("Enter");

			handleKeydown(event);

			expect(collapsed.value).toBe(true);
		});

		it("should not toggle collapsed state on Enter when collapsible is false", () => {
			const sizePercentage = ref(50);
			const collapsed = ref(false);
			const options = createOptions({ collapsible: false });

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const { event } = createMockKeyboardEvent("Enter");

			handleKeydown(event);

			expect(collapsed.value).toBe(false);
		});
	});

	describe("clamping values", () => {
		it("should clamp size to 0 minimum", () => {
			const sizePercentage = ref(2);
			const collapsed = ref(false);
			const options = createOptions();

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const { event } = createMockKeyboardEvent("ArrowLeft", true);

			handleKeydown(event);

			expect(sizePercentage.value).toBe(0);
		});

		it("should clamp size to 100 maximum", () => {
			const sizePercentage = ref(98);
			const collapsed = ref(false);
			const options = createOptions();

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
			const { event } = createMockKeyboardEvent("ArrowRight", true);

			handleKeydown(event);

			expect(sizePercentage.value).toBe(100);
		});
	});

	it("should ignore non-handled keys", () => {
		const sizePercentage = ref(50);
		const collapsed = ref(false);
		const options = createOptions();

		const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);
		const { event, preventDefaultSpy } = createMockKeyboardEvent("KeyA");

		handleKeydown(event);

		expect(sizePercentage.value).toBe(50);
		expect(preventDefaultSpy).not.toHaveBeenCalled();
	});

	describe("custom min/max size percentages", () => {
		it("respects a custom minimum size percentage", () => {
			const sizePercentage = ref(25);
			const collapsed = ref(false);
			const options = createOptions({ minSizePercentage: computed(() => 20) });

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);

			const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
			handleKeydown(event);

			expect(sizePercentage.value).toBe(24); // still above min -> decremented

			for (let i = 0; i < 10; i++)
				handleKeydown(new KeyboardEvent("keydown", { key: "ArrowLeft" }));

			expect(sizePercentage.value).toBe(20); // clamped to min
		});

		it("respects a custom maximum size percentage", () => {
			const sizePercentage = ref(75);
			const collapsed = ref(false);
			const options = createOptions({ maxSizePercentage: computed(() => 80) });

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);

			const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
			handleKeydown(event);

			expect(sizePercentage.value).toBe(76);

			for (let i = 0; i < 10; i++)
				handleKeydown(new KeyboardEvent("keydown", { key: "ArrowRight" }));

			expect(sizePercentage.value).toBe(80); // clamped to max
		});

		it("clamps both min and max simultaneously", () => {
			const sizePercentage = ref(40);
			const collapsed = ref(false);
			const options = createOptions({
				minSizePercentage: computed(() => 30),
				maxSizePercentage: computed(() => 60),
			});

			const { handleKeydown } = useKeyboard(sizePercentage, collapsed, options);

			// Grow past max with shift
			handleKeydown(new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true })); // +10 => 50
			expect(sizePercentage.value).toBe(50);

			handleKeydown(new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true })); // +10 => 60
			expect(sizePercentage.value).toBe(60);

			handleKeydown(new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true })); // attempt +10 => 70 -> clamp 60
			expect(sizePercentage.value).toBe(60);

			// Shrink past min with shift
			handleKeydown(new KeyboardEvent("keydown", { key: "ArrowLeft", shiftKey: true })); // -10 => 50
			expect(sizePercentage.value).toBe(50);

			for (let i = 0; i < 10; i++)
				handleKeydown(new KeyboardEvent("keydown", { key: "ArrowLeft", shiftKey: true }));
			expect(sizePercentage.value).toBe(30);
		});
	});
});
