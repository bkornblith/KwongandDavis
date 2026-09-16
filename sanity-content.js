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

  if (!window.DKContent || !window.fetch) return;

  // apicdn is edge-cached but purged on publish, so it is both fast and current.
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
      console.warn('[sanity] content fetch failed, using built-in copy:', err);
    });
})();
