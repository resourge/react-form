import deepmerge from '@fastify/deepmerge';
import { defineConfig, type UserConfigExport } from 'vite';
import banner from 'vite-plugin-banner';
import dts from 'vite-plugin-dts';

import PackageJson from '../package.json';

import { createBanner } from './createBanner';
import { packages } from './getPackages';

const { devDependencies = {}, peerDependencies = {} } = PackageJson;

const external = [
	'react/jsx-runtime',
	...Object.keys(peerDependencies),
	...Object.keys(devDependencies)
];

const packagesNames = packages.map((pack) => pack.name);

const entryLibrary = './src/lib/index.ts';

const deepMerge = deepmerge();

export const defineLibConfig = (
	config: UserConfigExport,
	afterBuild?: (() => Promise<void> | void)
): UserConfigExport => defineConfig((originalConfig) => deepMerge(
	typeof config === 'function'
		? config(originalConfig)
		: config,
	{
		build: {
			lib: {
				entry: entryLibrary,
				fileName: 'index',
				formats: ['es'],
				name: 'index'
			},
			minify: false,
			outDir: './dist',
			rollupOptions: {
				external
			},
			sourcemap: true
		},
		plugins: [
			banner(createBanner()),
			dts({
				afterBuild,
				bundledPackages: packagesNames,
				compilerOptions: {
					baseUrl: '.',
					paths: {},
					preserveSymlinks: true
				},
				insertTypesEntry: true,
				rollupTypes: true
			})
		],
		resolve: {
			preserveSymlinks: true,
			tsconfigPaths: true
		},
		test: {
			environment: 'jsdom',
			globals: true,
			setupFiles: './src/setupTests.ts'
		}
	}
));
