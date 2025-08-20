import { defineConfig } from 'tsdown';

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
