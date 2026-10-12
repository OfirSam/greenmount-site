/**
 * Encodes the hero background video for the web.
 *   npm run video -- path/to/raw-clip.mov [--mobile path/to/vertical-clip.mov] [--poster]
 *
 * Writes to public/assets/video/:
 *   hero.mp4         1920px H.264, no audio, ~2.5 Mbps cap  (≈3–4 MB for 10–12 s)
 *   hero.webm        1920px VP9, no audio                  (usually smaller than the MP4)
 *   hero-mobile.mp4  720px  H.264, ~1.2 Mbps cap           (≈1.5 MB) – from --mobile clip if given
 * --poster also replaces assets/images/hero/hero-poster.jpg with a frame from the clip.
 *
 * Needs ffmpeg: uses a system ffmpeg if installed (brew install ffmpeg),
 * otherwise the optional npm package: npm i -D ffmpeg-static
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--mobile');
const mobileIdx = args.indexOf('--mobile');
const mobileInput = mobileIdx > -1 ? args[mobileIdx + 1] : input;
const withPoster = args.includes('--poster');

if (!input || !existsSync(input)) {
	console.error('Usage: npm run video -- path/to/clip.mov [--mobile vertical.mov] [--poster]');
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

const common = ['-an', '-pix_fmt', 'yuv420p'];
run('hero.mp4 (1080p H.264)', [
	'-i', input, '-vf', 'scale=1920:-2:flags=lanczos,fps=30', ...common,
	'-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '25',
	'-maxrate', '2500k', '-bufsize', '5000k', '-movflags', '+faststart', `${OUT}/hero.mp4`,
]);
run('hero.webm (1080p VP9)', [
	'-i', input, '-vf', 'scale=1920:-2:flags=lanczos,fps=30', ...common,
	'-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', `${OUT}/hero.webm`,
]);
run('hero-mobile.mp4 (720p H.264)', [
	'-i', mobileInput, '-vf', "scale='if(gt(iw,ih),-2,720)':'if(gt(iw,ih),720,-2)':flags=lanczos,fps=30", ...common,
	'-c:v', 'libx264', '-profile:v', 'main', '-preset', 'slow', '-crf', '27',
	'-maxrate', '1200k', '-bufsize', '2400k', '-movflags', '+faststart', `${OUT}/hero-mobile.mp4`,
]);
if (withPoster) {
	run('poster frame', ['-ss', '1', '-i', input, '-frames:v', '1', '-q:v', '2', 'assets/images/hero/hero-poster.jpg']);
}
console.log('✓ done – the hero <video> appears automatically on the next build/dev reload.');
