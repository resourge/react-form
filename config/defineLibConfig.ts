import deepmerge from '@fastify/deepmerge'
import { resolve } from 'path'
import { defineConfig, type UserConfigExport } from 'vite'
import dts from 'vite-plugin-dts'
import viteTsconfigPaths from 'vite-tsconfig-paths'

import PackageJson from '../package.json'

import { packages } from './getPackages'

const {
	dependencies, devDependencies, peerDependencies 
} = PackageJson;

const globals: Record<string, string> = {
	vue: 'Vue',
	'react/jsx-runtime': 'ReactJsxRuntime',
	react: 'React',
	'react-dom': 'ReactDOM',
	'@resourge/shallow-clone': 'ResourceShallowClone'
}

const globalsKeys = Object.keys(globals);

const external = [
	'react/jsx-runtime',
	...Object.keys(peerDependencies),
	...Object.keys(dependencies),
	...Object.keys(devDependencies)
].filter((key) => key !== 'on-change')

const packagesNames = packages.map((pack) => pack.name);

const entryLib = './src/lib/index.ts';

const deepMerge = deepmerge();

export const defineLibConfig = (
	config: UserConfigExport,
	afterBuild?: (() => void | Promise<void>)
): UserConfigExport => defineConfig((originalConfig) => deepMerge(
	typeof config === 'function' ? config(originalConfig) : config,
	{
		test: {
			globals: true,
			environment: 'jsdom',
			setupFiles: './src/setupTests.ts'
		},
		build: {
			minify: false,
			lib: {
				entry: entryLib,
				name: 'index',
				fileName: 'index',
				formats: ['cjs', 'es', 'umd']
			},
			outDir: './dist',
			rollupOptions: {
				output: {
					dir: './dist',
					globals: external.filter((key) => globalsKeys.includes(key))
					.reduce<Record<string, string>>((obj, key) => {
						obj[key] = globals[key];
						return obj
					}, {}),
					sourcemap: true
				},
				external
			}
		},
		resolve: {
			preserveSymlinks: true,
			alias: originalConfig.mode === 'development' ? packages.reduce((obj, { name, path }) => {
				obj[name] = resolve(path, `../${entryLib}`)
				return obj;
			}, {}) : {}
		},
		plugins: [
			viteTsconfigPaths(),
			dts({
				insertTypesEntry: true,
				rollupTypes: true,
				bundledPackages: packagesNames,
				compilerOptions: {
					preserveSymlinks: true,
					paths: {}
				},
				afterBuild
			})
		]
	}
));
