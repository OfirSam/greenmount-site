// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/** @param {string} file */
const fs = (file) => `./node_modules/${file}`;
/** @type {[string, ...string[]]} */
const HEBREW = ['U+0307-0308', 'U+0590-05FF', 'U+200C-2010', 'U+20AA', 'U+25CC', 'U+FB1D-FB4F'];
/** @type {[string, ...string[]]} */
const LATIN = [
	'U+0000-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC', 'U+02C6', 'U+02DA', 'U+02DC', 'U+0304', 'U+0308',
	'U+0329', 'U+2000-206F', 'U+20AC', 'U+2122', 'U+2191', 'U+2193', 'U+2212', 'U+2215', 'U+FEFF', 'U+FFFD',
];

export default defineConfig({
	site: 'https://greenmount.co.il',
	output: 'static',
	// /privacy.html is served at /privacy on Netlify – no trailing-slash redirect hop
	build: { format: 'file', inlineStylesheets: 'always' },
	trailingSlash: 'never',
	devToolbar: { enabled: false },
	integrations: [
		sitemap({
			filter: (page) => !page.includes('/thanks') && !page.includes('/404'),
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
	// Self-hosted fonts – exact subset files from the installed @fontsource packages
	// (Hebrew + Basic Latin only). Astro generates metric-matched fallbacks to avoid layout shift.
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Karantina',
			cssVariable: '--gm-font-he-display',
			display: 'swap',
			fallbacks: ['Arial Narrow', 'sans-serif'],
			options: {
				variants: [
					{ src: [fs('@fontsource/karantina/files/karantina-hebrew-700-normal.woff2')], weight: 700, style: 'normal', unicodeRange: HEBREW },
					{ src: [fs('@fontsource/karantina/files/karantina-latin-700-normal.woff2')], weight: 700, style: 'normal', unicodeRange: LATIN },
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'Assistant',
			cssVariable: '--gm-font-body',
			display: 'swap',
			// Hebrew-calibrated fallback defined in src/styles/global.css (Astro's auto fallback is
			// computed from Latin glyphs and was 33% too wide for Hebrew → text reflow / CLS)
			fallbacks: ['Assistant Fallback', 'Arial', 'sans-serif'],
			optimizedFallbacks: false,
			options: {
				variants: [
					{ src: [fs('@fontsource-variable/assistant/files/assistant-hebrew-wght-normal.woff2')], weight: '200 800', style: 'normal', unicodeRange: HEBREW },
					{ src: [fs('@fontsource-variable/assistant/files/assistant-latin-wght-normal.woff2')], weight: '200 800', style: 'normal', unicodeRange: LATIN },
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'Barlow Condensed',
			cssVariable: '--gm-font-latin-display',
			display: 'swap',
			fallbacks: ['Arial Narrow', 'sans-serif'],
			options: {
				variants: [
					{ src: [fs('@fontsource/barlow-condensed/files/barlow-condensed-latin-800-normal.woff2')], weight: 800, style: 'normal', unicodeRange: LATIN },
				],
			},
		},
	],
});
