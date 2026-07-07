/* ============================================================
   ITD RESTORATION — Cookie consent management
   Storage: localStorage "itd_cookie_consent_v1"
     {necessary:true, functional:boolean, analytics:boolean,
      timestamp:ISO, version:1}
   - Google Consent Mode defaults: everything optional DENIED.
   - Functional consent gates third-party embeds (the Google Maps
     iframe uses data-consent-src and only loads after opt-in).
   - Analytics consent gates GA. No GA property is configured today
     (GA_ID empty = nothing ever loads); if one is added later it
     activates only after opt-in.
   - Footer "Cookie preferences" button (data-open-cookie-preferences)
     reopens the banner at any time.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'itd_cookie_consent_v1';
  var GA_ID = ''; // no analytics property configured — leave empty until the client wants GA
  var gaLoaded = false;
  var banner = null;

  /* ---- Consent Mode defaults: denied until granted ---- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  function readConsent() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      if (!v || typeof v !== 'object' || typeof v.functional !== 'boolean' || typeof v.analytics !== 'boolean') return null;
      if (typeof v.version === 'number' && v.version !== 1) return null;
      return { necessary: true, functional: v.functional, analytics: v.analytics, timestamp: v.timestamp, version: 1 };
    } catch (_) { return null; }
  }

  function writeConsent(functional, analytics) {
    var consent = { necessary: true, functional: functional, analytics: analytics, timestamp: new Date().toISOString(), version: 1 };
    try { window.localStorage.setItem(KEY, JSON.stringify(consent)); } catch (_) {}
    applyConsent(consent);
    return consent;
  }

  function applyConsent(consent) {
    /* Functional: load consent-gated embeds (Google Maps) */
    if (consent.functional) {
      document.querySelectorAll('iframe[data-consent-src]').forEach(function (f) {
        if (!f.src) f.src = f.getAttribute('data-consent-src');
        f.style.display = '';
      });
      document.querySelectorAll('[data-consent-placeholder]').forEach(function (p) { p.remove(); });
    }
    /* Analytics: Consent Mode update + GA loader (inactive while GA_ID is empty) */
    gtag('consent', 'update', { analytics_storage: consent.analytics ? 'granted' : 'denied' });
    if (consent.analytics && GA_ID && !gaLoaded) {
      gaLoaded = true;
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(s);
      gtag('js', new Date());
      gtag('config', GA_ID, { anonymize_ip: true });
    }
  }

  /* ---- placeholder shown where gated embeds live until opt-in ---- */
  function installEmbedPlaceholders() {
    document.querySelectorAll('iframe[data-consent-src]').forEach(function (f) {
      f.style.display = 'none';
      var p = document.createElement('div');
      p.setAttribute('data-consent-placeholder', '');
      p.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75rem;height:100%;min-height:280px;padding:2rem;text-align:center;background:#EBF1F8;color:#3D5166;font-size:.9rem;line-height:1.6;';
      p.innerHTML = '<strong style="color:#0D1B2A;">Map blocked until you allow it</strong>' +
        '<span>This map is embedded from Google Maps, which may set cookies. Allow "Maps &amp; embeds" in cookie preferences to view it.</span>' +
        '<button type="button" data-open-cookie-preferences style="border:0;border-radius:999px;background:#0D1B2A;color:#fff;padding:.6rem 1.2rem;font-size:.85rem;font-weight:600;cursor:pointer;">Cookie preferences</button>';
      f.parentNode.insertBefore(p, f);
    });
  }

  /* ---- banner UI ---- */
  var CSS =
    '#itd-consent{position:fixed;inset-inline:0;bottom:0;z-index:950;padding:1rem;font-family:\'Inter\',Arial,sans-serif;}' +
    '#itd-consent[hidden]{display:none;}' +
    '.itd-consent-card{max-width:64rem;margin-inline:auto;background:#fff;border:1px solid #D8E1EB;border-top:3px solid #0A7EA4;border-radius:16px;box-shadow:0 12px 40px rgba(13,27,42,.25);padding:1.5rem;}' +
    '.itd-consent-eyebrow{font-size:.7rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#0A7EA4;}' +
    '.itd-consent-card p{font-size:.9rem;line-height:1.65;color:#3D5166;margin:.5rem 0 0;}' +
    '.itd-consent-card a{color:#0A7EA4;text-decoration:underline;text-underline-offset:3px;}' +
    '.itd-consent-actions{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1.1rem;}' +
    '.itd-consent-btn{border:0;border-radius:999px;padding:.65rem 1.3rem;font-size:.82rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;font-family:inherit;}' +
    '.itd-consent-btn--primary{background:#0D1B2A;color:#fff;}' +
    '.itd-consent-btn--primary:hover{background:#0A7EA4;}' +
    '.itd-consent-btn--secondary{background:#fff;color:#1E3A5F;border:1px solid #D8E1EB;}' +
    '.itd-consent-btn--secondary:hover{border-color:#0A7EA4;color:#0A7EA4;}' +
    '.itd-consent-btn--ghost{background:transparent;color:#3D5166;}' +
    '.itd-consent-btn--ghost:hover{background:#EBF1F8;}' +
    '.itd-consent-btn:focus-visible{outline:3px solid #C5902F;outline-offset:2px;}' +
    '.itd-consent-cat{display:flex;align-items:flex-start;gap:.75rem;border:1px solid #D8E1EB;border-radius:8px;padding:.85rem 1rem;margin-top:.6rem;background:#fff;cursor:pointer;}' +
    '.itd-consent-cat--locked{background:#F5F7FA;cursor:default;}' +
    '.itd-consent-cat input{margin-top:.2rem;width:1rem;height:1rem;accent-color:#0A7EA4;}' +
    '.itd-consent-cat .t{font-size:.85rem;font-weight:600;color:#0D1B2A;display:block;}' +
    '.itd-consent-cat .d{font-size:.75rem;color:#6B7C93;display:block;margin-top:.15rem;line-height:1.5;}';

  function catHtml(name, label, desc, checked, locked) {
    return '<label class="itd-consent-cat' + (locked ? ' itd-consent-cat--locked' : '') + '">' +
      '<input type="checkbox"' + (locked ? ' checked disabled' : (checked ? ' checked' : '')) + (locked ? '' : ' data-consent-cat="' + name + '"') + '>' +
      '<span><span class="t">' + label + '</span><span class="d">' + desc + '</span></span></label>';
  }

  function bannerHtml(customize) {
    var existing = readConsent() || { functional: false, analytics: false };
    var intro =
      '<span class="itd-consent-eyebrow">Cookie settings</span>' +
      '<p>We use necessary cookies to keep this site working and remember your preferences. With your permission, we also load the Google Maps service-area embed (Google may set cookies) and, if ever enabled, anonymous analytics. See our ' +
      '<a href="/pages/cookie-policy.html">Cookie Policy</a> and <a href="/pages/privacy-policy.html">Privacy Policy</a>.</p>';
    var body;
    if (!customize) {
      body = '<div class="itd-consent-actions">' +
        '<button type="button" class="itd-consent-btn itd-consent-btn--primary" data-consent="accept">Accept all</button>' +
        '<button type="button" class="itd-consent-btn itd-consent-btn--secondary" data-consent="reject">Reject optional</button>' +
        '<button type="button" class="itd-consent-btn itd-consent-btn--ghost" data-consent="customize">Customize</button>' +
        '</div>';
    } else {
      body =
        catHtml('necessary', 'Necessary', 'Required for security, navigation, and remembering your cookie and accessibility choices. Always on.', true, true) +
        catHtml('functional', 'Maps &amp; embeds', 'Loads the Google Maps service-area map. Google may set cookies through this embed.', existing.functional, false) +
        catHtml('analytics', 'Analytics', 'Anonymous usage statistics. Not currently active on this site; your choice applies if analytics are ever added.', existing.analytics, false) +
        '<div class="itd-consent-actions">' +
        '<button type="button" class="itd-consent-btn itd-consent-btn--primary" data-consent="save">Save preferences</button>' +
        '<button type="button" class="itd-consent-btn itd-consent-btn--ghost" data-consent="cancel">Cancel</button>' +
        '</div>';
    }
    return '<div class="itd-consent-card">' + intro + body + '</div>';
  }

  function showBanner(customize) {
    if (!banner) {
      banner = document.createElement('section');
      banner.id = 'itd-consent';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-live', 'polite');
      banner.setAttribute('aria-label', 'Cookie preferences');
      document.body.appendChild(banner);
      banner.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-consent]');
        if (!btn) return;
        var action = btn.getAttribute('data-consent');
        if (action === 'accept') { writeConsent(true, true); hideBanner(); }
        else if (action === 'reject') { writeConsent(false, false); hideBanner(); }
        else if (action === 'customize') { banner.innerHTML = bannerHtml(true); }
        else if (action === 'save') {
          var f = banner.querySelector('[data-consent-cat="functional"]');
          var a = banner.querySelector('[data-consent-cat="analytics"]');
          writeConsent(!!(f && f.checked), !!(a && a.checked));
          hideBanner();
        }
        else if (action === 'cancel') { readConsent() ? hideBanner() : banner.innerHTML = bannerHtml(false); }
      });
    }
    banner.innerHTML = bannerHtml(!!customize);
    banner.hidden = false;
  }

  function hideBanner() { if (banner) banner.hidden = true; }

  function init() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    installEmbedPlaceholders();

    var consent = readConsent();
    if (consent) applyConsent(consent);
    else showBanner(false);

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-open-cookie-preferences]')) showBanner(true);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && banner && !banner.hidden && readConsent()) hideBanner();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
