/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/setupTests.ts'
	},
	plugins: [
		react(),
		tsconfigPaths(),
		checker({ 
			typescript: true,
			enableBuild: true,
			eslint: {
				lintCommand: 'eslint "./src/**/*.{ts,tsx}"'
			}
		})
	]
})
