/**
 * Dev helper: desktop + mobile screenshots of a running site.
 *   node scripts/shots.mjs [url] [outDir]
 * Uses Playwright (installed one level up in ~/Desktop/Develope).
 */
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] || 'http://localhost:4321/';
const out = process.argv[3] || 'screenshots';
mkdirSync(out, { recursive: true });

const targets = [
	{ name: 'desktop', options: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
	{ name: 'mobile', options: { ...devices['iPhone 13'] } },
];

const browser = await chromium.launch();
for (const { name, options } of targets) {
	const ctx = await browser.newContext({ ...options, locale: 'he-IL' });
	const page = await ctx.newPage();
	await page.goto(url, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(1800);
	await page.screenshot({ path: `${out}/${name}-fold.png` });

	// Scroll through the page so reveal/counter animations fire, then capture the full page
	await page.evaluate(async () => {
		for (let y = 0; y < document.body.scrollHeight; y += 400) {
			window.scrollTo(0, y);
			await new Promise((r) => setTimeout(r, 120));
		}
	});
	await page.waitForTimeout(1800);
	await page.screenshot({ path: `${out}/${name}-scrolled.png` });
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.waitForTimeout(600);
	await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });

	// Mobile menu (only visible below the desktop-nav breakpoint)
	const menuBtn = page.locator('[data-menu-open]');
	if (await menuBtn.isVisible()) {
		await menuBtn.click();
		await page.waitForTimeout(900);
		await page.screenshot({ path: `${out}/${name}-menu.png` });
	}
	await ctx.close();
}
await browser.close();
console.log(`saved to ${out}/`);
