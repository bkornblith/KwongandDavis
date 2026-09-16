/**
 * Kwong & Davis LLP — intake receiver
 *
 * Appends one row per website intake submission to the bound spreadsheet.
 * Paste this into Extensions → Apps Script on your Google Sheet, then deploy
 * it as a Web app (see google-sheet-setup.md for the exact steps).
 */

// Must match the tab name in your spreadsheet.
const SHEET_NAME = 'Intake';

// Who gets notified on each submission. Add more addresses comma-separated.
const NOTIFY = 'ben.harris.kornblith@gmail.com';

// Column order. The header row is written automatically on first run.
const COLUMNS = [
  ['Submitted',         r => new Date()],
  ['First name',        r => r.firstName],
  ['Last name',         r => r.lastName],
  ['Email',             r => r.email],
  ['Phone',             r => r.phone],
  ['Preferred contact', r => r.preferredContact],
  ['Best time',         r => r.bestTime],
  ['Situation',         r => r.situation],
  ['Has attorney',      r => r.hasAttorney],
  ['Urgency',           r => r.urgency],
  ['Has deadline',      r => r.hasDeadline],
  ['Deadline date',     r => r.deadlineDate],
  ['Deadline type',     r => r.deadlineType],
  ['Referral',          r => r.referral],
  ['Urgent flag',       r => r.isUrgent]
];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.situation) {
      return json({ ok: false, error: 'Missing required fields' });
    }

    const sheet = getSheet();
    sheet.appendRow(COLUMNS.map(([, get]) => get(payload) || ''));

    notify(payload, sheet);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/**
 * Emails the firm about a new inquiry. Wrapped in its own try/catch so a mail
 * failure can never lose a row that was already written.
 */
function notify(r, sheet) {
  try {
    const name = r.firstName + ' ' + r.lastName;
    const urgent = r.isUrgent === 'Yes';
    const subject = (urgent ? '[URGENT] ' : '') + 'New intake: ' + name;

    const lines = [
      'Name: ' + name,
      'Email: ' + r.email,
      'Phone: ' + (r.phone || '—'),
      'Preferred contact: ' + r.preferredContact + ' (' + r.bestTime + ')',
      '',
      'Urgency: ' + r.urgency,
      'Has attorney: ' + r.hasAttorney,
      'Deadline: ' + (r.hasDeadline === 'yes'
        ? (r.deadlineDate || 'date not given') + ' — ' + (r.deadlineType || 'type not given')
        : r.hasDeadline),
      'Referral: ' + (r.referral || '—'),
      '',
      'Situation:',
      r.situation,
      '',
      'Sheet: ' + sheet.getParent().getUrl()
    ];

    MailApp.sendEmail({
      to: NOTIFY,
      replyTo: r.email,
      subject: subject,
      body: lines.join('\n')
    });
  } catch (err) {
    console.error('Notification failed: ' + err);
  }
}

/**
 * Run this manually from the editor to verify email delivery.
 * Sends one notification with dummy data. Writes nothing to the sheet.
 */
function testNotify() {
  notify({
    firstName: 'Test', lastName: 'Submission',
    email: 'test@example.com', phone: '(212) 555-0100',
    preferredContact: 'email', bestTime: 'morning',
    situation: 'This is a test of the intake notification email.',
    hasAttorney: 'no', urgency: 'soon',
    hasDeadline: 'no', deadlineDate: '', deadlineType: '',
    referral: 'Other', isUrgent: 'No'
  }, getSheet());
  console.log('Sent to ' + NOTIFY + '. Remaining quota today: ' + MailApp.getRemainingDailyQuota());
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(([label]) => label));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
  }
  return sheet;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
