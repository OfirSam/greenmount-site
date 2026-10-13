# GREENMOUNT website – instructions for Claude

Website of GREENMOUNT, a martial-arts & fitness club in Kibbutz Gonen (Upper Galilee, Israel). Live domain: **https://greenmount.co.il**.
The owner is **not a developer** – explain everything in simple Hebrew, one step at a time, and ask before anything irreversible (deploying to production, deleting files, changing DNS/domain, Netlify or GitHub settings).

## Stack
- Astro 7 (static output) + Tailwind CSS 4, Hebrew RTL. Hosted on Netlify (`netlify.toml`), source on GitHub.
- Node ≥ 22.12. `npm install` once, then `npm run dev` → http://localhost:4321.

## Where things live (edit content here, not in components)
| What | File |
|---|---|
| WhatsApp number + prefilled messages, address/hours/geo, socials, analytics IDs, Instagram feed URL, nav | `src/config/site.ts` |
| Page copy | `src/data/*.yaml` (hero, stats, steps, kids, disciplines, why, faq, testimonials, schedule, gallery, trial, landing, coach) |
| Program landing pages (/mma, /kickboxing, /bjj, /judo, /kids, /functional-training) | `src/data/landing.yaml` – **never change a `slug` after launch** (it's the Google URL) |
| Photos | `assets/images/<folder>/` – then `npm run images` (fixes rotation, strips GPS/EXIF, resizes) |
| Hero video (phones only) | `npm run video -- <file> --start <s> --end <s>` → `public/assets/video/hero-mobile.mp4` |
| Legal pages | `src/pages/privacy.astro`, `src/pages/accessibility.astro` |
| Open items / decisions | `TODO.md` · full Hebrew guide: `README.md` |

YAML tips: keep indentation (spaces only); wrap text containing `: ` in double quotes. `npm run build` validates every data file and fails with a clear message on mistakes.

## Content rules (important)
- **Never invent** testimonials, reviews, prices, class times, credentials, fight records or statistics. Use only what the owner gives you.
- Entries with `todo: true` (testimonials, schedule rows, stats) are **hidden** on the site. When the owner provides the real content, fill it in and set `todo: false` (or delete the line). The schedule section + its nav link appear automatically once `schedule.yaml` has real rows; testimonials appear once one real entry exists.
- Keep the existing Hebrew copy unless the owner asks to change it. Coach texts are in first person past tense (gender-neutral in Hebrew) – keep that unless told otherwise.
- Photos of children require parental consent – ask before adding new ones.

## Commands
| Command | What it does |
|---|---|
| `npm run dev` | local preview with live reload |
| `npm run build` | production build to `dist/` (validates data) |
| `npm run check` | type/template check |
| `npm run audit -- <url>` | end-to-end SEO + link check of every page (e.g. `npm run audit -- http://localhost:4321`) |
| `node scripts/smoke.mjs <url>` | clicks through every interactive part (form, menu, gallery, a11y menu…) |
| `npm run shots -- <url> <dir>` | desktop + mobile screenshots |
| `npm run og` | regenerate the 1200×630 share image |
| `npm run deploy:preview` / `npm run deploy` | manual Netlify deploy (draft / production) |
| `npm run rollback` | restore the previous production deploy |

Playwright-based scripts need a browser once: `npx playwright install chromium`.

## Workflow for every change
1. Edit → `npm run dev` → show the owner (screenshots via `npm run shots` or the browser).
2. `npm run check && npm run build` must pass. For bigger changes also run `npm run audit` and `node scripts/smoke.mjs` against `npm run preview` (http://localhost:4321).
3. Commit with a clear message, `git push` → Netlify deploys automatically. Confirm with the owner before pushing to `main` (= live site).
4. If something breaks: Netlify → Deploys → previous deploy → "Publish deploy", or `npm run rollback`.

## Technical notes
- Analytics (GA4, Google Sheets tracker, optional Meta/TikTok pixels) fire **only** on hosts listed in `site.analytics.hosts` (greenmount.co.il) – never on localhost or `*.netlify.app`.
- `*.netlify.app` copies are automatically `noindex` (inline script in `src/layouts/Base.astro`).
- The trial form uses Netlify Forms (`data-netlify`); Form detection must be enabled on the Netlify site.
- Body-font fallback (`Assistant Fallback` in `src/styles/global.css`) is calibrated for Hebrew to avoid layout shift – don't replace with Astro's automatic fallback.
- Fonts are self-hosted from `node_modules` (`astro.config.mjs` → `fonts`). Accessibility widget: `src/components/A11yWidget.astro` + `src/scripts/a11y.ts`.
