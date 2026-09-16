/**
 * Davis & Kwong LLP — content application
 *
 * Shared by two callers:
 *   - the browser (sanity-content.js), applying a live fetch to the page
 *   - the build step (scripts/build.js), baking content into index.html
 *     before deploy
 *
 * So it must not touch anything outside the document it is handed: no
 * `document` global, no `createElement`. Everything is built as HTML strings
 * and assigned to a container's innerHTML.
 */
(function (root) {
  'use strict';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function has(v) { return v !== undefined && v !== null && v !== ''; }

  /**
   * Editors mark an italic phrase with *asterisks*; the design renders it in
   * the accent serif italic. Everything else is escaped, so copy can never be
   * a markup injection route.
   */
  function rich(str) {
    return esc(str).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
  }

  /** Builds a CDN image URL from a Sanity asset reference. */
  function imgUrl(photo, projectId, dataset, w, h) {
    var ref = photo && (photo.ref || (photo.asset && photo.asset._ref));
    if (!ref) return null;
    var parts = ref.split('-');              // image-<id>-<w>x<h>-<ext>
    if (parts.length < 4) return null;
    var url = 'https://cdn.sanity.io/images/' + projectId + '/' + dataset + '/' +
      parts[1] + '-' + parts[2] + '.' + parts[3] +
      '?w=' + w + '&h=' + h + '&fit=crop&auto=format';
    var hs = photo.hotspot;
    if (hs && typeof hs.x === 'number') {
      url += '&crop=focalpoint&fp-x=' + hs.x + '&fp-y=' + hs.y;
    }
    return url;
  }

  function applyContent(doc, data, opts) {
    if (!doc || !data) return;
    opts = opts || {};
    var projectId = opts.projectId || 'a11lv153';
    var dataset = opts.dataset || 'production';
    var warn = opts.warn || function () {};

    function q(sel) { return doc.querySelector(sel); }
    function qa(sel) {
      var found = doc.querySelectorAll(sel);
      return found ? Array.prototype.slice.call(found) : [];
    }
    function setText(sel, value) {
      var el = q(sel);
      if (el && has(value)) el.textContent = value;
    }
    function setRich(sel, value) {
      var el = q(sel);
      if (el && has(value)) el.innerHTML = rich(value);
    }
    function setHtml(sel, html) {
      var el = q(sel);
      if (el) el.innerHTML = html;
    }
    function section(name, fn) {
      try { fn(); } catch (e) { warn(name, e); }
    }

    // ── header & footer ────────────────────────────────────────────────────
    section('chrome', function () {
      setText('.nav-logo-text', data.firmName);
      setText('.nav-logo-mark', data.logoInitials);
      setText('.footer-disclaimer', data.footerDisclaimer);
      var logos = qa('.footer-logo');
      if (logos[0] && has(data.footerCopyright)) logos[0].textContent = data.footerCopyright;
      if (logos[1] && has(data.footerLocation)) logos[1].textContent = data.footerLocation;
      if (has(data.pageTitle)) {
        var t = q('title');
        if (t) t.textContent = data.pageTitle;
      }
    });

    // ── hero ───────────────────────────────────────────────────────────────
    section('hero', function () {
      var d = data.hero;
      if (!d) return;
      setText('.hero-eyebrow', d.eyebrow);
      setRich('.hero-headline', d.headline);
      setText('.hero-sub', d.intro);
      if (Array.isArray(d.helpWith) && d.helpWith.length) {
        setHtml('.hero-card',
          '<div class="hero-card-label">' + esc(d.listLabel || 'We can help with') + '</div>' +
          d.helpWith.map(function (item) {
            return '<div class="hero-card-item"><div class="hero-card-dot"></div>' +
              '<div class="hero-card-item-text">' + esc(item) + '</div></div>';
          }).join(''));
      } else {
        setText('.hero-card-label', d.listLabel);
      }
    });

    // ── about ──────────────────────────────────────────────────────────────
    section('about', function () {
      var d = data.about;
      if (!d) return;
      var col = q('[data-col="about-main"]');
      if (!col) return;

      var paras = (d.paragraphs || []).map(function (text, i) {
        return '<p class="section-body"' + (i ? ' style="margin-top:1.25rem;"' : '') + '>' +
          esc(text) + '</p>';
      }).join('');

      var badges = (d.badges || []).map(function (b) {
        return '<div class="flag-pill"><span class="flag-dot"></span> ' + esc(b) + '</div>';
      }).join('');

      var stats = (d.stats || []).map(function (s) {
        return '<div class="about-stat"><div class="about-stat-num">' + esc(s.value) +
          '</div><div class="about-stat-label">' + esc(s.label) + '</div></div>';
      }).join('');

      col.innerHTML =
        '<div class="section-eyebrow">' + esc(d.eyebrow || '') + '</div>' +
        '<h2 class="section-title">' + rich(d.title || '') + '</h2>' +
        '<div class="divider"></div>' +
        paras +
        (badges ? '<div class="about-flags">' + badges + '</div>' : '') +
        (stats ? '<div class="about-stats">' + stats + '</div>' : '');

      if (d.quote) {
        setText('.about-quote-text', d.quote.text);
        setText('.about-quote-source', d.quote.attribution);
      }
    });

    // ── practice areas ─────────────────────────────────────────────────────
    section('practice', function () {
      var d = data.practice;
      if (!d) return;
      setText('#practice .section-eyebrow', d.eyebrow);
      setRich('#practice .section-title', d.title);
      setText('#practice .practice-header .section-body', d.intro);
      if (Array.isArray(d.areas) && d.areas.length) {
        setHtml('.practice-grid', d.areas.map(function (a) {
          return '<div class="practice-card">' +
            '<div class="practice-icon">' + esc(a.icon) + '</div>' +
            '<div class="practice-card-title">' + esc(a.title) + '</div>' +
            '<p class="practice-card-body">' + esc(a.body) + '</p>' +
            '</div>';
        }).join(''));
      }
    });

    // ── attorneys ──────────────────────────────────────────────────────────
    section('team', function () {
      var d = data.team;
      if (!d) return;
      setText('#team .section-eyebrow', d.eyebrow);
      setRich('#team .section-title', d.title);
      if (!Array.isArray(d.partners) || !d.partners.length) return;

      setHtml('.team-grid', d.partners.map(function (p) {
        var initials = String(p.name || '').split(/\s+/).map(function (w) {
          return w.charAt(0);
        }).join('').slice(0, 2).toUpperCase();

        var photo = imgUrl(p.photo, projectId, dataset, 700, 700);
        var photoInner = photo
          ? '<img class="bio-photo-img" src="' + photo + '" alt="' + esc(p.name) + '">'
          : '<div class="bio-photo-initials">' + esc(initials) + '</div>';

        return '<div class="bio-card">' +
          '<div class="bio-photo' + (photo ? ' has-photo' : '') + '">' + photoInner +
            '<div class="bio-photo-accent"></div></div>' +
          '<div class="bio-body">' +
            '<div class="bio-name">' + esc(p.name) + '</div>' +
            '<div class="bio-title">' + esc(p.role) + '</div>' +
            (p.paragraphs || []).map(function (t) {
              return '<p class="bio-text">' + esc(t) + '</p>';
            }).join('') +
            '<div class="bio-tags">' + (p.tags || []).map(function (t) {
              return '<span class="bio-tag">' + esc(t) + '</span>';
            }).join('') + '</div>' +
            (has(p.email) ? '<a href="mailto:' + esc(p.email) + '" class="bio-email">' +
              esc(p.email) + '</a>' : '') +
          '</div>' +
        '</div>';
      }).join(''));
    });

    // ── intake call-to-action ──────────────────────────────────────────────
    section('intakeCta', function () {
      var d = data.intakeCta;
      if (!d) return;
      setText('#intake .section-eyebrow', d.eyebrow);
      setRich('#intake .section-title', d.title);
      setText('#intake .section-body', d.body);
      setText('#intake .btn-primary', d.buttonLabel);
    });

    // ── contact ────────────────────────────────────────────────────────────
    section('contact', function () {
      var d = data.contact;
      if (!d) return;
      setText('#contact .section-eyebrow', d.eyebrow);
      setRich('#contact .section-title', d.title);
      setText('#contact .section-body', d.intro);

      var col = q('[data-col="contact-info"]');
      if (!col) return;

      var emails = (d.emails || []).filter(function (r) {
        return has(r.email) || has(r.label);
      }).map(function (r) {
        return '<div class="contact-info-item" data-contact-row="email">' +
          '<div class="contact-info-label">' + esc(r.label) + '</div>' +
          '<div class="contact-info-value"><a href="mailto:' + esc(r.email) + '">' +
          esc(r.email) + '</a></div></div>';
      }).join('');

      var location = '<div class="contact-info-item" data-contact-row="location">' +
        '<div class="contact-info-label">' + esc(d.locationLabel || 'Location') + '</div>' +
        '<div class="contact-info-value">' + esc(d.location || '') +
        (has(d.locationNote)
          ? '<br><span style="font-size:13px;color:var(--text-light)">' +
            esc(d.locationNote) + '</span>'
          : '') +
        '</div></div>';

      var cta = '<div class="contact-info-item" data-contact-row="cta">' +
        '<div class="contact-info-label">Begin Your Matter</div>' +
        '<div class="contact-info-value">' +
        '<button class="btn-primary" onclick="openIntake()" style="margin-top:0.5rem">' +
        esc(d.ctaLabel || 'Complete Intake Form') + '</button></div></div>';

      col.innerHTML = emails + location + cta;
    });

    // ── intake form wording ────────────────────────────────────────────────
    section('intakeForm', function () {
      var d = data.intakeForm;
      if (!d) return;
      setText('.modal-header-label', d.eyebrow);
      setText('.modal-header h2', d.heading);
      (d.stepLabels || []).forEach(function (label, i) {
        setText('#ml' + (i + 1), label);
      });
      if (has(d.consentText)) {
        var box = q('.m-consent-box');
        if (box) {
          var strong = box.querySelector('strong');
          var heading = strong ? strong.textContent : 'No attorney-client relationship';
          box.innerHTML = '<strong>' + esc(heading) + '</strong><br>' + esc(d.consentText);
        }
      }
      if (d.success) {
        setText('.m-success-title', d.success.title);
        setText('.m-success-sub', d.success.body);
      }
    });
  }

  var api = {applyContent: applyContent, GROQ: '*[_type=="site"][0]'};

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DKContent = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
