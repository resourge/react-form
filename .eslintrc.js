const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
	env: {
		browser: true,
		es2021: true
	},
	extends: [
		'plugin:react/recommended',
		'standard-with-typescript',
		'react-app'
	],
	ignorePatterns: ['**/dist/*', './main.js', '**/examples/**/*'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 'latest',
		sourceType: 'module'
	},
	plugins: [
		'react',
		'@typescript-eslint',
		'typescript-sort-keys',
		'import-newlines'
	],
	overrides: [
		{
			files: ['*.ts', '*.tsx', '*.js'], // Your TypeScript files extension
			parserOptions: {
				project: ['./tsconfig.json'] // Specify it only for TypeScript files
			}
		},
		{
			files: ['vite.config.ts', './scripts/assetManifest.ts'], // Your TypeScript files extension
			parserOptions: {
				project: ['./tsconfig.node.json'] // Specify it only for TypeScript files
			}
		},
		{
			files: ['*.test.*'], // Your TypeScript files extension
			extends: [
				'plugin:testing-library/react'
			],
			rules: {
				'testing-library/prefer-presence-queries': 'off'
			}
		}
	],
	rules: {
		'@typescript-eslint/no-misused-promises': [
			'error',
			{
				checksVoidReturn: {
					attributes: false
				}
			}
		],
		'@typescript-eslint/ban-ts-comment': [
			'error',
			{
				'ts-expect-error': 'allow-with-description',
				'ts-ignore': false,
				'ts-nocheck': false,
				'ts-check': false,
				minimumDescriptionLength: 3
			}
		],
		'typescript-sort-keys/interface': [
			'error',
			'asc',
			{
				caseSensitive: false,
				natural: true,
				requiredFirst: true
			}
		],
		'react/no-unstable-nested-components': 0,
		'newline-per-chained-call': ['error', {
			ignoreChainWithDepth: 1
		}],
		'object-property-newline': ['error', {
			allowAllPropertiesOnSameLine: false
		}],
		'object-curly-newline': ['error', {
			ObjectExpression: {
				minProperties: 1,
				multiline: true
			},
			ObjectPattern: {
				minProperties: 3,
				multiline: true
			},
			ExportDeclaration: {
				multiline: true,
				minProperties: 3
			}
		}],
		'import-newlines/enforce': [
			'error',
			{
				items: 3,
				semi: false,
				forceSingleLine: true
			}
		],
		'react/no-multi-comp': [1],
		'react/jsx-curly-newline': [1],
		'react/jsx-indent': [1, 'tab'],
		'react/jsx-closing-bracket-location': [1],
		'react/jsx-one-expression-per-line': [1, {
			allow: 'literal'
		}],
		'react/jsx-sort-props': [1, {
			callbacksLast: true,
			reservedFirst: true,
			locale: 'en'
		}],
		'react/jsx-max-props-per-line': [1, {
			maximum: 1,
			when: 'multiline'
		}],
		'react/jsx-first-prop-new-line': [2, 'multiline-multiprop'],
		'react/jsx-wrap-multilines': ['error', {
			declaration: 'parens-new-line',
			assignment: 'parens-new-line',
			return: 'parens-new-line',
			arrow: 'parens-new-line',
			condition: 'parens-new-line',
			logical: 'parens-new-line',
			prop: 'parens-new-line'
		}
		],
		'comma-dangle': ['error', 'never'],
		'react/prop-types': 'off',
		'require-await': 'off',
		'@typescript-eslint/require-await': 'error',
		'@typescript-eslint/triple-slash-reference': ['error', {
			path: 'never',
			types: 'always',
			lib: 'never'
		}],
		'react/react-in-jsx-scope': 0,
		indent: 0,
		'@typescript-eslint/indent': ['error', 'tab', {
			MemberExpression: 0,
			SwitchCase: 1,
			ignoredNodes: ['TSTypeParameterInstantiation']
		}],
		'no-tabs': 'off',
		'no-await-in-loop': ['error'],
		'brace-style': ['error', 'stroustrup'],
		'@typescript-eslint/strict-boolean-expressions': 0,
		'@typescript-eslint/no-unnecessary-boolean-literal-compare': 0,
		'@typescript-eslint/explicit-function-return-type': 0,
		'space-before-function-paren': 'off',
		'@typescript-eslint/space-before-function-paren': 0,
		'consistent-type-definitions': 'off',
		'@typescript-eslint/consistent-type-definitions': 'off',
		'space-in-parens': 'off',
		semi: 'off',
		'@typescript-eslint/semi': 'off',
		'no-trailing-spaces': 'off',
		'@typescript-eslint/prefer-optional-chain': 'off',
		'no-case-declarations': 'off',
		'@typescript-eslint/promise-function-async': 'off',
		'@typescript-eslint/brace-style': 'off',
		'@typescript-eslint/no-namespace': 'off',
		'@typescript-eslint/no-floating-promises': 'off',
		'no-console': isProduction ? 'error' : 'off',
		'no-empty-pattern': isProduction ? 'error' : 'warn',
		'@typescript-eslint/no-unused-vars': isProduction ? 'error' : 'warn',
		'prefer-promise-reject-errors': 'off',
		'@typescript-eslint/no-extraneous-class': 'off',
		'multiline-ternary': 'off',
		'import/order': ['error', {
			groups: [
				['builtin', 'external'],
				'internal',
				'parent',
				'sibling',
				'index',
				'object'
			],
			pathGroups: [
				{
					pattern: 'react+(|-native)',
					group: 'external',
					position: 'before'
				}
			],
			pathGroupsExcludedImportTypes: ['react'],
			'newlines-between': 'always',
			alphabetize: {
				order: 'asc',
				caseInsensitive: false
			}
		}]
	},
	settings: {
		react: {
			// React version. "detect" automatically picks the version you have installed.
			version: 'detect'
		},
		'import/internal-regex': ['src/']
	}
};
