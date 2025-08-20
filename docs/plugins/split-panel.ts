import { defineNuxtPlugin } from "nuxt/app";
import { SplitPanel } from '@directus/vue-split-panel';

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.component('SplitPanel', SplitPanel);
});
