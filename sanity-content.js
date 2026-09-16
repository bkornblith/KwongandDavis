/**
 * Davis & Kwong LLP — live content refresh
 *
 * The deployed HTML already carries the published copy: scripts/build.js bakes
 * it in during the Vercel build, which a Sanity webhook triggers on every
 * publish. This script is the gap-closer — it re-fetches on page load so a
 * visitor who arrives during the ~1 minute a rebuild takes still sees the new
 * copy.
 *
 * Every failure path is a no-op: the baked-in copy is already on screen.
 */
(function () {
  'use strict';

  var PROJECT_ID = 'a11lv153';
  var DATASET = 'production';
  var API_VERSION = 'v2024-01-01';

  if (!window.DKContent || !window.fetch) return;

  var url = 'https://' + PROJECT_ID + '.apicdn.sanity.io/' + API_VERSION +
    '/data/query/' + DATASET + '?query=' + encodeURIComponent(window.DKContent.GROQ);

  fetch(url)
    .then(function (r) { return r.ok ? r.json() : Promise.reject('HTTP ' + r.status); })
    .then(function (json) {
      if (!json || !json.result) return;
      window.DKContent.applyContent(document, json.result, {
        projectId: PROJECT_ID,
        dataset: DATASET,
        warn: function (name, err) { console.warn('[sanity] ' + name, err); }
      });
    })
    .catch(function (err) {
      // Expected when the dataset or origin is not browser-readable. The
      // build-time bake is the primary path, so this is not a failure.
      console.info('[sanity] live refresh skipped, using deployed copy:', err);
    });
})();
