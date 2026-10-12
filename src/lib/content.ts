import type { ImageMetadata } from 'astro';

/** Every image under /assets/images (metadata only – Astro optimizes at build). */
const images = import.meta.glob<{ default: ImageMetadata }>('/assets/images/**/*.{jpg,jpeg,png,webp,avif}', {
	eager: true,
});

function normalize(path: string) {
	const out: string[] = [];
	for (const part of path.split('/')) {
		if (part === '..') out.pop();
		else if (part && part !== '.') out.push(part);
	}
	return '/' + out.join('/');
}

/** Resolve "file.jpg" (or "../brand/file.jpg") inside /assets/images/<folder>/. */
export function image(folder: string, file: string | undefined): ImageMetadata | undefined {
	if (!file) return undefined;
	const key = normalize(`/assets/images/${folder}/${file}`);
	const mod = images[key];
	if (!mod && import.meta.env.DEV) console.warn(`[images] not found: ${key}`);
	return mod?.default;
}

/** All images in a folder, sorted by file name. */
export function folderImages(folder: string): Array<{ file: string; src: ImageMetadata }> {
	const prefix = `/assets/images/${folder}/`;
	return Object.entries(images)
		.filter(([path]) => path.startsWith(prefix) && !path.slice(prefix.length).includes('/'))
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([path, mod]) => ({ file: path.slice(prefix.length), src: mod.default }));
}

/** True when an editable string is still a placeholder. */
export const isTodo = (text: string | undefined) => !!text && /^\s*TODO\b/.test(text);

/** Escape HTML and turn **bold** into <strong>. */
export function rich(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'] as const;

export const GROUP_LABELS = { kids: 'ילדים', youth: 'נוער', adults: 'בוגרים' } as const;

export const DISCIPLINE_LABELS = {
	kids: 'אומנויות לחימה לילדים',
	'muay-thai': 'איגרוף תאילנדי / קיקבוקסינג',
	mma: 'MMA',
	bjj: "ג'יו ג'יטסו ברזילאי",
	judo: "ג'ודו",
	'fitness-women': 'כושר פונקציונלי לנשים',
	'fitness-men': 'כושר פונקציונלי לגברים',
} as const;
