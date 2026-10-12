/**
 * Accessibility widget logic (markup: src/components/A11yWidget.astro,
 * effects: `html.a11y-*` rules in src/styles/global.css).
 * The same storage key is read by the inline pre-paint script in Base.astro.
 */
export const A11Y_KEY = 'gm-a11y';
const SCALES = [1, 1.15, 1.3, 1.5];

type ToggleKey = 'readable' | 'lineHeight' | 'contrast' | 'grayscale' | 'underline' | 'bigCursor' | 'noMotion';
type State = { scale: number } & Record<ToggleKey, boolean>;

const DEFAULT: State = {
	scale: 1,
	readable: false,
	lineHeight: false,
	contrast: false,
	grayscale: false,
	underline: false,
	bigCursor: false,
	noMotion: false,
};

function load(): State {
	try {
		return { ...DEFAULT, ...JSON.parse(localStorage.getItem(A11Y_KEY) || '{}') };
	} catch {
		return { ...DEFAULT };
	}
}

function save(s: State) {
	try {
		localStorage.setItem(A11Y_KEY, JSON.stringify(s));
	} catch {
		/* storage unavailable – settings still apply for this page view */
	}
}

/** a11y-readable, a11y-lineheight, a11y-contrast, a11y-grayscale, a11y-underline, a11y-bigcursor, a11y-nomotion */
const cls = (k: ToggleKey) => `a11y-${k.toLowerCase()}`;

function apply(s: State) {
	const html = document.documentElement;
	// Root font-size (not CSS zoom): rem-based text/spacing grows, vw-based layout doesn't overflow on phones
	html.style.fontSize = s.scale === 1 ? '' : `${s.scale * 100}%`;
	html.classList.toggle('a11y-scaled', s.scale !== 1);
	(Object.keys(DEFAULT) as Array<keyof State>).forEach((k) => {
		if (k !== 'scale') html.classList.toggle(cls(k), s[k]);
	});
	// Stop animations also pauses the hero video
	document.querySelectorAll<HTMLVideoElement>('[data-hero-video]').forEach((v) => {
		if (s.noMotion) v.pause();
		else if (v.classList.contains('is-playing')) v.play().catch(() => {});
	});
}

/** True when the visitor asked to stop animations (OS setting or the widget). */
export function motionOff() {
	return (
		window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
		document.documentElement.classList.contains('a11y-nomotion')
	);
}

export function initA11y() {
	const root = document.querySelector<HTMLElement>('[data-a11y]');
	if (!root) return;
	const fab = root.querySelector<HTMLButtonElement>('[data-a11y-fab]')!;
	const panel = root.querySelector<HTMLElement>('[data-a11y-panel]')!;
	const sizeOut = root.querySelector<HTMLOutputElement>('[data-a11y-size]')!;
	const [down, up] = [...root.querySelectorAll<HTMLButtonElement>('[data-a11y-scale]')];
	let state = load();

	const render = () => {
		root.querySelectorAll<HTMLButtonElement>('[data-a11y-toggle]').forEach((b) => {
			b.setAttribute('aria-pressed', String(state[b.dataset.a11yToggle as ToggleKey]));
		});
		const i = Math.max(0, SCALES.indexOf(state.scale));
		sizeOut.textContent = `${Math.round(state.scale * 100)}%`;
		down.disabled = i === 0;
		up.disabled = i === SCALES.length - 1;
	};

	const update = (patch: Partial<State>) => {
		state = { ...state, ...patch };
		apply(state);
		save(state);
		render();
	};

	const open = () => {
		panel.hidden = false;
		fab.setAttribute('aria-expanded', 'true');
		panel.querySelector<HTMLElement>('[data-a11y-close]')?.focus();
	};
	const close = (returnFocus = true) => {
		if (panel.hidden) return;
		panel.hidden = true;
		fab.setAttribute('aria-expanded', 'false');
		if (returnFocus) fab.focus();
	};

	fab.addEventListener('click', () => (panel.hidden ? open() : close()));
	root.querySelector('[data-a11y-close]')!.addEventListener('click', () => close());
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && !panel.hidden) close();
	});
	document.addEventListener('pointerdown', (e) => {
		if (!panel.hidden && !root.contains(e.target as Node)) close(false);
	});

	root.querySelectorAll<HTMLButtonElement>('[data-a11y-toggle]').forEach((b) =>
		b.addEventListener('click', () => {
			const k = b.dataset.a11yToggle as ToggleKey;
			update({ [k]: !state[k] } as Partial<State>);
		}),
	);
	root.querySelectorAll<HTMLButtonElement>('[data-a11y-scale]').forEach((b) =>
		b.addEventListener('click', () => {
			const i = Math.max(0, SCALES.indexOf(state.scale)) + Number(b.dataset.a11yScale);
			update({ scale: SCALES[Math.min(SCALES.length - 1, Math.max(0, i))] });
		}),
	);
	root.querySelector('[data-a11y-reset]')!.addEventListener('click', () => update({ ...DEFAULT }));

	apply(state);
	render();
}
