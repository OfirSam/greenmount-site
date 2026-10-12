/**
 * Instagram feed (Behold.so JSON) rendered into our own grid.
 * - Loads only when the section is ~600px from the viewport.
 * - Cached in sessionStorage for 1 hour.
 * - Any failure keeps the server-rendered fallback photos.
 * Supports both Behold feed formats: `{ posts: [...] }` and a bare array.
 */
import { track } from './track';

interface Size {
	mediaUrl: string;
	width?: number;
	height?: number;
}
interface Post {
	id: string;
	permalink: string;
	mediaType?: string;
	isReel?: boolean;
	mediaUrl?: string;
	thumbnailUrl?: string;
	caption?: string;
	prunedCaption?: string;
	sizes?: { small?: Size; medium?: Size; large?: Size; full?: Size };
}

const CACHE_KEY = 'gm-ig-feed';
const TTL = 60 * 60 * 1000;

export function initInstagram() {
	const grid = document.querySelector<HTMLElement>('[data-ig-feed]');
	const url = grid?.dataset.igFeed;
	if (!grid || !url) return;

	const io = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			io.disconnect();
			load(grid, url).catch(() => {
				/* keep fallback */
			});
		},
		{ rootMargin: '600px 0px' },
	);
	io.observe(grid);
}

async function load(grid: HTMLElement, url: string) {
	const count = Number(grid.dataset.igCount) || 6;
	let posts = readCache();
	if (!posts) {
		const res = await fetch(url);
		if (!res.ok) throw new Error(String(res.status));
		const json = await res.json();
		posts = (Array.isArray(json) ? json : json.posts) as Post[];
		writeCache(posts);
	}
	const items = posts
		.map((p) => ({ p, src: p.sizes?.medium?.mediaUrl || p.sizes?.small?.mediaUrl || p.thumbnailUrl || p.mediaUrl }))
		.filter((x): x is { p: Post; src: string } => Boolean(x.src && x.p.permalink))
		.slice(0, count);
	if (!items.length) return;

	const frag = document.createDocumentFragment();
	for (const { p, src } of items) {
		const caption = (p.prunedCaption || p.caption || '').replace(/\s+/g, ' ').trim();
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.className = 'ig-tile';
		a.href = p.permalink;
		a.target = '_blank';
		a.rel = 'noopener';
		a.dataset.track = 'social';
		a.dataset.src = 'instagram-post';
		a.setAttribute('aria-label', caption ? `פוסט באינסטגרם: ${caption.slice(0, 90)}` : 'פוסט באינסטגרם');

		const img = document.createElement('img');
		img.src = src;
		img.alt = '';
		img.loading = 'lazy';
		img.decoding = 'async';
		img.width = 400;
		img.height = 400;
		a.append(img);

		if (p.mediaType === 'VIDEO' || p.isReel) {
			const badge = document.createElement('span');
			badge.className = 'ig-video-badge';
			badge.textContent = 'REEL';
			a.append(badge);
		}
		li.append(a);
		frag.append(li);
	}
	grid.replaceChildren(frag);
	track('instagram_loaded', { source: String(items.length) });
}

function readCache(): Post[] | null {
	try {
		const raw = sessionStorage.getItem(CACHE_KEY);
		if (!raw) return null;
		const { t, posts } = JSON.parse(raw);
		return Date.now() - t < TTL ? posts : null;
	} catch {
		return null;
	}
}

function writeCache(posts: Post[]) {
	try {
		sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), posts }));
	} catch {
		/* storage unavailable */
	}
}
