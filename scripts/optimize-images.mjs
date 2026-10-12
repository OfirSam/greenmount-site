/**
 * Prepares photos dropped into assets/images/** for the build:
 *   - fixes rotation from phone EXIF, then strips ALL metadata (incl. GPS location)
 *   - caps the long edge at 2400px (the site never needs more)
 *   - converts HEIC/HEIF/PNG photos to high-quality JPG
 *   - re-encodes oversized JPG/WebP files
 * Astro then generates the responsive AVIF/WebP versions at build time.
 *
 *   npm run images            → process everything (safe to re-run; skips files already optimized)
 *   npm run images -- --dry   → only report
 */
import sharp from 'sharp';
import { readdir, stat, rename, unlink } from 'node:fs/promises';
import { join, extname, basename, dirname } from 'node:path';

const ROOT = 'assets/images';
const MAX = 2400;
const DRY = process.argv.includes('--dry');
const PHOTO_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.avif', '.tif', '.tiff']);
const KEEP_PNG = /(^|\/)brand\/logo/; // logos keep transparency

async function* walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const p = join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(p);
		else if (PHOTO_EXT.has(extname(entry.name).toLowerCase())) yield p;
	}
}

const kb = (n) => `${Math.round(n / 1024)}KB`;
let saved = 0;
let touched = 0;

for await (const file of walk(ROOT)) {
	const ext = extname(file).toLowerCase();
	const before = (await stat(file)).size;
	let meta;
	try {
		meta = await sharp(file).metadata();
	} catch (err) {
		console.warn(`✗ ${file} – cannot read (${err.message}). HEIC needs a sharp build with HEIF support – export as JPG instead.`);
		continue;
	}
	const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
	const hasMeta = Boolean(meta.exif || meta.xmp || meta.iptc); // privacy-relevant (camera, GPS)
	const isPng = ext === '.png';
	const convert = ['.heic', '.heif', '.tif', '.tiff'].includes(ext) || (isPng && !KEEP_PNG.test(file) && !meta.hasAlpha);
	const needs = longEdge > MAX || hasMeta || convert || (meta.orientation && meta.orientation !== 1);
	if (!needs) continue;

	const outExt = convert ? '.jpg' : ext === '.jpeg' ? '.jpg' : ext;
	const out = join(dirname(file), basename(file, extname(file)) + outExt);
	const tmp = out + '.tmp';
	if (DRY) {
		console.log(`• ${file}  ${longEdge}px${hasMeta ? ' +metadata' : ''}${convert ? ` → ${outExt}` : ''}`);
		continue;
	}

	let img = sharp(file).rotate().resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true });
	if (outExt === '.jpg') img = img.jpeg({ quality: 86, mozjpeg: true });
	else if (outExt === '.webp') img = img.webp({ quality: 86 });
	else if (outExt === '.png') img = img.png({ compressionLevel: 9 });
	else if (outExt === '.avif') img = img.avif({ quality: 60 });
	await img.toFile(tmp);
	if (out !== file) await unlink(file);
	await rename(tmp, out);

	const after = (await stat(out)).size;
	saved += before - after;
	touched++;
	console.log(`✓ ${out}  ${kb(before)} → ${kb(after)}`);
}
console.log(DRY ? 'dry run – nothing written' : `done: ${touched} file(s), saved ${kb(saved)}`);
