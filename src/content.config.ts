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

export const collections = { hero, stats };
