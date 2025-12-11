/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// Thème monochrome noir et blanc
				primary: {
					DEFAULT: '#000000',
					light: '#333333',
					lighter: '#666666'
				},
				background: {
					DEFAULT: '#ffffff',
					alt: '#f5f5f5',
					dark: '#000000'
				}
			}
		}
	},
	plugins: []
};

