# Editing the website content in Sanity

The site's copy lives in a Sanity project (`a11lv153`). Brendan or Julia can
change any text on the site — plus partner photographs — from a web page, press
Publish, and the change is live immediately. No deploy, no rebuild.

Setup is a one-time job of about fifteen minutes and needs a terminal. After
that, editing is entirely point-and-click.

---

## How it works

The site fetches the published content from Sanity on every page load and
applies it. Pressing Publish is the only step; the next visitor sees the new
words.

The copy is also baked into `index.html`. That is what renders first and what
search engines read, and it is the fallback if Sanity is ever unreachable — the
site cannot go blank because of a CMS problem.

The tradeoff of skipping a build: search engines keep seeing the baked-in
version until `index.html` is next updated. Day-to-day edits do not need it,
but it is worth pasting a significant rewrite into the HTML eventually.

---

## One-time setup

### 1. Make the content readable by the site

At [sanity.io/manage](https://sanity.io/manage) → project `a11lv153` → **API**:

- **Datasets** — set `production` to **Public**. The browser reads content
  without a login, so this is required. It exposes only published website copy
  — the same words already visible on the site — not drafts or your account.
- **CORS origins** — add `https://davisandkwong.com` with **Allow
  credentials** off. Add `https://www.davisandkwong.com` too if that address
  resolves. Sanity refuses browser requests from any origin not on this list.

Both are required. Miss either and the site quietly falls back to its built-in
copy, which looks exactly like an edit not saving.

### 2. Install the Studio

The `sanity/` folder is the editing interface. From a terminal:

```
cd sanity
npm install
npx sanity login
```

### 3. Load the current copy

Uploads everything currently on the site, so you start from real content
rather than empty fields:

```
npm run seed
```

Run this **once**. Running it again later would overwrite Studio edits.

### 4. Publish the Studio

```
npm run deploy
```

The editing interface is then permanently at
**https://davisandkwong.sanity.studio**

### 5. Deploy

Commit and push `index.html`, `content-apply.js`, `sanity-content.js` and the
`sanity/` folder. The site is static — there is no build step and no
serverless function.

### 6. Invite the partners

sanity.io/manage → **Members** → **Invite**, with the **Editor** role. They can
write and publish content but cannot change the schema or billing.

---

## Editing, day to day

Go to **https://davisandkwong.sanity.studio**, sign in, open **Website
content**. The tabs match the sections of the website.

Change what you need, then press **Publish**, then reload the site.

Nothing is live until you press Publish, so you can leave a half-finished edit
and come back to it.

### Italic phrases in headings

The site sets one phrase in each heading in gold italic. To choose which, wrap
it in asterisks:

```
Meet the *partners*
```

Headings also keep your line breaks, which is how the hero headline stays on
two lines.

### Partner photographs

Under **Attorneys**, each partner has a **Photograph** field. Drag in a
headshot — square or portrait, at least 700px on the short side.

After uploading, click the image and use **hotspot** to mark the part that must
stay in frame. The site crops to a rectangle, and without a hotspot the crop
centres by default, which can cut off a face.

With no photograph, the card falls back to the partner's initials. Both
partners should have one or neither; one of each looks unfinished.

### Things the Studio will stop you doing

Deliberate limits, because the layout depends on them:

- **Exactly four statistics** — they sit in a 2×2 grid.
- **Exactly six practice areas** — the grid is three across, so five would
  leave a visible hole.
- **Three focus tags per partner** — a fourth wraps and pushes the email out of
  alignment with the other card.

Bio paragraphs are worth keeping similar in length between the two partners:
the cards are height-matched, so a much shorter bio leaves visible empty space.

### What is not editable

- **Intake form field labels** — they map to spreadsheet column headers.
  Changing them in isolation would misalign the data. The form's heading, step
  names, consent notice and confirmation message *are* editable.
- **Navigation labels**, colours, fonts, and layout — these live in the HTML.
- **Where intake submissions go** — see `google-sheet-setup.md`.

---

## If something looks wrong

**An edit isn't showing.** Did you press Publish? Then hard-reload
(⌘⇧R / Ctrl+Shift+R).

**The site shows the old copy everywhere.** The fetch is failing and the
built-in copy is doing its job. Open the browser console — the script logs
`[sanity] content fetch failed`. Two likely causes, both from step 1: the
dataset is still Private, or the site's address is not in **CORS origins**. A
`403` in the console points to CORS.

**To confirm Sanity itself is fine,** open this in a browser tab — it should
show your current copy:

```
https://a11lv153.apicdn.sanity.io/v2024-01-01/data/query/production?query=*[_type=="site"][0]
```

**A photo is cropped badly.** Set the hotspot on the image in the Studio.

**Everything broke after a schema edit.** The schema lives in
`sanity/schemas/index.js`. Changing field *names* breaks `content-apply.js`,
which reads specific paths. Labels and descriptions are safe to change; names
are not.

---

## Files

| File | What it is |
| --- | --- |
| `sanity/schemas/index.js` | Defines the editable fields |
| `sanity/sanity.config.js` | Studio configuration |
| `sanity/seed.ndjson` | The site's copy, for the initial import |
| `content-apply.js` | Turns content into page markup |
| `sanity-content.js` | Fetches published content and applies it on page load |
