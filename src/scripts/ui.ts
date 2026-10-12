/**
 * Interactive widgets: discipline modals, gallery lightbox, schedule filter, FAQ tracking.
 * Each init is a no-op when its markup isn't on the page.
 */
import { track } from './track';

/* ── Discipline modals (<dialog>) ─────────────────────────────────
 * Buttons carry `command="show-modal" commandfor="…"` (Invoker Commands);
 * this fallback opens them in browsers without that API. */
export function initModals() {
	const supportsCommands = 'command' in HTMLButtonElement.prototype;
	document.querySelectorAll<HTMLButtonElement>('[data-modal-open]').forEach((btn) => {
		const dialog = document.getElementById(btn.dataset.modalOpen!) as HTMLDialogElement | null;
		if (!dialog) return;
		if (!supportsCommands) btn.addEventListener('click', () => dialog.showModal());
	});

	document.querySelectorAll<HTMLDialogElement>('dialog.modal').forEach((dialog) => {
		// Close on backdrop click
		dialog.addEventListener('click', (e) => {
			if (e.target === dialog) dialog.close();
		});
		dialog.querySelectorAll<HTMLElement>('[data-modal-close]').forEach((el) =>
			el.addEventListener('click', () => {
				const discipline = el.dataset.prefillDiscipline;
				if (discipline) prefillDiscipline(discipline);
				dialog.close();
			}),
		);
	});
}

/** Pre-select the discipline in the trial form (from a discipline modal CTA). */
function prefillDiscipline(key: string) {
	const select = document.querySelector<HTMLSelectElement>('[data-discipline-select]');
	const option = select?.querySelector<HTMLOptionElement>(`option[data-key="${key}"]`);
	if (select && option) select.value = option.value;
}

/* ── Gallery lightbox ─────────────────────────────────────────── */
export function initLightbox() {
	const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
	const triggers = [...document.querySelectorAll<HTMLButtonElement>('[data-lightbox-index]')];
	if (!dialog || !triggers.length) return;

	const img = dialog.querySelector<HTMLImageElement>('[data-lb-img]')!;
	const caption = dialog.querySelector<HTMLElement>('[data-lb-caption]')!;
	const count = dialog.querySelector<HTMLElement>('[data-lb-count]')!;
	let index = 0;
	let opener: HTMLElement | null = null;

	const show = (i: number) => {
		index = (i + triggers.length) % triggers.length;
		const t = triggers[index];
		img.src = t.dataset.full!;
		img.alt = t.dataset.alt || '';
		caption.textContent = t.dataset.alt || '';
		count.textContent = `${index + 1} / ${triggers.length}`;
		// Preload neighbours
		[index + 1, index - 1].forEach((n) => {
			const next = triggers[(n + triggers.length) % triggers.length];
			new Image().src = next.dataset.full!;
		});
	};

	triggers.forEach((t, i) =>
		t.addEventListener('click', () => {
			opener = t;
			show(i);
			dialog.showModal();
			track('gallery_open', { source: t.dataset.alt });
		}),
	);
	dialog.querySelector('[data-lb-close]')!.addEventListener('click', () => dialog.close());
	dialog.querySelector('[data-lb-next]')!.addEventListener('click', () => show(index + 1));
	dialog.querySelector('[data-lb-prev]')!.addEventListener('click', () => show(index - 1));
	dialog.addEventListener('click', (e) => {
		if (e.target === dialog || (e.target as HTMLElement).classList.contains('lb-stage')) dialog.close();
	});
	dialog.addEventListener('close', () => opener?.focus());

	// Keyboard: RTL → ArrowLeft = next, ArrowRight = previous
	dialog.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowLeft') show(index + 1);
		else if (e.key === 'ArrowRight') show(index - 1);
	});

	// Swipe
	let startX = 0;
	img.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
	img.addEventListener(
		'touchend',
		(e) => {
			const dx = e.changedTouches[0].clientX - startX;
			if (Math.abs(dx) > 40) show(dx > 0 ? index + 1 : index - 1);
		},
		{ passive: true },
	);
}

/* ── Schedule filter ──────────────────────────────────────────── */
export function initSchedule() {
	const root = document.querySelector<HTMLElement>('[data-schedule]');
	const filters = document.querySelector<HTMLElement>('[data-schedule-filters]');
	if (!root || !filters) return;
	filters.hidden = false;

	const chips = [...filters.querySelectorAll<HTMLButtonElement>('[data-filter-group]')];
	const select = filters.querySelector<HTMLSelectElement>('[data-filter-discipline]')!;
	let group = 'all';

	const apply = () => {
		const discipline = select.value;
		root.querySelectorAll<HTMLElement>('[data-day]').forEach((day) => {
			let visible = 0;
			day.querySelectorAll<HTMLElement>('.s-class').forEach((c) => {
				const show =
					(group === 'all' || c.dataset.group === group) &&
					(discipline === 'all' || c.dataset.discipline === discipline);
				c.hidden = !show;
				if (show) visible++;
			});
			day.querySelector<HTMLElement>('.s-empty')!.hidden = visible > 0;
		});
	};

	chips.forEach((chip) =>
		chip.addEventListener('click', () => {
			group = chip.dataset.filterGroup!;
			chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
			apply();
			track('schedule_filter', { source: `group:${group}` });
		}),
	);
	select.addEventListener('change', () => {
		apply();
		track('schedule_filter', { source: `discipline:${select.value}` });
	});
}

/* ── FAQ open tracking ────────────────────────────────────────── */
export function initFaq() {
	document.querySelectorAll<HTMLDetailsElement>('details[data-faq]').forEach((d) =>
		d.addEventListener('toggle', () => {
			if (d.open) track('faq', { source: d.querySelector('summary')?.textContent?.trim() });
		}),
	);
}
