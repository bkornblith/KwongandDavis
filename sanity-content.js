/**
 * Davis & Kwong LLP — Sanity content hydration
 *
 * The HTML ships with the current copy baked in, so the page is fast and
 * fully indexable with no JavaScript. This script then fetches the published
 * content from Sanity and swaps it in, so an editor's change appears on the
 * live site immediately without a redeploy.
 *
 * If Sanity is unreachable, or a field is empty, the baked-in copy stays.
 * Nothing here can leave the page blank.
 */
(function () {
  'use strict';

  var SANITY = {
    projectId: 'a11lv153',
    dataset: 'production',
    apiVersion: 'v2024-01-01'
  };

  var QUERY = '*[_type=="site"][0]';

  // ── helpers ──────────────────────────────────────────────────────────────

  function q(sel) { return document.querySelector(sel); }
  function qa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function has(v) { return v !== undefined && v !== null && v !== ''; }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * Editors mark an italic phrase with *asterisks*; the design renders it in
   * the accent serif italic. Everything else is escaped, so copy is never a
   * markup injection route.
   */
  function rich(str) {
    return esc(str).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
  }

  function setText(sel, value) {
    var el = q(sel);
    if (el && has(value)) el.textContent = value;
  }

  function setRich(sel, value) {
    var el = q(sel);
    if (el && has(value)) el.innerHTML = rich(value);
  }

  /** Builds a CDN image URL from a Sanity asset reference. */
  function imgUrl(asset, w, h) {
    if (!asset || !asset.ref) return null;
    var parts = asset.ref.split('-');            // image-<id>-<w>x<h>-<ext>
    if (parts.length < 4) return null;
    var url = 'https://cdn.sanity.io/images/' + SANITY.projectId + '/' +
      SANITY.dataset + '/' + parts[1] + '-' + parts[2] + '.' + parts[3] +
      '?w=' + w + '&h=' + h + '&fit=crop&auto=format';
    if (asset.hotspot) {
      url += '&crop=focalpoint&fp-x=' + asset.hotspot.x + '&fp-y=' + asset.hotspot.y;
    }
    return url;
  }

  // ── section appliers ─────────────────────────────────────────────────────

  function applyHero(d) {
    if (!d) return;
    setText('.hero-eyebrow', d.eyebrow);
    setRich('.hero-headline', d.headline);
    setText('.hero-sub', d.intro);
    setText('.hero-card-label', d.listLabel);
    if (Array.isArray(d.helpWith) && d.helpWith.length) {
      var card = q('.hero-card');
      var label = q('.hero-card-label');
      if (!card || !label) return;
      card.innerHTML = '';
      card.appendChild(label);
      d.helpWith.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'hero-card-item';
        row.innerHTML = '<div class="hero-card-dot"></div>' +
          '<div class="hero-card-item-text">' + esc(item) + '</div>';
        card.appendChild(row);
      });
    }
  }

  function applyAbout(d) {
    if (!d) return;
    setText('#about .section-eyebrow', d.eyebrow);
    setRich('#about .section-title', d.title);

    if (Array.isArray(d.paragraphs) && d.paragraphs.length) {
      var paras = qa('#about > div:first-child > .section-body');
      // Reuse the existing nodes so their inline spacing survives; append if
      // the editor added a third paragraph.
      d.paragraphs.forEach(function (text, i) {
        if (paras[i]) { paras[i].textContent = text; return; }
        var p = document.createElement('p');
        p.className = 'section-body';
        p.style.marginTop = '1.25rem';
        p.textContent = text;
        paras[paras.length - 1].parentNode.insertBefore(p, q('.about-flags'));
      });
      paras.slice(d.paragraphs.length).forEach(function (el) { el.remove(); });
    }

    if (Array.isArray(d.badges) && d.badges.length) {
      var flags = q('.about-flags');
      if (flags) {
        flags.innerHTML = d.badges.map(function (b) {
          return '<div class="flag-pill"><span class="flag-dot"></span> ' + esc(b) + '</div>';
        }).join('');
      }
    }

    if (Array.isArray(d.stats) && d.stats.length) {
      var wrap = q('.about-stats');
      if (wrap) {
        wrap.innerHTML = d.stats.map(function (s) {
          return '<div class="about-stat"><div class="about-stat-num">' +
            esc(s.value) + '</div><div class="about-stat-label">' +
            esc(s.label) + '</div></div>';
        }).join('');
      }
    }

    if (d.quote) {
      setText('.about-quote-text', d.quote.text);
      setText('.about-quote-source', d.quote.attribution);
    }
  }

  function applyPractice(d) {
    if (!d) return;
    setText('#practice .section-eyebrow', d.eyebrow);
    setRich('#practice .section-title', d.title);
    setText('#practice .practice-header .section-body', d.intro);

    if (Array.isArray(d.areas) && d.areas.length) {
      var grid = q('.practice-grid');
      if (grid) {
        grid.innerHTML = d.areas.map(function (a) {
          return '<div class="practice-card">' +
            '<div class="practice-icon">' + esc(a.icon || '') + '</div>' +
            '<div class="practice-card-title">' + esc(a.title || '') + '</div>' +
            '<p class="practice-card-body">' + esc(a.body || '') + '</p>' +
            '</div>';
        }).join('');
      }
    }
  }

  function applyTeam(d) {
    if (!d) return;
    setText('#team .section-eyebrow', d.eyebrow);
    setRich('#team .section-title', d.title);

    if (!Array.isArray(d.partners) || !d.partners.length) return;
    var grid = q('.team-grid');
    if (!grid) return;

    grid.innerHTML = d.partners.map(function (p) {
      var initials = (p.name || '').split(/\s+/).map(function (w) { return w[0] || ''; })
        .join('').slice(0, 2).toUpperCase();
      var photo = imgUrl(p.photo, 700, 700);
      var photoHtml = photo
        ? '<img class="bio-photo-img" src="' + photo + '" alt="' + esc(p.name || '') + '">'
        : '<div class="bio-photo-initials">' + esc(initials) + '</div>';

      var paras = (p.paragraphs || []).map(function (t) {
        return '<p class="bio-text">' + esc(t) + '</p>';
      }).join('');

      var tags = (p.tags || []).map(function (t) {
        return '<span class="bio-tag">' + esc(t) + '</span>';
      }).join('');

      return '<div class="bio-card">' +
        '<div class="bio-photo' + (photo ? ' has-photo' : '') + '">' + photoHtml +
          '<div class="bio-photo-accent"></div>' +
        '</div>' +
        '<div class="bio-body">' +
          '<div class="bio-name">' + esc(p.name || '') + '</div>' +
          '<div class="bio-title">' + esc(p.role || '') + '</div>' +
          paras +
          '<div class="bio-tags">' + tags + '</div>' +
          (p.email ? '<a href="mailto:' + esc(p.email) + '" class="bio-email">' +
            esc(p.email) + '</a>' : '') +
        '</div>' +
      '</div>';
    }).join('');
  }

  function applyIntakeCta(d) {
    if (!d) return;
    setText('#intake .section-eyebrow', d.eyebrow);
    setRich('#intake .section-title', d.title);
    setText('#intake .section-body', d.body);
    setText('#intake .btn-primary', d.buttonLabel);
  }

  function applyContact(d) {
    if (!d) return;
    setText('#contact .section-eyebrow', d.eyebrow);
    setRich('#contact .section-title', d.title);
    setText('#contact .section-body', d.intro);

    if (Array.isArray(d.emails) && d.emails.length) {
      // Rendered as a real list rather than mapped onto the two baked rows, so
      // adding a third contact in the Studio actually appears on the page.
      var existing = qa('#contact [data-contact-row="email"]');
      var anchor = q('#contact [data-contact-row="location"]');
      if (existing.length && anchor) {
        existing.forEach(function (el) { el.remove(); });
        d.emails.forEach(function (row) {
          if (!has(row.email) && !has(row.label)) return;
          var item = document.createElement('div');
          item.className = 'contact-info-item';
          item.setAttribute('data-contact-row', 'email');
          item.innerHTML = '<div class="contact-info-label">' + esc(row.label || '') + '</div>' +
            '<div class="contact-info-value"><a href="mailto:' + esc(row.email || '') + '">' +
            esc(row.email || '') + '</a></div>';
          anchor.parentNode.insertBefore(item, anchor);
        });
      }
    }

    if (has(d.locationLabel) || has(d.location) || has(d.locationNote)) {
      var locItem = q('#contact [data-contact-row="location"]');
      if (locItem) {
        var l = locItem.querySelector('.contact-info-label');
        var v = locItem.querySelector('.contact-info-value');
        if (l && has(d.locationLabel)) l.textContent = d.locationLabel;
        if (v && has(d.location)) {
          v.innerHTML = esc(d.location) + (has(d.locationNote)
            ? '<br><span style="font-size:13px;color:var(--text-light)">' + esc(d.locationNote) + '</span>'
            : '');
        }
      }
    }

    if (has(d.ctaLabel)) {
      var btn = q('#contact .btn-primary');
      if (btn) btn.textContent = d.ctaLabel;
    }
  }

  function applyChrome(d) {
    if (!d) return;
    setText('.nav-logo-text', d.firmName);
    if (has(d.logoInitials)) setText('.nav-logo-mark', d.logoInitials);
    var logos = qa('.footer-logo');
    if (logos[0] && has(d.footerCopyright)) logos[0].textContent = d.footerCopyright;
    if (logos[1] && has(d.footerLocation)) logos[1].textContent = d.footerLocation;
    setText('.footer-disclaimer', d.footerDisclaimer);
    if (has(d.pageTitle)) document.title = d.pageTitle;
  }

  function applyIntakeForm(d) {
    if (!d) return;
    setText('.modal-header-label', d.eyebrow);
    setText('.modal-header h2', d.heading);
    if (Array.isArray(d.stepLabels)) {
      d.stepLabels.forEach(function (label, i) {
        setText('#ml' + (i + 1), label);
      });
    }
    if (has(d.consentText)) {
      var box = q('.m-consent-box');
      if (box) {
        var strong = box.querySelector('strong');
        box.innerHTML = '<strong>' + esc(strong ? strong.textContent : 'Please note') +
          '</strong><br>' + esc(d.consentText);
      }
    }
    if (d.success) {
      setText('.m-success-title', d.success.title);
      setText('.m-success-sub', d.success.body);
    }
  }

  // ── fetch & apply ────────────────────────────────────────────────────────

  function apply(doc) {
    if (!doc) return;
    try { applyChrome(doc); } catch (e) { console.warn('[sanity] chrome', e); }
    try { applyHero(doc.hero); } catch (e) { console.warn('[sanity] hero', e); }
    try { applyAbout(doc.about); } catch (e) { console.warn('[sanity] about', e); }
    try { applyPractice(doc.practice); } catch (e) { console.warn('[sanity] practice', e); }
    try { applyTeam(doc.team); } catch (e) { console.warn('[sanity] team', e); }
    try { applyIntakeCta(doc.intakeCta); } catch (e) { console.warn('[sanity] intakeCta', e); }
    try { applyContact(doc.contact); } catch (e) { console.warn('[sanity] contact', e); }
    try { applyIntakeForm(doc.intakeForm); } catch (e) { console.warn('[sanity] intakeForm', e); }
  }

  var url = 'https://' + SANITY.projectId + '.apicdn.sanity.io/' + SANITY.apiVersion +
    '/data/query/' + SANITY.dataset + '?query=' + encodeURIComponent(QUERY);

  fetch(url)
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (json) { apply(json && json.result); })
    .catch(function (err) {
      // Baked-in copy is already on screen — nothing to do but note it.
      console.warn('[sanity] content fetch failed, using built-in copy:', err);
    });
})();
