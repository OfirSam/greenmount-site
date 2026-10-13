/**
 * "מי מתאמן?" picker (hero chips with [data-audience]).
 * Choosing an audience:
 *  - marks the chip (aria-current)
 *  - pre-selects the age group in the trial form
 *  - switches every [data-wa-dynamic] WhatsApp link to the audience's prefilled message
 * The choice is remembered for the visit (sessionStorage).
 */
type Audience = 'kids' | 'youth' | 'adults';
export interface WaConfig {
	number: string;
	messages: Partial<Record<Audience, string>>;
}

const KEY = 'gm-audience';
const isAudience = (v: unknown): v is Audience => v === 'kids' || v === 'youth' || v === 'adults';

export function initAudience(wa: WaConfig | undefined) {
	if (!wa) return;
	const chips = [...document.querySelectorAll<HTMLAnchorElement>('[data-audience]')];

	const apply = (a: Audience) => {
		chips.forEach((c) => c.setAttribute('aria-current', String(c.dataset.audience === a)));

		const radio = document.querySelector<HTMLInputElement>(`input[name="group"][data-group-key="${a}"]`);
		if (radio && !radio.checked) {
			radio.checked = true;
			radio.dispatchEvent(new Event('change', { bubbles: true }));
		}

		const text = wa.messages[a];
		if (text) {
			const href = `https://wa.me/${wa.number}?text=${encodeURIComponent(text)}`;
			document.querySelectorAll<HTMLAnchorElement>('a[data-wa-dynamic]').forEach((link) => {
				link.href = href;
				link.dataset.context = a;
			});
		}
		try {
			sessionStorage.setItem(KEY, a);
		} catch {
			/* storage unavailable */
		}
	};

	chips.forEach((chip) =>
		chip.addEventListener('click', () => {
			if (isAudience(chip.dataset.audience)) apply(chip.dataset.audience);
		}),
	);

	let saved: string | null = null;
	try {
		saved = sessionStorage.getItem(KEY);
	} catch {
		/* storage unavailable */
	}
	if (isAudience(saved)) apply(saved);
}
