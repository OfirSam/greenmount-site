# GREENMOUNT – TODO list (what's needed to finish & launch)

Legend: **[LAUNCH]** blocks going live · **[DESIGN]** needed for the full design · **[OPTIONAL]**
Placeholders in the code are marked `TODO` (search the repo for `TODO`). In `npm run dev`, placeholder content is outlined in gold with a "TODO" tag – the outline never appears on the live site, **but the placeholder text does**, so every `[LAUNCH]` item must be filled before deploying to production.
How to edit each file: see [README.md](README.md) §2.

---

## 1. Decisions (answer in chat)

- [ ] **[LAUNCH] Age conflict** – hero chip + kids copy say **"גיל 4+"** / "גיל 4 לא מתאמן עם גיל 12", FAQ says **"מגיל 5 ומעלה"**. Which is correct? (`hero.yaml`, `kids.yaml` ×2, `faq.yaml`)
- [ ] **[LAUNCH] "אימון ניסיון חינם"** – mobile bottom-bar text from the brief (`src/components/StickyCtas.astro`). The old site only says *"ללא התחייבות"*. Confirm the trial is free, otherwise I'll change the wording.
- [ ] **[LAUNCH] Coach identity** – logo says "Neta Greenberg", TikTok @neta_grinberg.
  - Hebrew spelling of the name? Is "NETA GREENBERG" (shown in Latin under the name) correct?
  - Which person in the photos is the coach? (Coach section currently uses the two Thailand photos.)
  - Hebrew grammatical gender for the bio – Hebrew forces it, so I left every coach text as TODO.
  - Nav label: I used **"הכירו אותנו"** instead of "המאמן" (gender-neutral). Keep or change? (`src/config/site.ts` → `nav`)
- [ ] **[LAUNCH] Photo consent for minors** – hero poster, kids section, gallery, Instagram fallback and OG share image show children's faces. Confirm parental consent, or tell me which photos to drop.
- [ ] **[LAUNCH] WhatsApp / phone** – `972525089079` (from the old site) is used for WhatsApp, the `tel:` link and Google structured data. Still correct?
- [ ] **[LAUNCH] Netlify access** – Git-connected or drag-and-drop today? I need `netlify link` to the existing site (README §9). Production deploy only after your OK.
- [ ] **Cookie/consent banner** – yes/no? (Israel Privacy Amendment 13 leans toward it.) Current: no banner; analytics load after the page is idle, only on the live site.
- [ ] **Google Sheets tracker** – kept (same payload as the old site). Keep it?
- [ ] **Prefilled WhatsApp messages** – review the 12 messages in `src/config/site.ts`.

## 2. Media

### Hero video → run `npm run video -- clip.mov` (README §3)
- [ ] **[DESIGN]** Raw clip: **8–15 s seamless loop**, landscape 16:9, **≥1080p**, no audio needed, steady, bright. Action in the **center third** (phones crop to the middle). Optional separate **vertical 9:16** clip for mobile.
- Install ffmpeg first: `brew install ffmpeg`. Until a clip exists, the poster photo is shown (no broken video request).

### Logo → `assets/images/brand/`
- [ ] **[DESIGN] Vector logo** (SVG / AI / PDF / EPS). Only a 250×250 PNG exists – soft on retina screens.

### Coach → `assets/images/coach/`
- [ ] **[LAUNCH] Main portrait** – 4:5, ≥1600×2000, color original. Current `coach-main.jpg` / `coach-pads.jpg` are crops of Instagram screenshots (B&W, ~1300px) – usable, but originals look much better.
- [ ] **[DESIGN] 2–4 action shots** – teaching, pads, competition, cornering.
- [ ] [OPTIONAL] Belts / certificates / medals.

### Disciplines → `assets/images/disciplines/` + `image:` field in `disciplines.yaml`
| Program | Status |
|---|---|
| איגרוף תאילנדי / קיקבוקסינג | Using the adult sparring photo. Better: kick / clinch / pads |
| MMA | **Missing** (branded placeholder card) |
| ג'יו ג'יטסו ברזילאי | **Missing** |
| ג'ודו | **Missing** |
| כושר פונקציונלי לנשים | **Missing** |
| כושר פונקציונלי לגברים | **Missing** |

### Kids → `assets/images/kids/`
- [ ] **[DESIGN] 4–8 photos** of kids' classes across ages (incl. the youngest group), with consent.

### Gallery → `assets/images/gallery/` (+ alt text in `gallery.yaml`)
- [ ] **[DESIGN]** More photos, ≥1600px. Prefix names `10-`, `11-`… Then `npm run images`.

### Instagram fallback → `assets/images/instagram/` [OPTIONAL]
- Shown only if the live feed isn't set up / fails. Empty = reuses the gallery photos.

### Testimonials → `assets/images/testimonials/`
- [ ] **[LAUNCH]** see §3.

### Social share image
- Done: `public/og-image.jpg` (1200×630) generated from the hero photo. Regenerate with `npm run og` after changing the hero photo or logo.

## 3. Content (Hebrew) – file → what's missing

| File | Placeholders | What's needed |
|---|---|---|
| `src/data/coach.yaml` | 17 | **[LAUNCH]** name, role, opening line, 3 bio paragraphs, 3 highlight numbers, 5 credentials, philosophy, personal quote |
| `src/data/stats.yaml` | 2 | **[LAUNCH]** years of experience, number of trainees (now fake 20+ / 150+) |
| `src/data/disciplines.yaml` | 12 | **[DESIGN]** per program: "למי זה מתאים" + "איך נראה אימון" (the "מה צריך להביא" line is filled from the FAQ) |
| `src/data/kids.yaml` | 2 | **[DESIGN]** safety card (protective gear, mats, first aid, kids per coach); age conflict |
| `src/data/schedule.yaml` | all | **[LAUNCH]** the whole timetable is an example – real days/times/groups |
| `src/data/testimonials.yaml` | 3 cards | **[LAUNCH]** 3–6 real testimonials (name, role, text, optional photo) – with consent. Never publish invented reviews. |
| `src/config/site.ts` | 8 | **[LAUNCH]** exact address, opening hours, (optional) directions/parking, GPS coordinates, Google reviews link, Instagram feed URL, Meta/TikTok pixel IDs |
| `src/pages/accessibility.astro` | 4 | **[LAUNCH]** physical accessibility at the club, coordinator name + email, review date |
| `src/pages/privacy.astro` | 4 | **[LAUNCH]** business legal name, privacy contact email, pixels (if enabled), date – ideally reviewed by a lawyer |
| `src/components/JsonLd.astro` | 1 | opening hours as structured data (once hours are final) |

## 4. Accounts & integrations

- [ ] **[DESIGN] Instagram feed (Behold.so)** – README §6: switch @greenmount_mma to a Professional account → create a Behold JSON feed → paste URL into `src/config/site.ts`.
- [ ] **[LAUNCH] Form notification email** – Netlify → Forms → Notifications (README §7). Test one real submission on the deploy preview – Netlify Forms only works on Netlify, not locally.
- [ ] [OPTIONAL] **Meta Pixel ID**, **TikTok Pixel ID** → `src/config/site.ts`.
- [ ] **GA4** – after launch mark `generate_lead` + `whatsapp_click` as **key events**.
- [ ] **Domain** – confirm greenmount.co.il DNS points to the Netlify site (canonical, sitemap and OG all use greenmount.co.il).
- [ ] [OPTIONAL] **Google Business Profile** – exact map pin + reviews link.

## 5. Launch checklist

1. Fill every **[LAUNCH]** item above; set `todo: false` (or delete the line) on filled entries.
2. `npm run check && npm run build` – both must pass.
3. `npm run deploy:preview` → open the draft URL on a phone → send a test form → check the email arrives.
4. Your OK → `npm run deploy`.
5. GA4 key events; submit `https://greenmount.co.il/sitemap-index.xml` in Google Search Console.

---

### Fixed from the old site (FYI)
- Hero audience buttons didn't scroll (`window.scrollTo` was overridden in `main.js`) → now plain anchor links.
- `og-image.jpg` was a 404 → new 1200×630 share image.
- No `robots.txt` / `sitemap.xml` → both added.
- "לפרטים נוספים" opened a generic WhatsApp message → per-discipline detail panel + per-discipline WhatsApp message.
- No way to book except WhatsApp → trial form (Netlify Forms) + WhatsApp everywhere.
