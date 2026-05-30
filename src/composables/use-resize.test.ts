import { mount } from "@vue/test-utils";
import { useResizeObserver } from "@vueuse/core";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { computed, defineComponent, ref } from "vue";
import { useResize } from "./use-resize";
import { useSizes } from "./use-sizes";

vi.mock("@vueuse/core", async () => {
	const actual = await vi.importActual<typeof import("@vueuse/core")>("@vueuse/core");

	return {
		...actual,
		useResizeObserver: vi.fn(),
	};
});

describe("useResize", () => {
	let mockObserver: ResizeObserver;

	beforeEach(() => {
		mockObserver = new ResizeObserver(() => {});
		vi.mocked(useResizeObserver).mockReset();
		vi.mocked(useResizeObserver).mockReturnValue(
			undefined as unknown as ReturnType<typeof useResizeObserver>,
		);
	});

	it("should not reset sizePercentage when no primary has been set", () => {
		const sizePercentage = ref(100);

		const wrapper = mount(
			defineComponent({
				template: "<div />",
				setup() {
					return useResize(sizePercentage, {
						sizePixels: computed(() => 50),
						panelEl: document.createElement("div"),
						orientation: ref("horizontal"),
						primary: ref(undefined),
						collapsed: ref(false),
						sizeUnit: ref("%"),
					});
				},
			}),
		);

		const entry = { contentRect: { width: 75, height: 75 } } as ResizeObserverEntry;

		wrapper.vm.onResize([entry], mockObserver);

		expect(sizePercentage.value).toBe(100);
	});

	it("should set the sizePercentage based on the primary size width", () => {
		const sizePercentage = ref(50);

		const wrapper = mount(
			defineComponent({
				template: "<div />",
				setup() {
					return useResize(sizePercentage, {
						sizePixels: computed(() => 250),
						panelEl: document.createElement("div"),
						orientation: ref("horizontal"),
						primary: ref("start"),
						collapsed: ref(false),
						sizeUnit: ref("%"),
					});
				},
			}),
		);

		const entry = { contentRect: { width: 400, height: 150 } } as ResizeObserverEntry;

		wrapper.vm.onResize([entry], mockObserver);

		// Pixel size of 250 on a total width of 400 = 62.5%
		expect(sizePercentage.value).toBe(62.5);
	});

	it("should use the height when orientation is vertical", () => {
		const sizePercentage = ref(50);

		const wrapper = mount(
			defineComponent({
				template: "<div />",
				setup() {
					return useResize(sizePercentage, {
						sizePixels: computed(() => 250),
						panelEl: document.createElement("div"),
						orientation: ref("vertical"),
						primary: ref("start"),
						collapsed: ref(false),
						sizeUnit: ref("%"),
					});
				},
			}),
		);

		const entry = { contentRect: { width: 150, height: 400 } } as ResizeObserverEntry;

		wrapper.vm.onResize([entry], mockObserver);

		// Pixel size of 250 on a total width of 400 = 62.5%
		expect(sizePercentage.value).toBe(62.5);
	});

	it("should use initial sizePixels when resize fires before mounted", () => {
		const sizePercentage = ref(50);
		const entry = { contentRect: { width: 400, height: 150 } } as ResizeObserverEntry;

		vi.mocked(useResizeObserver).mockImplementation((_target, callback) => {
			callback([entry], mockObserver);
			return undefined as unknown as ReturnType<typeof useResizeObserver>;
		});

		mount(
			defineComponent({
				template: "<div />",
				setup() {
					return useResize(sizePercentage, {
						sizePixels: computed(() => 250),
						panelEl: document.createElement("div"),
						orientation: ref("horizontal"),
						primary: ref("start"),
						collapsed: ref(false),
						sizeUnit: ref("%"),
					});
				},
			}),
		);

		expect(sizePercentage.value).toBe(62.5);
	});

	it("should not write when the observed size is zero", () => {
		const sizePercentage = ref(50);

		const wrapper = mount(
			defineComponent({
				template: "<div />",
				setup() {
					return useResize(sizePercentage, {
						sizePixels: computed(() => 250),
						panelEl: document.createElement("div"),
						orientation: ref("horizontal"),
						primary: ref("start"),
						collapsed: ref(false),
						sizeUnit: ref("%"),
					});
				},
			}),
		);

		const entry = { contentRect: { width: 0, height: 150 } } as ResizeObserverEntry;

		wrapper.vm.onResize([entry], mockObserver);

		expect(sizePercentage.value).toBe(50);
	});

	it("should not write when the cached expanded size is zero", () => {
		const sizePercentage = ref(50);

		const wrapper = mount(
			defineComponent({
				template: "<div />",
				setup() {
					return useResize(sizePercentage, {
						sizePixels: computed(() => 0),
						panelEl: document.createElement("div"),
						orientation: ref("horizontal"),
						primary: ref("start"),
						collapsed: ref(false),
						sizeUnit: ref("%"),
					});
				},
			}),
		);

		const entry = { contentRect: { width: 400, height: 150 } } as ResizeObserverEntry;

		wrapper.vm.onResize([entry], mockObserver);

		expect(sizePercentage.value).toBe(50);
	});

	for (const primary of ["start", "end"] as const) {
		it(`should not mutate sizePercentage while collapsed for primary ${primary}`, () => {
			const sizePercentage = ref(50);

			const wrapper = mount(
				defineComponent({
					template: "<div />",
					setup() {
						return useResize(sizePercentage, {
							sizePixels: computed(() => 250),
							panelEl: document.createElement("div"),
							orientation: ref("horizontal"),
							primary: ref(primary),
							collapsed: ref(true),
							sizeUnit: ref("%"),
						});
					},
				}),
			);

			const entry = { contentRect: { width: 220, height: 150 } } as ResizeObserverEntry;

			wrapper.vm.onResize([entry], mockObserver);

			expect(sizePercentage.value).toBe(50);
		});

		it(`should preserve a pixel size model across collapsed remount for primary ${primary}`, () => {
			const size = ref(451);
			const collapsed = ref(true);
			const panelEl = document.createElement("div");
			const dividerEl = document.createElement("div");

			Object.defineProperty(panelEl, "offsetWidth", { value: 900, writable: true });
			Object.defineProperty(panelEl, "offsetHeight", { value: 400, writable: true });
			Object.defineProperty(dividerEl, "offsetWidth", { value: 8, writable: true });
			Object.defineProperty(dividerEl, "offsetHeight", { value: 8, writable: true });

			const wrapper = mount(
				defineComponent({
					template: "<div />",
					setup() {
						const { sizePercentage, sizePixels } = useSizes(size, {
							disabled: false,
							collapsible: true,
							primary,
							orientation: "horizontal",
							sizeUnit: "px",
							minSize: 220,
							maxSize: undefined,
							snapPoints: [],
							panelEl,
							dividerEl,
							collapsedSize: 0,
						});

						return useResize(sizePercentage, {
							sizePixels,
							panelEl,
							orientation: ref("horizontal"),
							primary: ref(primary),
							collapsed,
							sizeUnit: ref("px"),
						});
					},
				}),
			);

			const collapsedEntry = { contentRect: { width: 220, height: 400 } } as ResizeObserverEntry;

			wrapper.vm.onResize([collapsedEntry], mockObserver);

			expect(size.value).toBe(451);

			collapsed.value = false;

			const expandedEntry = { contentRect: { width: 900, height: 400 } } as ResizeObserverEntry;

			wrapper.vm.onResize([expandedEntry], mockObserver);

			expect(size.value).toBe(451);
		});
	}

	it("should preserve a pixel size model when resize fires before mounted", () => {
		const size = ref(338);
		const collapsed = ref(false);
		const panelEl = document.createElement("div");
		const dividerEl = document.createElement("div");
		const entry = { contentRect: { width: 900, height: 400 } } as ResizeObserverEntry;

		Object.defineProperty(panelEl, "offsetWidth", { value: 900, writable: true });
		Object.defineProperty(panelEl, "offsetHeight", { value: 400, writable: true });
		Object.defineProperty(dividerEl, "offsetWidth", { value: 8, writable: true });
		Object.defineProperty(dividerEl, "offsetHeight", { value: 8, writable: true });

		vi.mocked(useResizeObserver).mockImplementation((_target, callback) => {
			callback([entry], mockObserver);
			return undefined as unknown as ReturnType<typeof useResizeObserver>;
		});

		mount(
			defineComponent({
				template: "<div />",
				setup() {
					const { sizePercentage, sizePixels } = useSizes(size, {
						disabled: false,
						collapsible: true,
						primary: "start",
						orientation: "horizontal",
						sizeUnit: "px",
						minSize: 220,
						maxSize: undefined,
						snapPoints: [],
						panelEl,
						dividerEl,
						collapsedSize: 0,
					});

					return useResize(sizePercentage, {
						sizePixels,
						panelEl,
						orientation: ref("horizontal"),
						primary: ref("start"),
						collapsed,
						sizeUnit: ref("px"),
					});
				},
			}),
		);

		expect(size.value).toBe(338);
	});
});
