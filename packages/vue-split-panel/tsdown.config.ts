import { defineConfig } from 'tsdown';

export default defineConfig([
	{
		entry: ['./src/index.ts'],
		noExternal: ['@vueuse/core'],
		platform: 'browser',
		fromVite: true,
		dts: {
			vue: true,
		},
	},
]);
