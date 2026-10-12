import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

/**
 * Editable site content lives in src/data/*.yaml.
 * Each schema below validates its file at build time – a typo fails the
 * build with a clear message instead of silently breaking the live site.
 * `todo: true` marks placeholder content that must be replaced before launch.
 *
 * Helpers keep the YAML files simple for editors:
 *  - single(): the file is one object        → getEntry('<name>', 'main').data
 *  - list():   the file is a plain YAML list → getEntry('<name>', 'main').data.items (order preserved)
 */
const single = (path: string) => file(path, { parser: (text) => ({ main: parse(text) }) });
const list = (path: string) => file(path, { parser: (text) => ({ main: { items: parse(text) ?? [] } }) });

const hero = defineCollection({
	loader: single('src/data/hero.yaml'),
	schema: z.object({
		eyebrow: z.string(),
		titleLine1: z.string(),
		titlePrefix: z.string(),
		titleBrand: z.string(),
		tagline: z.array(z.string()),
		audiences: z.array(
			z.object({
				label: z.string(),
				age: z.string(),
				href: z.string(),
			}),
		),
		primaryCta: z.string(),
		secondaryCta: z.string(),
		hint: z.string(),
	}),
});

const stats = defineCollection({
	loader: list('src/data/stats.yaml'),
	schema: z.object({
		items: z.array(
			z.object({
				value: z.number(),
				prefix: z.string().optional(),
				suffix: z.string().optional(),
				label: z.string(),
				todo: z.boolean().default(false),
			}),
		),
	}),
});

const todo = z.boolean().default(false);
const cta = { primaryCta: z.string(), secondaryCta: z.string() };

const coach = defineCollection({
	loader: single('src/data/coach.yaml'),
	schema: z.object({
		eyebrow: z.string(),
		name: z.string(),
		nameLatin: z.string(),
		role: z.string(),
		lead: z.string(),
		bio: z.array(z.string()),
		highlights: z.array(z.object({ value: z.string(), label: z.string() })),
		credentialsTitle: z.string(),
		credentials: z.array(z.string()),
		philosophyTitle: z.string(),
		philosophy: z.string(),
		quote: z.string(),
		images: z.object({
			main: z.string(),
			mainAlt: z.string(),
			secondary: z.string().optional(),
			secondaryAlt: z.string().optional(),
		}),
	}),
});

const kids = defineCollection({
	loader: single('src/data/kids.yaml'),
	schema: z.object({
		eyebrow: z.string(),
		title: z.string(),
		paragraphs: z.array(z.string()),
		valuesTitle: z.string(),
		values: z.array(
			z.object({ label: z.string(), icon: z.enum(['discipline', 'respect', 'control', 'challenge', 'confidence']) }),
		),
		note: z.string(),
		parentsTitle: z.string(),
		parents: z.array(
			z.object({ title: z.string(), text: z.string(), icon: z.enum(['groups', 'start', 'trial', 'shield']), todo }),
		),
		images: z.array(z.object({ file: z.string(), alt: z.string() })),
		hint: z.string(),
		...cta,
	}),
});

const disciplineIds = ['muay-thai', 'mma', 'bjj', 'judo', 'fitness-women', 'fitness-men'] as const;

const disciplines = defineCollection({
	loader: list('src/data/disciplines.yaml'),
	schema: z.object({
		items: z.array(
			z.object({
				id: z.enum(disciplineIds),
				name: z.string(),
				latin: z.string(),
				image: z.string().default(''),
				imageAlt: z.string().default(''),
				short: z.string(),
				details: z.array(z.object({ label: z.string(), text: z.string(), todo })),
			}),
		),
	}),
});

const disciplinesSection = defineCollection({
	loader: single('src/data/disciplines-section.yaml'),
	schema: z.object({ eyebrow: z.string(), title: z.string(), intro: z.string(), moreLabel: z.string(), ...cta }),
});

const why = defineCollection({
	loader: list('src/data/why.yaml'),
	schema: z.object({ items: z.array(z.object({ title: z.string(), text: z.string() })) }),
});

const faq = defineCollection({
	loader: list('src/data/faq.yaml'),
	schema: z.object({ items: z.array(z.object({ q: z.string(), a: z.string() })) }),
});

const testimonials = defineCollection({
	loader: list('src/data/testimonials.yaml'),
	schema: z.object({
		items: z.array(
			z.object({ name: z.string(), role: z.string(), text: z.string(), photo: z.string().default(''), todo }),
		),
	}),
});

const time = z.string().regex(/^\d{2}:\d{2}$/, 'שעה בפורמט HH:MM, למשל "17:30"');

const schedule = defineCollection({
	loader: list('src/data/schedule.yaml'),
	schema: z.object({
		items: z.array(
			z.object({
				day: z.number().int().min(0).max(6),
				start: time,
				end: time,
				group: z.enum(['kids', 'youth', 'adults']),
				discipline: z.enum(['kids', ...disciplineIds]),
				title: z.string(),
				todo,
			}),
		),
	}),
});

const gallery = defineCollection({
	loader: list('src/data/gallery.yaml'),
	schema: z.object({ items: z.array(z.object({ file: z.string(), alt: z.string() })) }),
});

const trial = defineCollection({
	loader: single('src/data/trial.yaml'),
	schema: z.object({
		eyebrow: z.string(),
		title: z.string(),
		text: z.string(),
		formTitle: z.string(),
		submit: z.string(),
		success: z.object({ title: z.string(), text: z.string() }),
		waAlt: z.string(),
	}),
});

export const collections = {
	hero,
	stats,
	coach,
	kids,
	disciplines,
	disciplinesSection,
	why,
	faq,
	testimonials,
	schedule,
	gallery,
	trial,
};
