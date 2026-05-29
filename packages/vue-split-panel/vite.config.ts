import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

export default defineConfig({
	pack: {
		entry: ["./src/index.ts"],
		platform: "browser",
		fromVite: true,
		dts: {
			vue: true,
		},
	},
	root: "./playground",
	plugins: [vue()],
});
