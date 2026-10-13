# GREENMOUNT – open items (internal – not shown on the site)

> **2026-10-13 UX redesign live.** Rollback: Netlify → Deploys → `6accccaca93c8125e67d47b3` → Publish deploy, or `npm run rollback`. Code: tag `pre-ux-v2`, merge `960d1e9`.
> Flow now: hero (offer + "מי מתאמן?") → stats → kids (light) → programs (tiles → pages) → 3 steps → coach → why (original photo layout, restored on request) → gallery → FAQ → form. Schedule section + nav link reappear automatically once `schedule.yaml` has real rows.
> Hero video: phones only (seconds 5.2–17.6 of the InShot clip – the original has template text "A VIDEO BY YOURNAME" at 2–4.5s and an InShot watermark at 18–19s; a clean export would allow a longer loop).

Status 12.10.2026: full site live on staging **https://greenmount-mma-v2.netlify.app** (Netlify team "ofirsam").
Nothing on the site shows "TODO" anymore. Missing content is either **written by Claude (needs your review)** or **hidden until real content exists**.
How to edit each file: [README.md](README.md) §2.

---

## A. Written by Claude – please verify (live on staging)

| Where | What I wrote | Check |
|---|---|---|
| `src/data/coach.yaml` → `name` | **נטע גרינברג** (from logo "Neta Greenberg" / TikTok @neta_grinberg) | Hebrew spelling |
| `coach.yaml` → `lead`, `bio`, `philosophy` | First-person bio (past tense = gender-neutral Hebrew): founded GREENMOUNT, values, "במזרנים ובמחנות אימון" | Facts true? Want specifics (years, belts, titles)? |
| `coach.yaml` → `quote` | "כל דרך מתחילה בצעד הראשון." (site tagline) | OK? |
| Coach photos | The two Thailand Instagram photos (cropped) | Is this the coach? Originals? |
| `src/data/disciplines.yaml` | "למי זה מתאים" + "איך נראה אימון" for all 6 programs (generic descriptions) | Accurate for how classes actually run? Muay Thai text mentions optional controlled sparring with protective gear |
| `src/data/kids.yaml` → safety card | "קרבות אימון רק עם ציוד מגן – קסדה, מגני שוקיים וכפפות – על מזרנים ותחת השגחה צמודה." (based on the photos) | True? |
| `src/data/steps.yaml` | "3 steps" copy: form/WhatsApp → we match a group and send days/times → trial, no commitment, no gear | Matches how you actually onboard? |
| `src/data/hero.yaml` → `offer` | "קיקבוקסינג, ג'יו ג'יטסו, ג'ודו ו-MMA – לילדים, לנוער ולבוגרים, בקיבוץ גונן." | OK? |
| `src/data/stats.yaml` | Trust bar: **200+ תלמידים** (figure from Ofir, 12.10) · 6 תחומים · 3 מסלולים | Confirm the exact student count; add years of experience as a 4th stat (see B) |
| `src/pages/accessibility.astro` | Generic statement + phone contact, "עודכן: אוקטובר 2026" | Legally needs a named accessibility coordinator |
| `src/pages/privacy.astro` | Generic policy, phone contact | Legal name + email; lawyer review recommended |
| Schedule section | No timetable → 3 age-track cards with "קבלו את השעות" (WhatsApp per group) | Replace with real timetable (B) |
| Nav label | "הכירו אותנו" (instead of gendered "המאמן") | OK? |

## B. Hidden until real content exists (appear automatically when filled)

- [ ] **Testimonials** – section is hidden. Add 3–6 real ones in `src/data/testimonials.yaml` (with consent) and set `todo: false`. Never publish invented reviews.
- [ ] **Weekly timetable** – `src/data/schedule.yaml` holds an *example*; all rows `todo: true` → hidden. Fill real classes (`todo: false`) → filterable timetable replaces the WhatsApp cards.
- [ ] **Coach highlights + credentials** – empty lists in `coach.yaml` (years, belts, certifications, fight record, camps).
- [ ] **Years of experience** – 4th trust-bar stat in `stats.yaml` (`todo: true` → hidden until a real number).
- [ ] **Exact address, hours, directions, GPS** – `src/config/site.ts` → `location` (now shows "קיבוץ גונן · הגליל העליון" + "ask on WhatsApp").
- [ ] **Google reviews link**, **Instagram Behold feed URL**, **Meta / TikTok pixel IDs** – `src/config/site.ts`.

## C. Decisions still open

- [ ] **Age conflict** – hero + kids: "גיל 4+" / "גיל 4 לא מתאמן עם גיל 12"; FAQ: "מגיל 5 ומעלה". (`hero.yaml`, `kids.yaml`, `faq.yaml`)
- [ ] **"אימון ניסיון חינם"** (mobile bottom bar, from the brief) – old site only says "ללא התחייבות". Is the trial free?
- [ ] **Minors' photo consent** – hero, kids, gallery, Instagram fallback, OG image.
- [ ] **WhatsApp/phone** 972525089079 still correct?
- [ ] **Cookie banner** yes/no. **Keep Google Sheets tracker?**

## D. Media wanted

- [ ] Hero video (8–15 s loop, 16:9 ≥1080p, action centered) → `npm run video -- clip.mov` (needs `brew install ffmpeg`).
- [ ] Vector logo (SVG/AI/PDF).
- [ ] Coach: original portrait (4:5, ≥1600×2000) + 2–4 action shots.
- [ ] Discipline photos: MMA, BJJ, Judo, women's functional, men's functional (+ a better Muay Thai shot).
- [ ] 4–8 kids-class photos; more gallery photos.

## E. Deployment / accounts

- [ ] **Go-live on greenmount.co.il** – the current live site (greenmount-mma) is in a *different* Netlify account. Options: (1) add Ofir to that team and deploy there, or (2) move the domain greenmount.co.il to the new `greenmount-mma-v2` site. Decide with the owner.
- [ ] **Form notifications** – Netlify → greenmount-mma-v2 → Forms → Notifications → email. Form `trial` is detected (fields: name, phone, group, discipline, message). Send one real test submission from the staging URL.
- [ ] Analytics fire **only on greenmount.co.il** (`analytics.hosts` in `src/config/site.ts`) – staging is silent by design.
- [ ] After go-live: GA4 key events `generate_lead` + `whatsapp_click`; submit sitemap in Search Console.
- ⚠️ **Data cleanup:** between ~11:46–11:50 (12.10.2026) the first staging deploy still had tracking on, and automated tests sent events to the real GA4 property and the Google Sheet: a few `page_view`s, button clicks and **2 test `form_submit` rows** (Sheet tab "שליחות טופס") / 2 `generate_lead` events in GA. Delete those Sheet rows; GA test events can be ignored or filtered.

## F. SEO – local ranking for MMA / קיקבוקסינג / אומנויות לחימה בגליל (off-site = the biggest levers)

On-site is done (program pages, titles/H1/descriptions, structured data, sitemap, speed). What's left can only be done by the owner:

1. [ ] **Go live on greenmount.co.il** – nothing ranks until the new site is on the real domain (staging is noindex on purpose).
2. [ ] **Google Business Profile** (`business.google.com`) – the #1 factor for "near me"/local searches and the map pack.
   - Name: GREENMOUNT (don't stuff keywords into the name – against Google rules).
   - Primary category **Martial arts school**; secondary: Kickboxing school, Mixed martial arts gym? (pick what's offered: Jiu-jitsu school, Judo school, Gym).
   - Exact pin at the club, phone 052-508-9079, website https://greenmount.co.il, hours, 10+ real photos (ring, classes, kids, logo).
   - Services: list each program with a short description + link to its page (/mma, /kickboxing, /bjj, /judo, /kids, /functional-training).
   - Post weekly (competition results, new groups) – recent activity helps.
3. [ ] **Reviews** – ask every parent/trainee for a Google review (send the review link on WhatsApp). Reviews mentioning "MMA", "קיקבוקסינג", "גונן", "גליל" help naturally – don't script them.
4. [ ] **Google Search Console** – verify greenmount.co.il, submit `https://greenmount.co.il/sitemap-index.xml`, request indexing for the home page + 6 program pages. (Send me the verification meta tag if you prefer that method.)
5. [ ] **Same name/address/phone everywhere (NAP)**: Facebook page (address + category), Instagram bio + link to greenmount.co.il, Waze place, Apple Maps (Business Connect), easy.co.il, b144/דפי זהב.
6. [ ] **Local links** (strongest after GBP): מועצה אזורית גליל עליון (חוגים/ספורט), קיבוץ גונן website/newsletter, local news sites (e.g. reports on the אינטר קלאב competition with a link), schools/מתנ״סים, the federations the club belongs to.
7. [ ] **Exact address + club pin** → `src/config/site.ts` (`address`, `geo`) – I'll update the structured data.
8. [ ] **Real content** boosts pages: coach credentials (B), timetable (B), testimonials (B), and real photos for BJJ / Judo / MMA / fitness pages (they currently reuse club photos).

Realistic expectation: for a niche + region like "MMA בגליל העליון" there's little competition – with GBP + reviews + the new pages, top results within weeks to a few months after going live. "near me" searches are decided mostly by GBP + reviews + distance.
