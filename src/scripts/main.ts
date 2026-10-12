/**
 * GREENMOUNT – client script (~3KB gzipped, no dependencies)
 *  - header state + mobile menu
 *  - scroll reveals + counters
 *  - hero video (lazy, network/motion aware)
 *  - sticky CTAs
 *  - modals, lightbox, schedule filter, FAQ, trial form, Instagram feed
 *  - analytics: GA4 / Meta Pixel / TikTok Pixel / Google Sheets tracker
 */
import { initTracking, track } from './track';
import { initFaq, initLightbox, initModals, initSchedule } from './ui';
import { initTrialForm } from './form';
import { initInstagram } from './instagram';

interface ClientConfig {
	analytics: {
		ga4: string;
		metaPixel: string;
		tiktokPixel: string;
		sheetsTrackerUrl: string;
	};
	heroVideo: { mp4: string; webm: string; mp4Mobile: string };
}

const config: ClientConfig = JSON.parse(document.getElementById('gm-config')?.textContent || '{}');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Header: transparent over hero → solid on scroll ─────────────── */
function initHeader() {
	const header = document.querySelector<HTMLElement>('[data-header]');
	if (!header) return;
	let ticking = false;
	const update = () => {
		header.dataset.state = window.scrollY > 24 ? 'scrolled' : 'top';
		ticking = false;
	};
	window.addEventListener(
		'scroll',
		() => {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(update);
			}
		},
		{ passive: true },
	);
	update();
}

/* ── Mobile menu (<dialog>) ──────────────────────────────────────── */
function initMenu() {
	const dialog = document.getElementById('mobile-menu') as HTMLDialogElement | null;
	const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
	if (!dialog || !openBtn) return;

	const close = () => dialog.close();
	openBtn.addEventListener('click', () => {
		dialog.showModal();
		openBtn.setAttribute('aria-expanded', 'true');
		track('menu_open', { source: 'header' });
	});
	dialog.addEventListener('close', () => openBtn.setAttribute('aria-expanded', 'false'));
	dialog.querySelector('[data-menu-close]')?.addEventListener('click', close);
	// Close before following an in-page anchor so the page can scroll
	dialog.querySelectorAll('[data-menu-link]').forEach((link) => link.addEventListener('click', close));
	// Click on backdrop area closes
	dialog.addEventListener('click', (e) => {
		if (e.target === dialog) close();
	});
	// Close if resized up to desktop
	window.matchMedia('(min-width: 72rem)').addEventListener('change', (e) => {
		if (e.matches && dialog.open) close();
	});
}

/* ── Scroll reveal ───────────────────────────────────────────────── */
function initReveal() {
	const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
	if (reducedMotion || !('IntersectionObserver' in window)) {
		els.forEach((el) => el.classList.add('is-in'));
		return;
	}
	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-in');
					io.unobserve(entry.target);
				}
			}
		},
		{ rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
	);
	els.forEach((el) => io.observe(el));
}

/* ── Counters ────────────────────────────────────────────────────── */
function initCounters() {
	const els = document.querySelectorAll<HTMLElement>('[data-count]');
	if (reducedMotion || !els.length) return;

	const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
	const run = (el: HTMLElement) => {
		const target = Number(el.dataset.count);
		const duration = 1600;
		const start = performance.now();
		const frame = (now: number) => {
			const p = Math.min((now - start) / duration, 1);
			el.textContent = String(Math.round(target * easeOutExpo(p)));
			if (p < 1) requestAnimationFrame(frame);
		};
		requestAnimationFrame(frame);
	};

	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					run(entry.target as HTMLElement);
					io.unobserve(entry.target);
				}
			}
		},
		{ threshold: 0.6 },
	);
	els.forEach((el) => {
		el.textContent = '0';
		io.observe(el);
	});
}

/* ── Hero video: only on capable connections, after page load ───── */
function initHeroVideo() {
	const video = document.querySelector<HTMLVideoElement>('[data-hero-video]');
	if (!video) return;

	type NetworkInfo = { saveData?: boolean; effectiveType?: string };
	const conn = (navigator as Navigator & { connection?: NetworkInfo }).connection;
	const slow = conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType || '');
	if (reducedMotion || slow) {
		video.remove(); // poster only
		return;
	}

	const isMobile = window.matchMedia('(max-width: 47.99rem)').matches;
	const { mp4, webm, mp4Mobile } = video.dataset;
	const sources: Array<[string, string]> = [];
	if (isMobile && mp4Mobile) sources.push([mp4Mobile, 'video/mp4']);
	else {
		if (webm) sources.push([webm, 'video/webm']);
		if (mp4) sources.push([mp4, 'video/mp4']);
	}
	if (!sources.length) return;

	for (const [src, type] of sources) {
		const s = document.createElement('source');
		s.src = src;
		s.type = type;
		video.append(s);
	}
	video.addEventListener(
		'playing',
		() => video.classList.add('is-playing'),
		{ once: true },
	);
	video.load();
	video.play().catch(() => {
		/* autoplay blocked → poster stays */
	});

	// Pause when the hero is off-screen (battery / CPU)
	new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting) video.play().catch(() => {});
		else video.pause();
	}).observe(video);
}

/* ── Sticky CTAs: appear once the hero CTAs leave the viewport ──── */
function initStickyCtas() {
	const heroCtas = document.querySelector('[data-hero-ctas]');
	const bar = document.querySelector<HTMLElement>('[data-cta-bar]');
	const float = document.querySelector<HTMLElement>('[data-cta-float]');
	const form = document.getElementById('trial');
	if (!heroCtas) {
		bar?.setAttribute('data-visible', 'true');
		float?.setAttribute('data-visible', 'true');
		return;
	}

	let pastHero = false;
	let formVisible = false;
	const apply = () => {
		const show = String(pastHero && !formVisible);
		bar?.setAttribute('data-visible', show);
		float?.setAttribute('data-visible', show);
	};

	new IntersectionObserver(([entry]) => {
		pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
		apply();
	}).observe(heroCtas);

	if (form) {
		new IntersectionObserver(([entry]) => {
			formVisible = entry.isIntersecting;
			apply();
		}).observe(form);
	}
}

/* ── Boot ────────────────────────────────────────────────────────── */
initHeader();
initMenu();
initReveal();
initCounters();
initStickyCtas();
initModals();
initLightbox();
initSchedule();
initFaq();
initTrialForm();
initInstagram();
initTracking(config.analytics);

// Footer year stays current even if the site isn't rebuilt
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = String(new Date().getFullYear())));

if (document.readyState === 'complete') initHeroVideo();
else window.addEventListener('load', initHeroVideo, { once: true });
