import tsdownConfig from "./tsdown.config.js";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

export default defineConfig({
	lib: tsdownConfig,
	root: "./playground",
	plugins: [vue()],
});
