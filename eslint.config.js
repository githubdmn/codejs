import js from '@eslint/js';

export default [
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'commonjs',
			globals: {
				require: 'readonly',
				module: 'writable',
				exports: 'writable',
				process: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				Buffer: 'readonly',
				console: 'readonly',
				setTimeout: 'readonly',
				setInterval: 'readonly',
				clearTimeout: 'readonly',
				clearInterval: 'readonly',
				setImmediate: 'readonly',
				window: 'readonly',
				document: 'readonly',
				fetch: 'readonly',
			},
		},
		rules: {
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'no-console': 'off',
		},
	},
	{
		files: ['**/*.mjs', '**/59ES6Modules/**/*.js'],
		languageOptions: {
			sourceType: 'module',
		},
	},
	{
		ignores: ['node_modules/', 'dist/', 'coverage/', 'playground/'],
	},
];
