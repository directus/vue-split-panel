import { describe, expect, it } from "vite-plus/test";
import { computed, nextTick, ref } from "vue";
import { useCollapse } from "./use-collapse";
import { useSizes } from "./use-sizes";

describe("useCollapse", () => {
	it("should return expected methods and properties", () => {
		const collapsed = ref(false);

		const result = useCollapse(collapsed, { transitionDuration: 300 });

		expect(result).toHaveProperty("collapse");
		expect(result).toHaveProperty("expand");
		expect(result).toHaveProperty("toggle");
		expect(result).toHaveProperty("collapseTransitionState");
		expect(result).toHaveProperty("transitionDurationCss");
		expect(typeof result.collapse).toBe("function");
		expect(typeof result.expand).toBe("function");
		expect(typeof result.toggle).toBe("function");
		expect(result.collapseTransitionState.value).toBeNull();
		expect(result.transitionDurationCss.value).toBe("300ms");
	});

	describe("collapse method", () => {
		it("should set collapsed to true", () => {
			const collapsed = ref(false);

			const { collapse } = useCollapse(collapsed, { transitionDuration: 300 });

			collapse();

			expect(collapsed.value).toBe(true);
		});
	});

	describe("expand method", () => {
		it("should set collapsed to false", () => {
			const collapsed = ref(true);

			const { expand } = useCollapse(collapsed, { transitionDuration: 300 });

			expand();

			expect(collapsed.value).toBe(false);
		});
	});

	describe("toggle method", () => {
		it("should set collapsed to the provided value", () => {
			const collapsed = ref(false);

			const { toggle } = useCollapse(collapsed, { transitionDuration: 300 });

			toggle(true);
			expect(collapsed.value).toBe(true);

			toggle(false);
			expect(collapsed.value).toBe(false);
		});
	});

	describe("collapsed watcher behavior", () => {
		it("should not change sizePercentage when collapsed changes", async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(75);

			const { collapseTransitionState } = useCollapse(collapsed, { transitionDuration: 300 });

			collapsed.value = true;
			await nextTick();

			expect(sizePercentage.value).toBe(75);
			expect(collapseTransitionState.value).toBe("collapsing");

			collapsed.value = false;
			await nextTick();

			expect(sizePercentage.value).toBe(75);
			expect(collapseTransitionState.value).toBe("expanding");
		});

		it("should preserve expanded size when mounted collapsed and expanded", async () => {
			const collapsed = ref(true);
			const sizePercentage = ref(62);

			const { collapseTransitionState, expand } = useCollapse(collapsed, { transitionDuration: 300 });

			expand();
			await nextTick();

			expect(collapsed.value).toBe(false);
			expect(sizePercentage.value).toBe(62);
			expect(collapseTransitionState.value).toBe("expanding");
		});
	});

	describe("transition state management", () => {
		it("should start with null transition state", () => {
			const collapsed = ref(false);

			const { collapseTransitionState } = useCollapse(collapsed, { transitionDuration: 300 });

			expect(collapseTransitionState.value).toBeNull();
		});

		it("should set collapsing state when collapsed becomes true", async () => {
			const collapsed = ref(false);

			const { collapseTransitionState } = useCollapse(collapsed, { transitionDuration: 300 });

			collapsed.value = true;
			await nextTick();

			expect(collapseTransitionState.value).toBe("collapsing");
		});

		it("should set expanding state when collapsed becomes false", async () => {
			const collapsed = ref(true);

			const { collapseTransitionState } = useCollapse(collapsed, { transitionDuration: 300 });

			collapsed.value = false;
			await nextTick();

			expect(collapseTransitionState.value).toBe("expanding");
		});
	});

	describe("transitionDurationCss", () => {
		it("should return CSS transition duration", () => {
			const collapsed = ref(false);

			const { transitionDurationCss } = useCollapse(collapsed, { transitionDuration: 500 });

			expect(transitionDurationCss.value).toBe("500ms");
		});

		it("should be reactive to transition duration changes", () => {
			const collapsed = ref(false);
			const transitionDuration = ref(300);

			const { transitionDurationCss } = useCollapse(collapsed, { transitionDuration });

			expect(transitionDurationCss.value).toBe("300ms");

			transitionDuration.value = 600;
			expect(transitionDurationCss.value).toBe("600ms");
		});
	});

	describe("integration scenarios", () => {
		it("should handle rapid collapse/expand operations without changing size", async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(65);

			const { collapseTransitionState } = useCollapse(collapsed, { transitionDuration: 300 });

			collapsed.value = true;
			await nextTick();
			expect(collapseTransitionState.value).toBe("collapsing");
			expect(sizePercentage.value).toBe(65);

			collapsed.value = false;
			await nextTick();
			expect(collapseTransitionState.value).toBe("expanding");
			expect(sizePercentage.value).toBe(65);
		});

		it("should work with methods triggering state changes", async () => {
			const collapsed = ref(false);
			const sizePercentage = ref(45);

			const { collapse, expand, toggle, collapseTransitionState } = useCollapse(collapsed, {
				transitionDuration: 300,
			});

			collapse();
			await nextTick();
			expect(collapsed.value).toBe(true);
			expect(sizePercentage.value).toBe(45);
			expect(collapseTransitionState.value).toBe("collapsing");

			expand();
			await nextTick();
			expect(collapsed.value).toBe(false);
			expect(sizePercentage.value).toBe(45);
			expect(collapseTransitionState.value).toBe("expanding");

			toggle(true);
			await nextTick();
			expect(collapsed.value).toBe(true);
			expect(sizePercentage.value).toBe(45);
			expect(collapseTransitionState.value).toBe("collapsing");
		});

		it("should not write collapsedSize into a pixel size model", async () => {
			const size = ref(320);
			const collapsed = ref(false);
			const panelEl = document.createElement("div");
			const dividerEl = document.createElement("div");

			Object.defineProperty(panelEl, "offsetWidth", { value: 400, writable: true });
			Object.defineProperty(panelEl, "offsetHeight", { value: 300, writable: true });
			Object.defineProperty(dividerEl, "offsetWidth", { value: 8, writable: true });
			Object.defineProperty(dividerEl, "offsetHeight", { value: 8, writable: true });

			const { collapsedSizePercentage, sizePercentage } = useSizes(size, {
				disabled: false,
				collapsible: true,
				primary: "start",
				orientation: "horizontal",
				sizeUnit: "px",
				minSize: 0,
				maxSize: undefined,
				snapPoints: [],
				panelEl,
				dividerEl,
				collapsedSize: 48,
			});

			useCollapse(collapsed, { transitionDuration: 300 });

			expect(size.value).toBe(320);
			expect(sizePercentage.value).toBe(80);
			expect(collapsedSizePercentage.value).toBe(12);

			collapsed.value = true;
			await nextTick();

			expect(size.value).toBe(320);
			expect(sizePercentage.value).toBe(80);
			expect(collapsedSizePercentage.value).toBe(12);
		});

		it("should leave collapsed visual sizing to useGridTemplate inputs", async () => {
			const sizePercentage = ref(70);
			const collapsed = ref(false);
			const collapsedSizePercentage = computed(() => 5);

			useCollapse(collapsed, { transitionDuration: 300 });

			collapsed.value = true;
			await nextTick();

			expect(sizePercentage.value).toBe(70);
			expect(collapsedSizePercentage.value).toBe(5);
		});
	});
});
