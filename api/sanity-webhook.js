/**
 * Sanity → Vercel publish hook.
 *
 * Sanity POSTs here whenever the website content document is published. This
 * function checks the shared secret, then asks Vercel to rebuild, which reruns
 * scripts/build.js and bakes the new copy into index.html.
 *
 * The request body is deliberately ignored. Nothing from the payload is
 * trusted or used — it is only a signal to go and re-read the content from
 * Sanity directly.
 *
 * Environment variables (set in Vercel → Settings → Environment Variables):
 *   SANITY_WEBHOOK_SECRET   the same value entered in the Sanity webhook
 *   VERCEL_DEPLOY_HOOK_URL  the deploy hook URL from Vercel → Settings → Git
 */

const crypto = require('crypto');

/** Constant-time compare that does not leak length through early return. */
function secretMatches(provided, expected) {
  const a = crypto.createHash('sha256').update(String(provided)).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error: 'Method not allowed'});
  }

  const secret = process.env.SANITY_WEBHOOK_SECRET;
  const deployHook = process.env.VERCEL_DEPLOY_HOOK_URL;

  if (!secret || !deployHook) {
    console.error('Webhook not configured: missing SANITY_WEBHOOK_SECRET or VERCEL_DEPLOY_HOOK_URL');
    return res.status(500).json({error: 'Webhook not configured'});
  }

  const provided = req.headers['x-webhook-secret'];
  if (!provided || !secretMatches(provided, secret)) {
    // Deliberately vague — do not help a caller probe for the right value.
    return res.status(401).json({error: 'Unauthorized'});
  }

  try {
    const hook = await fetch(deployHook, {method: 'POST'});
    if (!hook.ok) throw new Error(`Vercel responded ${hook.status}`);
    console.log('Rebuild triggered by Sanity publish');
    return res.status(202).json({triggered: true});
  } catch (err) {
    console.error('Could not trigger rebuild:', err.message);
    return res.status(502).json({error: 'Could not trigger rebuild'});
  }
};
