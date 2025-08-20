import { addComponent, defineNuxtModule } from '@nuxt/kit';

export default defineNuxtModule({
	setup() {
		addComponent({
			name: 'SplitPanel',
			export: 'SplitPanel',
			filePath: '@directus/vue-split-panel',
		});
	},
});
