/** @type {import('tailwindcss').Config} */

const sizes = {
	0: '4px',
	1: '8px',
	2: '12px',
	3: '16px',
	4: '20px',
	5: '24px',
	6: '36px',
	7: '40px',
	8: '48px',
	9: '64px',
	10: '72px',
	11: '94px',
	12: '128px',
}

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			spacing: sizes,
			fontSize: sizes,
			fontFamily: {
				'comfortaa': ['Comfortaa', 'sans-serif'],
				'lexend-deca': ['Lexend Deca', 'sans-serif']
			},
			borderRadius: sizes,
			borderWidth: {
				'input': '1px'
			},
			fontWeight: {
				normal: '400',
				bold: '700'
			},
			colors: {
				orange: {
					dark: '#E66414',
					default: '#FF924D',
					light: '#F6C9B1'
				},
				teal: {
					dark: '#05454B',
					default: '#00A8A8',
					light: "#9AD3DA"
				},
				neutral: {
					dark: '#020000',
					default: '#FFFAF3',
					light: '#fff'
				}
			},
		},
	},
	plugins: [],
}
