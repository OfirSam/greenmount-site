# GREENMOUNT – open items (internal – not shown on the site)

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
