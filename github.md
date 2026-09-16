repo: bkornblith/KwongandDavis
branch: main
path: (whole repo)

## Last sync

date: 2026-09-16T14:30:00Z

### Updated in this project

- Sanity content refreshes client-side on every page load — publishing is instant, with no rebuild or deploy. Requires the `production` dataset public-read and `davisandkwong.com` in Sanity's CORS origins.
- Content-to-markup logic lives in `content-apply.js`; `sanity-content.js` fetches and applies it. Copy stays baked into `index.html` as the first render and offline fallback.
- No build step and no serverless functions — the site is static HTML plus two scripts.
- Intake still posts to the Apps Script Web app that appends to the firm's Google Sheet and emails an alert.

## Screen map

| Project screen | Repo files |
| --- | --- |
| `index.html` — intake modal markup + `m-*` CSS | `index.html` (modal markup, `m-*` CSS) |
| `index.html` — form field set + urgency rule | `api/submit.js` (field names, 14-day rule — reimplemented client-side) |
| `apps-script.gs` | replaces `api/submit.js` + `api/lib/supabase.js` |
| `content-apply.js`, `sanity-content.js`, `sanity/` | new in this project; no repo counterpart |
| — obsolete | `api/` (all files), `vercel.json`, `package.json`, `package-lock.json`, `node_modules/` |

## Repo cleanup pending (upstream)

- Delete the whole `api/` folder — the Supabase receiver, replaced by
  `apps-script.gs`. The site has no serverless functions now.
- Delete `vercel.json` — it only routed `/api/*`.
- Delete `node_modules/` from version control, plus `package.json` and
  `package-lock.json` — the site is static and needs no dependencies.

This project's `index.html` is the current version and should overwrite the
repo's.

**Security:** `api/lib/supabase.js` committed a Supabase service-role key in
plaintext (and misread it as an env var name, so it never worked). Deleting the
file does not remove it from git history — rotate the key in the Supabase
dashboard.

## Sync history

- 2026-09-16T14:05:00Z — briefly routed Sanity publishes through a Vercel deploy hook with a build-time content bake; reverted the same day in favour of instant client-side refresh.
- 2026-09-16T13:12:00Z — site copy moved into Sanity (`a11lv153`); hosted Studio under `sanity/`, live-fetch hydration, partner photo support.
- 2026-09-11T19:19:00Z — intake moved off Supabase to an Apps Script Web app writing to Google Sheets; added `apps-script.gs` and `google-sheet-setup.md`.
- 2026-09-11T18:44:33Z — replaced the mocked Clio intake modal with the repo's 3-step form posting to `/api/submit` (Supabase).
