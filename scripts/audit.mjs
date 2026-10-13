/**
 * End-to-end site audit: crawls every page reachable from the home page + sitemap and checks
 *  - status, <title>/description (length + uniqueness), canonical, robots, og/twitter tags
 *  - exactly one <h1>, no skipped heading levels, duplicate ids, images without alt
 *  - JSON-LD parses; FAQPage questions match the visible FAQ
 *  - every internal link resolves (HTTP 200) and every #anchor exists on its target page
 *  - external links (social, WhatsApp, maps…) respond
 *   node scripts/audit.mjs [baseUrl]   (default http://localhost:4322)
 */
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'http://localhost:4322').replace(/\/$/, '');
const SITE = 'https://greenmount.co.il';
// Staging copies (*.netlify.app) are noindex on purpose (inline script in Base.astro) – judge them as if indexable
const STAGING = /\.netlify\.app$/.test(new URL(BASE).hostname);
const problems = [];
const warn = (page, msg) => problems.push(`${page}  →  ${msg}`);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// ── Collect pages: sitemap + crawl ─────────────────────────────
const sitemapIndex = await (await fetch(`${BASE}/sitemap-index.xml`)).text();
const sitemapUrls = [];
for (const sm of [...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, BASE))) {
	const xml = await (await fetch(sm)).text();
	sitemapUrls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname));
}
const queue = new Set(['/', ...sitemapUrls, '/thanks', '/404']);
const data = new Map(); // path -> page facts
const externals = new Map(); // url -> first page seen

for (const path of queue) {
	const res = await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
	const status = res?.status() ?? 0;
	const facts = await page.evaluate(() => {
		const meta = (sel) => document.querySelector(sel)?.getAttribute('content') ?? null;
		const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
		const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
			.filter((h) => !h.closest('dialog, [hidden], .a11y'))
			.map((h) => [Number(h.tagName[1]), h.textContent.replace(/\s+/g, ' ').trim()]);
		const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
			try {
				return JSON.parse(s.textContent);
			} catch {
				return { __invalid: s.textContent.slice(0, 80) };
			}
		});
		return {
			title: document.title,
			desc: meta('meta[name="description"]'),
			robots: meta('meta[name="robots"]'),
			canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
			og: {
				title: meta('meta[property="og:title"]'),
				desc: meta('meta[property="og:description"]'),
				image: meta('meta[property="og:image"]'),
				url: meta('meta[property="og:url"]'),
			},
			twitter: meta('meta[name="twitter:card"]'),
			lang: document.documentElement.lang,
			dir: document.documentElement.dir,
			h1: document.querySelectorAll('h1').length,
			headings,
			dupIds: ids.filter((id, i) => ids.indexOf(id) !== i),
			ids,
			imgNoAlt: [...document.querySelectorAll('img:not([alt])')].map((i) => i.src.split('/').pop()),
			links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
			ld,
			faqVisible: [...document.querySelectorAll('.faq-q span:first-child')].map((s) => s.textContent.trim()),
		};
	});
	data.set(path, { status, ...facts });

	for (const href of facts.links) {
		if (/^(mailto:|tel:|javascript:)/.test(href)) continue;
		const u = new URL(href, BASE + path);
		if (u.origin === BASE) {
			const p = u.pathname.replace(/\.html$/, '') || '/';
			if (!queue.has(p)) queue.add(p);
		} else if (!externals.has(u.href)) externals.set(u.href, path);
	}
}

// ── Per-page checks ────────────────────────────────────────────
const titles = new Map();
const descs = new Map();
for (const [path, d] of data) {
	const indexable = !(d.robots || '').includes('noindex') || (STAGING && !['/thanks', '/404'].includes(path));
	if (STAGING && indexable && !(d.robots || '').includes('noindex')) warn(path, 'staging copy is indexable (should be noindex)');
	if (path === '/404') {
		if (d.status !== 200 && d.status !== 404) warn(path, `status ${d.status}`);
	} else if (d.status !== 200) warn(path, `HTTP ${d.status}`);
	if (d.lang !== 'he' || d.dir !== 'rtl') warn(path, `lang/dir = ${d.lang}/${d.dir}`);
	if (!d.title) warn(path, 'missing <title>');
	else if (indexable && d.title.length > 65) warn(path, `title ${d.title.length} chars (>65): ${d.title}`);
	if (!d.desc) warn(path, 'missing meta description');
	else if (indexable && (d.desc.length < 70 || d.desc.length > 165)) warn(path, `description ${d.desc.length} chars`);
	if (indexable) {
		titles.set(d.title, [...(titles.get(d.title) || []), path]);
		descs.set(d.desc, [...(descs.get(d.desc) || []), path]);
		const expected = SITE + (path === '/' ? '/' : path);
		if (d.canonical !== expected) warn(path, `canonical ${d.canonical} ≠ ${expected}`);
		if (d.og.url !== d.canonical) warn(path, `og:url ${d.og.url} ≠ canonical`);
		if (!sitemapUrls.includes(path)) warn(path, 'indexable page missing from sitemap');
	} else if (sitemapUrls.includes(path)) warn(path, 'noindex page listed in sitemap');
	if (!d.og.title || !d.og.desc || !d.og.image) warn(path, 'incomplete Open Graph tags');
	if (d.og.image && !d.og.image.startsWith('https://')) warn(path, `og:image not absolute: ${d.og.image}`);
	if (d.twitter !== 'summary_large_image') warn(path, 'twitter:card missing');
	if (d.h1 !== 1) warn(path, `${d.h1} <h1> elements`);
	let prev = 0;
	for (const [lvl, text] of d.headings) {
		if (prev && lvl > prev + 1) warn(path, `heading jumps h${prev}→h${lvl} at "${text.slice(0, 40)}"`);
		prev = lvl;
	}
	if (d.dupIds.length) warn(path, `duplicate ids: ${[...new Set(d.dupIds)].join(', ')}`);
	if (d.imgNoAlt.length) warn(path, `images without alt: ${d.imgNoAlt.join(', ')}`);
	for (const ld of d.ld) {
		if (ld.__invalid) warn(path, `invalid JSON-LD: ${ld.__invalid}`);
		if (ld['@type'] === 'FAQPage') {
			const q = ld.mainEntity.map((e) => e.name);
			const missing = q.filter((x) => !d.faqVisible.includes(x));
			if (missing.length) warn(path, `FAQ schema questions not visible on page: ${missing.join(' | ')}`);
		}
	}
	// Internal links + anchors
	for (const href of d.links) {
		if (/^(mailto:|tel:|javascript:)/.test(href)) continue;
		const u = new URL(href, BASE + path);
		if (u.origin !== BASE) continue;
		const target = u.pathname.replace(/\.html$/, '') || '/';
		const t = data.get(target);
		if (!t) {
			warn(path, `link to uncrawled ${href}`);
			continue;
		}
		if (t.status !== 200 && target !== '/404') warn(path, `broken link ${href} (HTTP ${t.status})`);
		if (u.hash && u.hash !== '#') {
			const id = decodeURIComponent(u.hash.slice(1));
			if (!t.ids.includes(id)) warn(path, `broken anchor ${href} (no #${id} on ${target})`);
		}
	}
}
for (const [t, pages] of titles) if (pages.length > 1) warn(pages.join(', '), `duplicate title "${t}"`);
for (const [t, pages] of descs) if (pages.length > 1) warn(pages.join(', '), `duplicate description "${t.slice(0, 50)}…"`);

// ── robots.txt ────────────────────────────────────────────────
const robots = await (await fetch(`${BASE}/robots.txt`)).text();
if (!/Sitemap:\s*https:\/\/greenmount\.co\.il\/sitemap-index\.xml/.test(robots)) warn('/robots.txt', 'missing Sitemap line');
if (/Disallow:\s*\/\s*$/m.test(robots)) warn('/robots.txt', 'blocks the whole site');

// ── External links ────────────────────────────────────────────
const extResults = [];
for (const [url, from] of externals) {
	let status = 'ERR';
	try {
		const r = await fetch(url, {
			method: 'GET',
			redirect: 'follow',
			headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/126 Safari/537.36' },
			signal: AbortSignal.timeout(15000),
		});
		status = r.status;
	} catch (e) {
		status = `ERR ${e.cause?.code || e.name}`;
	}
	extResults.push([status, url.length > 90 ? url.slice(0, 90) + '…' : url, from]);
}

await browser.close();

console.log(`\nPages checked (${data.size}): ${[...data.keys()].join('  ')}`);
console.log(`Sitemap: ${sitemapUrls.join('  ')}`);
console.log(`Internal links checked: ${[...data.values()].reduce((n, d) => n + d.links.length, 0)}`);
console.log(`\nExternal links (${extResults.length}):`);
for (const [s, u, from] of extResults) console.log(`  ${String(s).padEnd(8)} ${u}   (from ${from})`);
console.log(problems.length ? `\n✗ ${problems.length} issue(s):\n  ${problems.join('\n  ')}` : '\n✓ no issues found');
process.exit(problems.length ? 1 : 0);
