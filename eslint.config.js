import directusConfig from '@directus/eslint-config';

export default [
	...directusConfig,
	{
		ignores: ['.github/', 'crates/', '*.toml'],
	},
	{
		rules: {
			'unicorn/prefer-switch': 'off',
			'unicorn/prefer-ternary': 'off',
		},
	},
	{
		files: ['**/*.test.ts', '**/*.spec.ts'],
		rules: {
			'unicorn/consistent-function-scoping': 'off',
		},
	},
];
