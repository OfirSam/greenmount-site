/**
 * Generates public/og-image.jpg (1200×630) – the image shown when the site is shared
 * on WhatsApp / Facebook / Instagram. Rendered in Chromium with the site's own fonts.
 *   npm run og            (uses assets/images/hero/hero-poster.jpg)
 *   npm run og -- path/to/photo.jpg
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const photo = resolve(process.argv[2] || 'assets/images/hero/hero-poster.jpg');
const f = (p) => pathToFileURL(resolve('node_modules', p)).href;
const logo = pathToFileURL(resolve('assets/images/brand/logo.png')).href;

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>
@font-face{font-family:K;src:url(${f('@fontsource/karantina/files/karantina-hebrew-700-normal.woff2')});font-weight:700}
@font-face{font-family:K;src:url(${f('@fontsource/karantina/files/karantina-latin-700-normal.woff2')});font-weight:700;unicode-range:U+0000-00FF}
@font-face{font-family:B;src:url(${f('@fontsource/barlow-condensed/files/barlow-condensed-latin-800-normal.woff2')});font-weight:800}
@font-face{font-family:A;src:url(${f('@fontsource-variable/assistant/files/assistant-hebrew-wght-normal.woff2')});font-weight:200 800}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#0b0f0c;color:#f3efe7;font-family:A,sans-serif}
.bg{position:absolute;inset:0;background:url(${pathToFileURL(photo).href}) 40% 40%/cover}
.bg::after{content:"";position:absolute;inset:0;background:linear-gradient(to left,rgba(11,15,12,.96) 0%,rgba(11,15,12,.85) 45%,rgba(11,15,12,.25) 80%),linear-gradient(to top,rgba(11,15,12,.9),transparent 50%)}
.c{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}
.logo{width:96px;height:96px;margin-bottom:28px}
.eyebrow{font-size:26px;font-weight:700;color:#00df52;display:flex;gap:14px;align-items:center}
.eyebrow::before{content:"";width:44px;height:3px;background:#00df52}
h1{font-family:K;font-weight:700;font-size:118px;line-height:.86;margin-top:22px}
.brand{font-family:B;font-weight:800;color:#00df52;font-size:122px;line-height:.9}
.chips{display:flex;gap:12px;margin-top:30px}
.chips span{padding:8px 20px;border:2px solid rgba(243,239,231,.3);border-radius:99px;font-size:26px;font-weight:700}
.ridge{position:absolute;left:0;right:0;bottom:0;height:46px}
</style></head><body><div class="bg"></div><div class="c">
<img class="logo" src="${logo}">
<p class="eyebrow">מועדון אומנויות לחימה וכושר · קיבוץ גונן</p>
<h1>ברוכים הבאים</h1><p class="brand">ל-<span>GREENMOUNT</span></p>
<div class="chips"><span>ילדים</span><span>נוער</span><span>בוגרים</span></div></div>
<svg class="ridge" viewBox="0 0 1200 46" preserveAspectRatio="none"><path d="M0 46V30l175-14 125 11 192-26 141 20 100-9 167 17 116-10 184 18v9Z" fill="#0b0f0c"/><path d="M0 30l175-14 125 11 192-26 141 20 100-9 167 17 116-10 184 18" fill="none" stroke="#00df52" stroke-width="2"/></svg>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
// Load from a file:// page so local fonts/images are allowed
const tmp = resolve(tmpdir(), `gm-og-${Date.now()}.html`);
writeFileSync(tmp, html);
await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 86 });
await browser.close();
rmSync(tmp);
console.log('✓ public/og-image.jpg (1200×630)');
