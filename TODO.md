# GREENMOUNT – TODO list (what's needed to finish & launch)

Legend: **[LAUNCH]** blocks going live · **[DESIGN]** needed for the full design · **[OPTIONAL]**
Placeholders in the code are marked `TODO:` (search the repo for `TODO`). In `npm run dev`, placeholder content is outlined in gold with a "TODO" tag.

---

## 1. Decisions (answer in chat)

- [ ] **[LAUNCH] Age conflict** – hero chip + kids copy say **"גיל 4+"** / "גיל 4 לא מתאמן עם גיל 12", FAQ says **"מגיל 5 ומעלה"**. Which is correct? (`src/data/hero.yaml`, FAQ in stage 4)
- [ ] **[LAUNCH] "אימון ניסיון חינם"** – mobile bottom-bar text from the brief. The current site only says *"אימון ניסיון ללא התחייבות"*. Confirm the trial is actually free, otherwise I'll change the wording.
- [ ] **[LAUNCH] Coach identity** – logo says "Neta Greenberg", TikTok is @neta_grinberg.
  - Hebrew spelling of the name?
  - Which person in the photos is the coach?
  - Hebrew grammatical gender for the bio copy (Hebrew forces it – I won't guess).
- [ ] **[LAUNCH] Photo consent for minors** – the hero poster (kids sparring), kids section and gallery show children's faces. Confirm parental consent for each, or tell me which photos to drop/crop.
- [ ] **[LAUNCH] WhatsApp number** – carried over from the old site: `972525089079`. Still correct? (`src/config/site.ts`)
- [ ] **[LAUNCH] Netlify access** – is the current site deployed from Git or drag-and-drop? I need the site linked (`netlify link`) to deploy. Production deploy only after your OK.
- [ ] **Cookie/consent banner** – yes/no? (Israel Privacy Amendment 13 leans toward it; adds friction.) Default now: no banner, analytics load after page is idle.
- [ ] **Google Sheets tracker** – kept (same payload as the old site). Keep it?
- [ ] **Prefilled WhatsApp messages** – review the 12 context messages in `src/config/site.ts` (general, trial, kids, youth, adults, schedule + one per discipline).

## 2. Media

### Hero video → `public/assets/video/`
- [ ] **[DESIGN]** Raw clip: **8–15 s seamless loop**, landscape 16:9, **≥1080p**, no audio needed, steady (gimbal/tripod), bright light.
  - Keep the action **in the center third** – phones crop to the middle of the frame.
  - Ideal: pads/sparring/kids drilling + the GREENMOUNT ring. Avoid identifiable minors without consent.
  - Optional: a separate **vertical 9:16** clip for mobile.
- I'll encode: `hero.mp4` (1080p H.264, ~3.5 MB), `hero.webm` (VP9), `hero-mobile.mp4` (720p, ~1.5 MB). The `<video>` only appears once these files exist; until then the poster (photo of kids sparring) is shown.

### Logo → `assets/images/brand/`
- [ ] **[DESIGN] Vector logo** – SVG / AI / PDF / EPS. Only a 250×250 PNG exists; it looks soft on retina screens and in the OG image.
- [ ] [OPTIONAL] Horizontal lockup or wordmark-only version.

### Coach → `assets/images/coach/`
- [ ] **[LAUNCH] Main portrait** – 4:5, **≥1600×2000**, color original (I'll grade it).
- [ ] **[DESIGN] 2–4 action shots** – teaching, holding pads, competition/fight, cornering.
- [ ] **[DESIGN] Originals of photos 10–11** (Thailand) – the current files are Instagram screenshots with carousel arrows/dots baked in, B&W, ~1450 px.
- [ ] [OPTIONAL] Photos of belts / certificates / medals.

### Disciplines → `assets/images/disciplines/` (one per program, ≥1600 px, 3:2 or 4:5)
| Program | Status |
|---|---|
| איגרוף תאילנדי / קיקבוקסינג | Have sparring shots (04, 01). Better: kick / clinch / pads |
| MMA | **Missing** |
| ג'יו ג'יטסו ברזילאי (BJJ) | **Missing** |
| ג'ודו | **Missing** |
| כושר פונקציונלי לנשים | **Missing** |
| כושר פונקציונלי לגברים | **Missing** |

Missing photos get a branded placeholder card until supplied.

### Kids → `assets/images/kids/`
- [ ] **[DESIGN] 4–8 photos** of kids' classes across ages (incl. the youngest group), with consent.

### Gallery → `assets/images/gallery/`
- [ ] **[DESIGN]** More photos – JPG/PNG/WebP, ≥1600 px on the long edge. Prefix file names `01-`, `02-`… to set the order. The build converts everything to AVIF/WebP automatically.

### Testimonials → `assets/images/testimonials/`
- [ ] **[LAUNCH] 3–6 testimonials** (parents + adult trainees): name (or e.g. "אמא של יואב"), role, text, optional square photo ≥400 px – with consent.
- [ ] [OPTIONAL] Google Business Profile link for a reviews slot.

### Social share image
- [ ] I'll generate the 1200×630 OG image from your photos (the old `og-image.jpg` is a 404). [OPTIONAL] supply a custom one.

## 3. Content (Hebrew)

- [ ] **[LAUNCH] Coach bio** – name, years of experience, background, credentials (belts, coaching certifications), fight record / titles, coaching philosophy (2–3 sentences), optional personal quote.
- [ ] **[LAUNCH] Trust-bar numbers** – years of experience, number of trainees (`src/data/stats.yaml`, now placeholders 20+ / 150+).
- [ ] **[DESIGN] Discipline details** – for each of the 6 programs, 2–4 more sentences for the "לפרטים נוספים" panel: who it's for, what a class looks like, level, gear needed.
- [ ] **[DESIGN] Kids program** – age-group breakdown (e.g. 4–6 / 7–9 / 10–12) and how the "תוכנית התקדמות ייחודית" works (belts? stripes? tests?).
- [ ] **[LAUNCH] Weekly schedule** – day, time, group, discipline, age range, coach.
- [ ] **[LAUNCH] Location** – exact address inside Kibbutz Gonen, opening hours, Google Maps link / pin, parking & access notes (`src/config/site.ts`).

## 4. Accounts & integrations

- [ ] **[DESIGN] Instagram feed** (recommended: Behold.so)
  1. Switch @greenmount_mma to a **Professional account** (Creator or Business) – free, in Instagram settings.
  2. Create a free account at behold.so → connect Instagram → create a **JSON feed**.
  3. Send me the feed URL (goes into `src/config/site.ts`).
  Until then the section shows static photos + "Follow us" CTA.
- [ ] **[LAUNCH] Trial-request emails** – which address receives form submissions? (Netlify → Forms → Notifications.)
- [ ] [OPTIONAL] **Meta Pixel ID** – if running Facebook/Instagram ads (`src/config/site.ts`).
- [ ] [OPTIONAL] **TikTok Pixel ID**.
- [ ] **GA4** – already live (`G-VH93JV5K4J`), carried over. After launch, mark `generate_lead` + `whatsapp_click` as **key events** in GA4.
- [ ] **Domain** – canonical is greenmount.co.il; confirm DNS points to this Netlify site.
- [ ] [OPTIONAL] **Google Business Profile** – for the map pin + reviews.

## 5. Legal pages

- [ ] **[LAUNCH] Accessibility statement (הצהרת נגישות)** – accessibility coordinator name + phone/email, date of last review.
- [ ] **[LAUNCH] Privacy policy** – business legal name, contact for data requests (the form collects name + phone).

---

### Fixed from the old site (FYI)
- Hero audience buttons didn't scroll (`window.scrollTo` was overridden in `main.js`) → now plain anchor links.
- `og-image.jpg` 404 → new OG image (stage 4).
- No `robots.txt` / `sitemap.xml` → both added.
- "לפרטים נוספים" opened a generic WhatsApp message → per-discipline panel + per-discipline message.
