/**
 * Davis & Kwong LLP — Sanity content
 *
 * Fetches the published content on every page load and applies it, so an
 * editor's change appears the moment they press Publish. No build, no deploy.
 *
 * The HTML ships with the current copy baked in, which is what renders first
 * and what search engines read. This then overwrites it. If Sanity is
 * unreachable the baked copy simply stays — nothing here can leave the page
 * blank.
 *
 * Requires, in sanity.io/manage → API:
 *   - dataset `production` set to Public
 *   - `https://davisandkwong.com` listed under CORS origins (credentials off)
 */
(function () {
  'use strict';

  var PROJECT_ID = 'a11lv153';
  var DATASET = 'production';
  var API_VERSION = 'v2024-01-01';

  if (!window.fetch) return;
  if (!window.DKContent) {
    console.warn('[sanity] content-apply.js did not load — the page is showing ' +
      'its built-in copy. Check that content-apply.js is deployed alongside index.html.');
    return;
  }

  // The uncached endpoint, not apicdn: apicdn is edge-cached and can serve a
  // stale response for a minute or so after publishing, which defeats the
  // point of refreshing live. A little slower, always current.
  var url = 'https://' + PROJECT_ID + '.api.sanity.io/' + API_VERSION +
    '/data/query/' + DATASET + '?query=' + encodeURIComponent(window.DKContent.GROQ);

  fetch(url, {cache: 'no-store'})
    .then(function (r) { return r.ok ? r.json() : Promise.reject('HTTP ' + r.status); })
    .then(function (json) {
      if (!json || !json.result) return;
      window.DKContent.applyContent(document, json.result, {
        projectId: PROJECT_ID,
        dataset: DATASET,
        warn: function (name, err) { console.warn('[sanity] ' + name, err); }
      });
      console.info('[sanity] content applied, revision ' + json.result._rev);
    })
    .catch(function (err) {
      console.warn('[sanity] content fetch failed, using built-in copy:', err);
    });
})();
