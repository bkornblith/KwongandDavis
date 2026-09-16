# Connecting the intake form to your Google Sheet

The website posts each submission to a small Apps Script attached to your
spreadsheet, which appends one row. No API keys, no server, nothing secret in
the page source.

Takes about five minutes.

---

## 1. Add a tab called `Intake`

Open your existing sheet and add a tab named exactly `Intake` (case matters).
Leave it empty — the script writes its own header row on the first submission.

Prefer a different tab name? Change `SHEET_NAME` at the top of the script in
step 2 to match.

## 2. Paste in the script

In your sheet: **Extensions → Apps Script**. Delete the placeholder
`function myFunction() {}` and paste the entire contents of `apps-script.gs`
from this project. Save (⌘S / Ctrl+S).

## 3. Deploy it as a Web app

**Deploy → New deployment**, then:

- Click the gear next to "Select type" → **Web app**
- **Description:** anything, e.g. `Intake receiver`
- **Execute as:** `Me` — so the script can write to your sheet
- **Who has access:** **`Anyone`** ← this one matters

"Anyone" means anyone who knows the URL can POST to it. They cannot read your
sheet, and the script only ever appends a row, so the exposure is limited to
someone submitting junk inquiries.

Click **Deploy**.

## 4. Authorize it

Google will ask you to review permissions. You will see a warning screen —
click **Advanced → Go to (your project name)**, then **Allow**. This is normal
for a script you wrote yourself; it appears because the script is not
publicly verified.

## 5. Copy the Web app URL

After deploying, copy the **Web app URL**. It looks like:

```
https://script.google.com/macros/s/AKfycb.../exec
```

It must end in `/exec` — not `/dev`.

## 6. Paste it into the website

In `index.html`, find this line (near the bottom, in the page script):

```js
const SHEET_ENDPOINT = 'REPLACE_WITH_WEB_APP_URL';
```

Replace the placeholder with your URL. Save.

That's it — submit the form and a row appears in the `Intake` tab.

---

## Changing the columns

`COLUMNS` at the top of `apps-script.gs` controls both the header labels and
the column order. Reorder or relabel freely; delete a line to drop a column.
If you already have rows, existing data will not shift to match — change
columns before you go live, or clear the tab afterwards.

## Redeploying after an edit

Editing the script does **not** update the live endpoint. Go to
**Deploy → Manage deployments**, click the pencil icon, set **Version** to
`New version`, and **Deploy**. The URL stays the same.

## If submissions fail

- **Error message on submit** — usually the URL: confirm it ends in `/exec`
  and that access is set to `Anyone`.
- **Rows stop appearing after a script edit** — you did not redeploy a new
  version (see above).
- **Checking for errors** — in the Apps Script editor, **Executions** in the
  left sidebar shows every call and its error, if any.

## Notes

- Required fields are validated twice: in the browser, and again in the script
  (`firstName`, `lastName`, `email`, `situation`). A submission missing any of
  them is rejected rather than written.
- The 14-day urgency flag is computed in the browser and sent as the
  `Urgent flag` column. Treat it as triage convenience, not something
  tamper-proof.
- Every submission emails `ben.harris.kornblith@gmail.com` (the `NOTIFY` constant at
  the top of `apps-script.gs` — add more addresses comma-separated). Urgent
  submissions are prefixed `[URGENT]` in the subject, and replies go straight
  to the inquirer. Mail sends *from* whichever Google account owns the script,
  and a mail failure never loses the row.
