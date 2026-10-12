// Dev helper: report horizontal overflow + hero headline fit at several widths.
import { chromium } from 'playwright';
const url = process.argv[2] || 'http://localhost:4321/';
const browser = await chromium.launch();
for (const width of [320, 360, 390, 768, 1024, 1440, 1920]) {
	const page = await browser.newPage({ viewport: { width, height: 800 } });
	await page.goto(url, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	const r = await page.evaluate(() => {
		const vw = document.documentElement.clientWidth;
		const t = document.querySelector('.hero-title-2')?.getBoundingClientRect();
		return { vw, scrollW: document.documentElement.scrollWidth, title2: t ? [Math.round(t.left), Math.round(t.right)] : null };
	});
	console.log(width, JSON.stringify(r), r.scrollW > r.vw ? 'OVERFLOW' : 'ok');
	await page.close();
}
await browser.close();
