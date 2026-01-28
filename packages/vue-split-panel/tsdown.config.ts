import { defineConfig } from 'vite-plus/lib';

export default defineConfig([
	{
		entry: ['./src/index.ts'],
		platform: 'browser',
		fromVite: true,
		dts: {
			vue: true,
		},
	},
]);
