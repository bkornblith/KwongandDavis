# Editing the website content in Sanity

The site's copy lives in a Sanity project (`a11lv153`). Brendan or Julia can
change any text on the site — plus partner photographs — from a web page, press
Publish, and the live site updates on its own within about a minute.

Setup is a one-time job of roughly twenty minutes and needs a terminal. After
that, editing is entirely point-and-click.

---

## How it works

1. An editor presses **Publish** in the Studio.
2. Sanity POSTs to a Vercel deploy hook — a private URL that triggers a build.
3. The build runs `scripts/build.js`, which reads the published content and
   writes it into `index.html`.
4. Vercel deploys the result.

So the copy ends up in the HTML itself — fast to load, visible to search
engines, and not dependent on the visitor's browser reaching Sanity.

`sanity-content.js` then re-fetches on page load purely to cover the minute a
rebuild takes, so someone arriving mid-deploy still sees the new words. If that
fetch fails, nothing breaks: the deployed copy is already on screen.

---

## One-time setup

### 1. Install the Studio

The `sanity/` folder is the editing interface. From a terminal:

```
cd sanity
npm install
npx sanity login
```

### 2. Load the current copy

Uploads everything currently on the site, so you start from real content
rather than empty fields:

```
npm run seed
```

Run this **once**. Running it again later would overwrite Studio edits.

### 3. Publish the Studio

```
npm run deploy
```

The editing interface is then permanently at
**https://davisandkwong.sanity.studio**

### 4. Create a Vercel deploy hook

Vercel → project → **Settings** → **Git** → **Deploy Hooks**. Create one named
`Sanity publish` on branch `main`, and copy the URL it gives you.

Treat that URL as a password. It contains a unique token and anyone holding it
can trigger a rebuild — which is harmless in itself (a build only re-reads
published content) but there is no reason to publish it. If it ever leaks,
delete the hook and make a new one.

### 5. Create the Sanity webhook

At [sanity.io/manage](https://sanity.io/manage) → project `a11lv153` → **API**
→ **Webhooks** → **Create webhook**:

| Field | Value |
| --- | --- |
| Name | `Rebuild website` |
| URL | the deploy hook URL from step 4 |
| Dataset | `production` |
| Trigger on | **Create**, **Update**, **Delete** |
| Filter | `_type == "site"` |
| HTTP method | `POST` |
| Drafts | leave **off** |

The filter matters: without it, every draft keystroke would queue a rebuild.
Leaving drafts off is what makes Publish the trigger.

### 6. Deploy

Commit and push `index.html`, `content-apply.js`, `sanity-content.js`,
`scripts/build.js`, `package.json`, and the `sanity/` folder. Vercel will
install `node-html-parser` and run the bake automatically.

### 7. Invite the partners

sanity.io/manage → **Members** → **Invite**, with the **Editor** role. They can
write and publish content but cannot change the schema or billing.

### Optional: let the browser read Sanity directly

Only needed for the mid-rebuild refresh described above. Under **API**, set the
`production` dataset to **Public** and add `https://davisandkwong.com` to
**CORS origins** (credentials off). Skip this and the site still works; it just
waits for the rebuild.

---

## Editing, day to day

Go to **https://davisandkwong.sanity.studio**, sign in, open **Website
content**. The tabs match the sections of the website.

Change what you need, then press **Publish**. Wait about a minute and reload
the site.

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

**An edit isn't showing.** Did you press Publish? Then give it a minute and
hard-reload (⌘⇧R / Ctrl+Shift+R).

**Nothing rebuilds on publish.** Check the webhook's delivery log in
sanity.io/manage → API → Webhooks. A `404` or `403` means the deploy hook URL
is wrong or has been deleted — create a new hook in Vercel and paste the new
URL in. A successful call returns `201`; if you see that but no new deploy
appears, check the hook is pointed at the `main` branch.

**The build log says "Skipped content bake".** The build could not reach
Sanity, so it deployed the copy as committed rather than failing. The message
after it names the reason.

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
| `content-apply.js` | Turns content into page markup; shared by build and browser |
| `scripts/build.js` | Bakes content into `index.html` at deploy time |
| `sanity-content.js` | Live refresh, covering the minute a rebuild takes |
