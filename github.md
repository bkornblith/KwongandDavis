repo: bkornblith/KwongandDavis
branch: main
path: (whole repo)

## Last sync

date: 2026-09-16T13:12:00Z

### Updated in this project

- Site copy moved into Sanity (project `a11lv153`, dataset `production`); copy stays baked into `index.html` as an SEO-safe fallback and is swapped live by `sanity-content.js`.
- Added a hosted-Studio setup under `sanity/` — singleton schema, config, and `seed.ndjson` carrying the current copy.
- Partner bios now support real photographs from the CMS, falling back to initials when none is set.
- Intake still posts to the Apps Script Web app that appends to the firm's Google Sheet and emails an alert.

## Screen map

| Project screen | Repo files |
| --- | --- |
| `index.html` — intake modal markup + `m-*` CSS | `index.html` (modal markup, `m-*` CSS) |
| `index.html` — form field set + urgency rule | `api/submit.js` (field names, 14-day rule — reimplemented client-side) |
| `apps-script.gs` | replaces `api/submit.js` + `api/lib/supabase.js` |
| `sanity/`, `sanity-content.js` | new in this project; no repo counterpart |
| — obsolete | `api/`, `vercel.json`, `package.json` |

## Repo cleanup pending (upstream)

Safe to delete — nothing in this project references them:

- `api/` (all four files) — the Supabase receiver, replaced by `apps-script.gs`
- `vercel.json` — only routed `/api/*`
- `package.json` / `package-lock.json` / `node_modules/` — Supabase and Vercel
  analytics dependencies; the site is static and needs no build

Keep `index.html` upstream only if it is the deployed site; this project's
`index.html` is the current version and should overwrite it. Also commit
`sanity-content.js` and the `sanity/` folder.

**Security:** `api/lib/supabase.js` committed a Supabase service-role key in
plaintext (and misread it as an env var name, so it never worked). Deleting the
file does not remove it from git history — rotate the key in the Supabase
dashboard.

## Sync history

- 2026-09-11T19:19:00Z — intake moved off Supabase to an Apps Script Web app writing to Google Sheets; added `apps-script.gs` and `google-sheet-setup.md`.
- 2026-09-11T18:44:33Z — replaced the mocked Clio intake modal with the repo's 3-step form posting to `/api/submit` (Supabase).
