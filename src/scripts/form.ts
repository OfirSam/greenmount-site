/**
 * Trial form → Netlify Forms via fetch (inline success state).
 * Validation messages are Hebrew and announced via aria-invalid + aria-describedby.
 */
import { track } from './track';

const PHONE_RE = /^(\+972|972|0)([23489]\d{7}|5\d{8}|7\d{8})$/;

export function initTrialForm() {
	const form = document.querySelector<HTMLFormElement>('[data-trial-form]');
	if (!form) return;
	const success = document.querySelector<HTMLElement>('[data-form-success]');
	const error = form.querySelector<HTMLElement>('[data-form-error]');
	const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;

	const name = form.elements.namedItem('name') as HTMLInputElement;
	const phone = form.elements.namedItem('phone') as HTMLInputElement;
	const groupErr = document.getElementById('f-group-err');

	const setError = (input: HTMLElement | null, errEl: HTMLElement | null, invalid: boolean) => {
		input?.setAttribute('aria-invalid', String(invalid));
		if (errEl) errEl.hidden = !invalid;
	};

	const validate = () => {
		const nameOk = name.value.trim().length >= 2;
		const phoneOk = PHONE_RE.test(phone.value.replace(/[\s\-().]/g, ''));
		const groupOk = !!form.querySelector('input[name="group"]:checked');
		setError(name, document.getElementById('f-name-err'), !nameOk);
		setError(phone, document.getElementById('f-phone-err'), !phoneOk);
		if (groupErr) groupErr.hidden = groupOk;
		const firstInvalid = !nameOk ? name : !phoneOk ? phone : !groupOk ? form.querySelector<HTMLInputElement>('input[name="group"]') : null;
		firstInvalid?.focus();
		return nameOk && phoneOk && groupOk;
	};

	// Clear an error as soon as the field is fixed
	[name, phone].forEach((input) =>
		input.addEventListener('input', () => {
			if (input.getAttribute('aria-invalid') === 'true') validate();
		}),
	);
	form.querySelectorAll('input[name="group"]').forEach((r) => r.addEventListener('change', () => groupErr && (groupErr.hidden = true)));

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		if (error) error.hidden = true;
		if (!validate()) return;

		submit.setAttribute('aria-busy', 'true');
		try {
			const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
			const res = await fetch('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body,
			});
			if (!res.ok) throw new Error(String(res.status));

			const data = new FormData(form);
			track('lead', { form: 'trial', group: String(data.get('group')), discipline: String(data.get('discipline')) });
			form.hidden = true;
			if (success) {
				success.hidden = false;
				success.focus();
			}
		} catch {
			if (error) error.hidden = false;
		} finally {
			submit.removeAttribute('aria-busy');
		}
	});
}
