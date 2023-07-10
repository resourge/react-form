/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker';

import { defineLibConfig } from './config/defineLibConfig';

// https://vitejs.dev/config/
export default defineLibConfig(({ mode }) => ({
	define: mode !== 'production' ? {
		__DEV__: (mode === 'development').toString()
	} : {},
	plugins: [
		react(),
		checker({ 
			typescript: true,
			enableBuild: true,
			overlay: {
				initialIsOpen: false
			},
			eslint: {
				lintCommand: 'eslint "./src/**/*.{ts,tsx}"'
			}
		})
	]
}))
