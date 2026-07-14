const baseURL = process.env.NUXT_APP_BASE_URL ?? "/";

export default defineNuxtConfig({
	extends: ["docus"],
	modules: [
		(_, nuxt) => {
			nuxt.hook("pages:extend", (pages) => {
				const docusLandingIndex = pages.findIndex((page) =>
					page.path === "/" && page.file?.includes("docus/app/templates/landing.vue")
				);

				if (docusLandingIndex !== -1) pages.splice(docusLandingIndex, 1);
			});
		},
	],
	css: ["@directus/vue-split-panel/index.css"],
	compatibilityDate: "2025-07-18",
	app: {
		baseURL,
		head: {
			link: [{ rel: "icon", href: `${baseURL}favicon.ico` }],
		},
	},
	components: [{ path: "~/components", global: true }],
	robots: {
		robotsTxt: false,
	},
	llms: {
		domain: "https://directus.github.io/vue-split-panel",
	},
});
