/**
 * Conversion tracking – one `track()` call fans out to every configured tool:
 *   GA4 (gtag) · Meta Pixel (fbq) · TikTok Pixel (ttq) · Google Sheets tracker
 *
 * Vendor scripts are injected only after the page has loaded and gone idle
 * (or on first interaction) so they never compete with the hero for bandwidth.
 * Events fired before that are queued by the stubs and sent once loaded.
 *
 * Markup hooks: any element with data-track="<type>" data-src="<where>" is tracked on click.
 */

type Params = Record<string, string | number | undefined>;
type Fn = (...args: unknown[]) => void;

interface Analytics {
	ga4: string;
	metaPixel: string;
	tiktokPixel: string;
	sheetsTrackerUrl: string;
}

declare global {
	interface Window {
		gtag?: Fn;
		dataLayer?: unknown[];
		fbq?: Fn & { queue?: unknown[]; callMethod?: Fn; loaded?: boolean; version?: string; push?: Fn };
		_fbq?: unknown;
		ttq?: unknown[] & Record<string, Fn>;
	}
}

let cfg: Analytics | null = null;

/** data-track type → [GA4 event, Meta standard event, TikTok event, Sheets label] */
const EVENT_MAP: Record<string, [string, string | null, string | null, string]> = {
	trial: ['cta_trial_click', null, 'ClickButton', 'אימון ניסיון'],
	whatsapp: ['whatsapp_click', 'Contact', 'Contact', 'וואטסאפ'],
	audience: ['audience_click', null, null, 'קהל יעד'],
	discipline: ['discipline_open', 'ViewContent', 'ViewContent', 'תחום לחימה'],
	faq: ['faq_open', null, null, 'שאלה נפוצה'],
	social: ['social_click', null, null, 'רשת חברתית'],
	lead: ['generate_lead', 'Lead', 'SubmitForm', 'טופס'],
};

/* ── Public API ──────────────────────────────────────────────────── */
export function track(type: string, params: Params = {}) {
	const [gaEvent, metaEvent, ttEvent, sheetsLabel] = EVENT_MAP[type] ?? [type, null, null, 'כפתור'];

	window.gtag?.('event', gaEvent, params);
	if (metaEvent) window.fbq?.('track', metaEvent, params);
	else window.fbq?.('trackCustom', gaEvent, params);
	if (ttEvent) window.ttq?.track?.(ttEvent, params);

	if (type === 'lead') {
		sendToSheets({ event: 'form_submit', form_id: String(params.form ?? 'trial') });
	} else if (type !== 'menu_open') {
		sendToSheets({
			event: 'button_click',
			button_type: sheetsLabel,
			button_label: String(params.source ?? params.label ?? ''),
		});
	}
}

export function initTracking(analytics: Analytics) {
	cfg = analytics;
	if (!cfg) return;

	installStubs();

	// Delegated click tracking for every [data-track] element
	document.addEventListener('click', (e) => {
		const el = (e.target as Element).closest<HTMLElement>('[data-track]');
		if (!el) return;
		track(el.dataset.track!, { source: el.dataset.src, context: el.dataset.context });
	});

	sendToSheets({ event: 'page_view', referrer: document.referrer, device: isMobile() ? 'מובייל' : 'דסקטופ' });

	// Load vendor scripts lazily
	let loaded = false;
	const load = () => {
		if (loaded) return;
		loaded = true;
		loadVendors();
	};
	const onLoad = () => {
		const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
		idle(load, { timeout: 3500 });
	};
	if (document.readyState === 'complete') onLoad();
	else window.addEventListener('load', onLoad, { once: true });
	['pointerdown', 'keydown', 'scroll'].forEach((evt) =>
		window.addEventListener(evt, load, { once: true, passive: true }),
	);
}

/* ── Internals ───────────────────────────────────────────────────── */
function installStubs() {
	if (!cfg) return;

	if (cfg.metaPixel && !window.fbq) {
		const fbq = function (...args: unknown[]) {
			fbq.callMethod ? fbq.callMethod(...args) : fbq.queue!.push(args);
		} as NonNullable<Window['fbq']>;
		fbq.push = fbq;
		fbq.loaded = true;
		fbq.version = '2.0';
		fbq.queue = [];
		window.fbq = window._fbq = fbq;
		fbq('init', cfg.metaPixel);
		fbq('track', 'PageView');
	}

	if (cfg.tiktokPixel && !window.ttq) {
		const ttq = [] as unknown as NonNullable<Window['ttq']>;
		const methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
		for (const m of methods) ttq[m] = (...args: unknown[]) => ttq.push([m, ...args]);
		window.ttq = ttq;
		ttq.page();
	}
}

function loadVendors() {
	if (!cfg) return;
	if (cfg.ga4) inject(`https://www.googletagmanager.com/gtag/js?id=${cfg.ga4}`);
	if (cfg.metaPixel) inject('https://connect.facebook.net/en_US/fbevents.js');
	if (cfg.tiktokPixel) {
		const ttq = window.ttq as unknown as Record<string, unknown>;
		ttq._i = { [cfg.tiktokPixel]: [] };
		ttq._t = { [cfg.tiktokPixel]: Date.now() };
		ttq._o = { [cfg.tiktokPixel]: {} };
		inject(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${cfg.tiktokPixel}&lib=ttq`);
	}
}

function inject(src: string) {
	const s = document.createElement('script');
	s.async = true;
	s.src = src;
	document.head.append(s);
}

function isMobile() {
	return /Mobi|Android/i.test(navigator.userAgent);
}

/** Same payload shape as the existing Apps Script tracker (keeps the Sheet working). */
function sendToSheets(payload: Params) {
	if (!cfg?.sheetsTrackerUrl) return;
	const p = new URLSearchParams(window.location.search);
	const body = JSON.stringify({
		...payload,
		timestamp: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
		utm_source: p.get('utm_source') || '',
		utm_medium: p.get('utm_medium') || '',
		utm_campaign: p.get('utm_campaign') || '',
	});
	const blob = new Blob([body], { type: 'text/plain' });
	if (!navigator.sendBeacon?.(cfg.sheetsTrackerUrl, blob)) {
		fetch(cfg.sheetsTrackerUrl, { method: 'POST', mode: 'no-cors', body: blob, keepalive: true }).catch(() => {});
	}
}
