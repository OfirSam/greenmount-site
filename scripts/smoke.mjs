/**
 * Dev helper: clicks through every interactive widget on a running build.
 *   node scripts/smoke.mjs [url]
 */
import { chromium, devices } from 'playwright';

const url = process.argv[2] || 'http://localhost:4322/';
const browser = await chromium.launch();
const results = [];
const ok = (name, pass, extra = '') => results.push(`${pass ? '✓' : '✗'} ${name}${extra ? ` – ${extra}` : ''}`);

// ── Desktop ────────────────────────────────────────────
{
	const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	const errors = [];
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
	page.on('pageerror', (e) => errors.push(e.message));
	await page.goto(url, { waitUntil: 'networkidle' });

	// Discipline modal
	await page.locator('[data-modal-open="dlg-bjj"]').click();
	ok('modal opens', await page.locator('#dlg-bjj').evaluate((d) => d.open));
	await page.keyboard.press('Escape');
	ok('modal closes on Esc', !(await page.locator('#dlg-bjj').evaluate((d) => d.open)));
	await page.locator('[data-modal-open="dlg-judo"]').click();
	await page.locator('#dlg-judo [data-prefill-discipline]').click();
	await page.waitForTimeout(300);
	const sel = await page.locator('[data-discipline-select]').inputValue();
	ok('modal CTA prefills form discipline', sel === "ג'ודו", sel);

	// Lightbox
	await page.locator('[data-lightbox-index]').first().scrollIntoViewIfNeeded();
	await page.locator('[data-lightbox-index]').first().click();
	await page.waitForTimeout(200);
	await page.keyboard.press('ArrowLeft');
	const count = await page.locator('[data-lb-count]').textContent();
	ok('lightbox opens + arrow nav', count?.startsWith('2 /'), count);
	await page.keyboard.press('Escape');

	// Schedule: filter when a real timetable exists, otherwise the WhatsApp track cards
	if (await page.locator('[data-filter-group="kids"]').count()) {
		await page.locator('[data-filter-group="kids"]').click();
		const visible = await page.locator('.s-class:not([hidden])').count();
		const kids = await page.locator('.s-class[data-group="kids"]').count();
		ok('schedule filter (kids)', visible === kids && kids > 0, `${visible}/${kids}`);
		await page.locator('[data-filter-group="all"]').click();
	} else {
		const cards = await page.locator('.s-track a[href*="wa.me"]').count();
		ok('schedule fallback: WhatsApp per age track', cards === 3, `${cards} cards`);
	}

	// FAQ exclusive accordion
	const sums = page.locator('details[data-faq] summary');
	await sums.nth(0).click();
	await sums.nth(1).click();
	const open = await page.locator('details[data-faq][open]').count();
	ok('FAQ: one open at a time', open === 1, `${open} open`);

	// Form validation + submit (Netlify endpoint mocked)
	// Mock the Netlify endpoint so smoke runs never create real submissions
	await page.route(`${new URL(url).origin}/`, (route) => (route.request().method() === 'POST' ? route.fulfill({ status: 200, body: 'ok' }) : route.continue()));
	const form = page.locator('[data-trial-form]');
	await form.locator('button[type="submit"]').click();
	ok('form: empty submit shows errors', await page.locator('#f-name-err').isVisible());
	await page.fill('#f-name', 'בדיקה בדיקה');
	await page.fill('#f-phone', '052-123-4567');
	await page.locator('.seg-opt').nth(2).click();
	let posted = '';
	const origin = new URL(url).origin;
	page.on('request', (r) => r.method() === 'POST' && r.url() === `${origin}/` && (posted = r.postData() || ''));
	await form.locator('button[type="submit"]').click();
	await page.waitForTimeout(500);
	ok('form: success state', await page.locator('[data-form-success]').isVisible());
	ok('form: posts form-name + fields', posted.includes('form-name=trial') && posted.includes('phone='), decodeURIComponent(posted).slice(0, 90));

	ok('no console errors (desktop)', errors.length === 0, errors.join(' | '));
	await page.close();
}

// ── Mobile ─────────────────────────────────────────────
{
	const ctx = await browser.newContext({ ...devices['iPhone 13'] });
	const page = await ctx.newPage();
	await page.goto(url, { waitUntil: 'networkidle' });
	const bar = page.locator('[data-cta-bar]');
	ok('mobile bar hidden on hero', (await bar.getAttribute('data-visible')) === 'false');
	await page.evaluate(() => window.scrollTo(0, 1600));
	await page.waitForTimeout(500);
	ok('mobile bar visible after hero', (await bar.getAttribute('data-visible')) === 'true');
	await page.locator('#trial form').scrollIntoViewIfNeeded();
	await page.waitForTimeout(500);
	ok('mobile bar hidden at form', (await bar.getAttribute('data-visible')) === 'false');
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.locator('[data-menu-open]').click();
	ok('mobile menu opens', await page.locator('#mobile-menu').evaluate((d) => d.open));
	await page.locator('#mobile-menu [data-menu-link]').nth(2).click();
	await page.waitForTimeout(900);
	ok('menu link closes menu + scrolls', !(await page.locator('#mobile-menu').evaluate((d) => d.open)) && (await page.evaluate(() => scrollY)) > 500);
	await ctx.close();
}

await browser.close();
console.log(results.join('\n'));
process.exit(results.some((r) => r.startsWith('✗')) ? 1 : 0);
