# Editing the website content in Sanity

The site's copy lives in a Sanity project (`a11lv153`). Once this is set up,
Brendan or Julia can change any text on the site — plus partner photographs —
from a web page, and the change appears on the live site within seconds. No
deploy, no code, no Claude.

Setup is a one-time job of about fifteen minutes and needs a terminal. After
that, editing is entirely point-and-click.

---

## How it works

The copy exists in two places on purpose:

- **Baked into `index.html`** — so the page loads instantly and search
  engines see the real text.
- **In Sanity** — fetched on page load and swapped in.

If Sanity is ever slow or unreachable, the built-in copy stays on screen. The
site cannot go blank because of a CMS problem. The tradeoff: an edit shows up
in the browser immediately but search engines keep seeing the baked-in version
until the HTML is next updated, so it is worth pasting significant copy changes
into `index.html` eventually. Day-to-day tweaks do not need it.

---

## One-time setup

### 1. Make the dataset readable

At [sanity.io/manage](https://sanity.io/manage) → project `a11lv153` →
**API** → **Datasets**, set `production` to **Public**.

The browser reads content without a login, so this is required. It exposes
only published website copy — the same words already visible on the site. It
does *not* expose drafts, your account, or anything else.

### 2. Install the Studio

The `sanity/` folder in this project is the editing interface. From a terminal:

```
cd sanity
npm install
```

### 3. Load the current copy

This uploads everything currently on the site so you start from real content
rather than empty fields:

```
npx sanity login
npm run seed
```

`npm run seed` replaces the `site` document. Run it once. Running it again
later would overwrite edits made in the Studio.

### 4. Publish the Studio

```
npm run deploy
```

Choose `davisandkwong` as the hostname when prompted. The editing interface is
then permanently at:

**https://davisandkwong.sanity.studio**

### 5. Point the site at Sanity

`index.html` already loads `sanity-content.js`. Commit both files, along with
the `sanity/` folder, and deploy as usual. Nothing else to configure.

### 6. Invite the partners

At [sanity.io/manage](https://sanity.io/manage) → **Members** → **Invite**.
Give them the **Editor** role — they can write and publish content but cannot
change the schema or billing.

---

## Editing, day to day

Go to **https://davisandkwong.sanity.studio**, sign in, open **Website
content**. Tabs across the top match the sections of the website: Header &
footer, Hero, About, Practice areas, Attorneys, Contact, Intake form.

Change what you need, then press **Publish**. Reload the website to see it.

Nothing is live until you press Publish, so you can leave a half-finished
edit and come back to it.

### Italic phrases in headings

The site sets one phrase in each heading in gold italic. To control which,
wrap it in asterisks:

```
Meet the *partners*
```

renders as "Meet the *partners*" with the last word in gold italic. Headings
also keep your line breaks, which is how the hero headline stays on two lines.

### Partner photographs

Under **Attorneys**, each partner has a **Photograph** field. Drag in a
headshot — square or portrait, at least 700px on the short side.

After uploading, click the image and use **hotspot** to mark the part that
must stay in frame. The site crops to a wide-ish rectangle, and without a
hotspot the crop centres by default, which can cut off a face.

With no photograph, the card falls back to the partner's initials — how the
site looks today. Both partners should have a photograph or neither; one of
each looks unfinished.

### Things the Studio will stop you doing

Some limits are deliberate, because the layout depends on them:

- **Exactly four statistics** — they sit in a 2×2 grid.
- **Exactly six practice areas** — the grid is three across, so five would
  leave a visible hole.
- **Three focus tags per partner** — a fourth wraps to a second line and
  pushes the email out of alignment with the other card.

Bio paragraphs are worth keeping similar in length between the two partners:
the cards are height-matched, so a much shorter bio leaves visible empty space.

### What is not editable

- **Intake form field labels** — they map to spreadsheet column headers.
  Changing them in isolation would misalign the data. The form's heading,
  step names, consent notice and confirmation message *are* editable.
- **Navigation labels**, colours, fonts, and layout — these live in the HTML.
- **Where intake submissions go** — see `google-sheet-setup.md`.

---

## If something looks wrong

**An edit isn't showing.** Did you press Publish? Then hard-reload
(⌘⇧R / Ctrl+Shift+R). Sanity's CDN can also hold a response for up to a
minute.

**The site shows the old copy everywhere.** The fetch is failing and the
built-in copy is doing its job. Open the browser console — the script logs
`[sanity] content fetch failed`. Usually the dataset is still Private
(step 1).

**A photo is cropped badly.** Set the hotspot on the image in the Studio.

**Everything broke after a schema edit.** The schema lives in
`sanity/schemas/index.js`. Changing field *names* there breaks the mapping in
`sanity-content.js`, which reads specific paths. Field labels and descriptions
are safe to change; names are not.

---

## Files

| File | What it is |
| --- | --- |
| `sanity/schemas/index.js` | Defines the editable fields |
| `sanity/sanity.config.js` | Studio configuration |
| `sanity/seed.ndjson` | The site's current copy, for the initial import |
| `sanity-content.js` | Fetches content and applies it to the page |
| `index.html` | The site, with copy baked in as the fallback |
