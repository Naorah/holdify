import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
	const isTest = mode === 'test' || process.env.VITEST;

	return {
		plugins: isTest ? [] : [sveltekit()],
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}'],
			environment: 'node', // Utiliser 'node' pour les tests unitaires TypeScript purs
			globals: true
		},
		optimizeDeps: {
			include: ['html2pdf.js', 'html2canvas', 'jspdf']
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks: undefined
				}
			}
		},
		ssr: {
			external: ['html2canvas', 'jspdf']
		}
	};
});
