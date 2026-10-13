/**
 * Encodes the hero background video for the web (silent, looping, small).
 *   npm run video -- path/to/clip.mp4 [--start 5.2] [--end 17.6] [--desktop] [--poster]
 *
 * --start / --end   seconds to keep (cut out titles, watermarks, end slates)
 * --desktop         also write desktop files (hero.mp4 / hero.webm). Currently the site plays the
 *                   video on phones only and keeps the photo on desktop (src/scripts/main.ts).
 *
 * Writes to public/assets/video/:
 *   hero-mobile.mp4  phone H.264 (landscape 720p / portrait 540w)
 *   hero.mp4, hero.webm  (only with --desktop)
 * --poster also replaces assets/images/hero/hero-poster.jpg with a frame from the clip.
 *
 * ffmpeg: a system ffmpeg if installed (brew install ffmpeg), else the ffmpeg-static dev dependency.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (name) => {
	const i = args.indexOf(name);
	return i > -1 ? args[i + 1] : undefined;
};
const valued = new Set(['--start', '--end', '--mobile']);
const input = args.find((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]));
const mobileInput = flag('--mobile') ?? input;
const start = flag('--start');
const end = flag('--end');
const withPoster = args.includes('--poster');

if (!input || !existsSync(input)) {
	console.error('Usage: npm run video -- path/to/clip.mp4 [--start 5] [--end 17.5] [--mobile vertical.mp4] [--poster]');
	process.exit(1);
}

async function findFfmpeg() {
	if (spawnSync('ffmpeg', ['-version']).status === 0) return 'ffmpeg';
	try {
		return (await import('ffmpeg-static')).default;
	} catch {
		console.error('ffmpeg not found. Install one of:\n  brew install ffmpeg\n  npm i -D ffmpeg-static');
		process.exit(1);
	}
}
const ffmpeg = await findFfmpeg();
const OUT = 'public/assets/video';
mkdirSync(OUT, { recursive: true });

const trim = [...(start ? ['-ss', start] : []), ...(end ? ['-to', end] : [])];

function run(label, argv) {
	process.stdout.write(`• ${label} … `);
	const r = spawnSync(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', ...argv], { stdio: ['ignore', 'inherit', 'inherit'] });
	if (r.status !== 0) {
		console.error('failed');
		process.exit(1);
	}
	const file = argv.at(-1);
	console.log(`${(statSync(file).size / 1024 / 1024).toFixed(2)} MB`);
}

// Fit inside a box, never upscale. Landscape: 1920 wide · Portrait: 720 wide
const desktopScale = "scale='if(gt(iw,ih),min(1920,iw),min(720,iw))':-2:flags=lanczos,fps=30";
// Landscape: 720p · Portrait: 540 wide
const mobileScale = "scale='if(gt(iw,ih),-2,min(540,iw))':'if(gt(iw,ih),min(720,ih),-2)':flags=lanczos,fps=30";
const common = ['-an', '-pix_fmt', 'yuv420p', '-sn', '-dn', '-map_metadata', '-1'];

if (args.includes('--desktop')) {
run('hero.mp4 (desktop, H.264)', [
	...trim, '-i', input, '-vf', desktopScale, ...common,
	'-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '26',
	'-maxrate', '2200k', '-bufsize', '4400k', '-movflags', '+faststart', `${OUT}/hero.mp4`,
]);
run('hero.webm (desktop, VP9)', [
	...trim, '-i', input, '-vf', desktopScale, ...common,
	'-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', `${OUT}/hero.webm`,
]);
}
run('hero-mobile.mp4 (phone, H.264)', [
	...(mobileInput === input ? trim : []), '-i', mobileInput, '-vf', mobileScale, ...common,
	'-c:v', 'libx264', '-profile:v', 'main', '-preset', 'slow', '-crf', '28',
	'-maxrate', '1100k', '-bufsize', '2200k', '-movflags', '+faststart', `${OUT}/hero-mobile.mp4`,
]);
if (withPoster) {
	run('poster frame', [...(start ? ['-ss', start] : []), '-i', input, '-frames:v', '1', '-q:v', '2', 'assets/images/hero/hero-poster.jpg']);
}
console.log('✓ done – the hero video appears automatically on the next build/dev reload.');
