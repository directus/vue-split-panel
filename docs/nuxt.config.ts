export default defineNuxtConfig({
	extends: ["docus"],
	modules: [],
	css: ["@directus/vue-split-panel/index.css"],
	compatibilityDate: "2025-07-18",
	components: [{ path: "~/components", global: true }],
	robots: {
		robotsTxt: false,
	},
	llms: {
		domain: "https://directus.github.io/vue-split-panel",
	},
});
