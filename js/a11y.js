/* ============================================================
   ITD RESTORATION — Accessibility Widget
   Persistent settings: localStorage "itd-accessibility-settings"
   {textScale(100|110|120), highContrast, underlineLinks,
    reducedMotion, readableFont, bigCursor, hideImages, readingGuide}
   Keyboard operable: Escape closes, focus returns to trigger,
   aria-expanded on trigger, role=switch on toggles.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'itd-accessibility-settings';
  var DEFAULTS = {
    textScale: 100,
    highContrast: false,
    underlineLinks: false,
    reducedMotion: false,
    readableFont: false,
    bigCursor: false,
    hideImages: false,
    readingGuide: false
  };
  var SCALES = [100, 110, 120];

  var settings = load();
  var open = false;
  var panel = null;
  var trigger = null;
  var guide = null;

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return Object.assign({}, DEFAULTS);
      return Object.assign({}, DEFAULTS, JSON.parse(raw));
    } catch (_) { return Object.assign({}, DEFAULTS); }
  }

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(settings)); } catch (_) {}
  }

  function apply() {
    var root = document.documentElement;
    root.style.fontSize = settings.textScale === 100 ? '' : settings.textScale + '%';
    root.classList.toggle('itd-a11y-contrast', settings.highContrast);
    root.classList.toggle('itd-a11y-links', settings.underlineLinks);
    root.classList.toggle('itd-a11y-motion', settings.reducedMotion);
    root.classList.toggle('itd-a11y-font', settings.readableFont);
    root.classList.toggle('itd-a11y-cursor', settings.bigCursor);
    root.classList.toggle('itd-a11y-noimg', settings.hideImages);
    root.classList.toggle('itd-a11y-guide', settings.readingGuide);
    if (settings.readingGuide) ensureGuide(); else removeGuide();
    save();
    if (panel && open) render();
  }

  /* Reading guide line that follows the pointer */
  function ensureGuide() {
    if (guide) return;
    guide = document.createElement('div');
    guide.id = 'itd-reading-guide';
    guide.setAttribute('aria-hidden', 'true');
    document.body.appendChild(guide);
    document.addEventListener('mousemove', moveGuide);
  }
  function moveGuide(e) { if (guide) guide.style.top = e.clientY + 'px'; }
  function removeGuide() {
    if (!guide) return;
    document.removeEventListener('mousemove', moveGuide);
    guide.remove();
    guide = null;
  }

  var CSS =
    /* setting effects */
    '.itd-a11y-contrast body{background:#fff;}' +
    '.itd-a11y-contrast body, .itd-a11y-contrast p, .itd-a11y-contrast li, .itd-a11y-contrast span:not(.hero__badge-dot), .itd-a11y-contrast td{color:#0b1622 !important;}' +
    '.itd-a11y-contrast .section--dark p, .itd-a11y-contrast .section--dark span, .itd-a11y-contrast .footer p, .itd-a11y-contrast .footer a, .itd-a11y-contrast .footer span, .itd-a11y-contrast .nav a, .itd-a11y-contrast .nav__dropdown-link, .itd-a11y-contrast .emergency-bar p, .itd-a11y-contrast .emergency-bar a, .itd-a11y-contrast .hero p, .itd-a11y-contrast .hero .hero__sub, .itd-a11y-contrast .cta-block p{color:#ffffff !important;}' +
    '.itd-a11y-links a{text-decoration:underline !important; text-underline-offset:3px;}' +
    '.itd-a11y-motion *, .itd-a11y-motion *::before, .itd-a11y-motion *::after{animation:none !important; transition:none !important; scroll-behavior:auto !important;}' +
    '.itd-a11y-motion [data-reveal]{opacity:1 !important; transform:none !important;}' +
    '.itd-a11y-font body, .itd-a11y-font body *:not(i):not(svg):not(path){font-family:Verdana, Arial, Helvetica, sans-serif !important; letter-spacing:.02em; word-spacing:.06em;}' +
    '.itd-a11y-cursor, .itd-a11y-cursor *{cursor:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\' viewBox=\'0 0 24 24\'><path d=\'M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.85a.5.5 0 0 0-.85.36Z\' fill=\'black\' stroke=\'white\' stroke-width=\'1.5\'/></svg>") 4 4, auto !important;}' +
    '.itd-a11y-noimg img, .itd-a11y-noimg video, .itd-a11y-noimg iframe, .itd-a11y-noimg [style*="background-image"]{visibility:hidden !important;}' +
    '#itd-reading-guide{position:fixed; left:0; right:0; height:0; border-top:4px solid #009BCD; box-shadow:0 0 0 2px rgba(255,255,255,.85); z-index:2147483646; pointer-events:none; margin-top:-2px;}' +
    /* widget UI */
    '#itd-a11y-trigger{position:fixed; bottom:1.5rem; left:1.5rem; z-index:900; width:3.5rem; height:3.5rem; border-radius:50%; border:0; background:#0C1015; color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 12px 40px rgba(13,27,42,.3); transition:transform .2s ease, background .2s ease;}' +
    '#itd-a11y-trigger:hover{background:#009BCD; transform:translateY(-2px);}' +
    '#itd-a11y-trigger:focus-visible{outline:3px solid #009BCD; outline-offset:3px;}' +
    '#itd-a11y-panel{position:fixed; bottom:5.75rem; left:1.5rem; z-index:901; width:min(21rem, calc(100vw - 3rem)); max-height:min(32rem, calc(100vh - 8rem)); overflow-y:auto; background:#fff; border-radius:16px; box-shadow:0 12px 40px rgba(13,27,42,.25); border:1px solid #CFE8F2; padding:1.5rem; font-family:\'Inter\', Arial, sans-serif;}' +
    '#itd-a11y-panel h2{font-family:\'Saira Condensed\', sans-serif; font-size:1.5rem; color:#0C1015; margin:0.25rem 0 0;}' +
    '.itd-a11y-eyebrow{font-size:.7rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#009BCD;}' +
    '.itd-a11y-close{width:2.25rem; height:2.25rem; border-radius:50%; border:0; background:#E3F3F9; color:#161D26; font-size:1.2rem; line-height:1; cursor:pointer;}' +
    '.itd-a11y-close:hover{background:#CFE8F2;}' +
    '.itd-a11y-close:focus-visible, .itd-a11y-row:focus-visible, .itd-a11y-scale:focus-visible, .itd-a11y-reset:focus-visible{outline:3px solid #009BCD; outline-offset:2px;}' +
    '.itd-a11y-head{display:flex; align-items:flex-start; justify-content:space-between; gap:1rem;}' +
    '.itd-a11y-group{background:#F5F7FA; border-radius:8px; padding:.9rem 1rem; margin-top:1rem;}' +
    '.itd-a11y-group > p{font-size:.85rem; font-weight:600; color:#0C1015; margin:0 0 .6rem;}' +
    '.itd-a11y-scale{border:1px solid #CFE8F2; background:#fff; color:#494B4F; border-radius:999px; padding:.45rem .9rem; font-size:.85rem; font-weight:600; cursor:pointer; margin-right:.4rem;}' +
    '.itd-a11y-scale[aria-pressed="true"]{background:#0C1015; color:#fff; border-color:#0C1015;}' +
    '.itd-a11y-row{display:flex; align-items:center; justify-content:space-between; gap:.75rem; width:100%; text-align:left; background:#fff; border:1px solid #CFE8F2; border-radius:8px; padding:.7rem .9rem; margin-top:.5rem; cursor:pointer; font-family:inherit;}' +
    '.itd-a11y-row:hover{border-color:#009BCD;}' +
    '.itd-a11y-row .t{font-size:.85rem; font-weight:600; color:#0C1015; display:block;}' +
    '.itd-a11y-row .d{font-size:.72rem; color:#6B7C93; display:block; margin-top:.15rem; line-height:1.45;}' +
    '.itd-a11y-sw{position:relative; flex-shrink:0; width:2.6rem; height:1.45rem; border-radius:999px; background:#CFE8F2; transition:background .2s ease;}' +
    '.itd-a11y-sw::after{content:""; position:absolute; top:.18rem; left:.2rem; width:1.1rem; height:1.1rem; border-radius:50%; background:#fff; box-shadow:0 1px 3px rgba(13,27,42,.25); transition:left .2s ease;}' +
    '.itd-a11y-row[aria-checked="true"] .itd-a11y-sw{background:#009BCD;}' +
    '.itd-a11y-row[aria-checked="true"] .itd-a11y-sw::after{left:1.3rem;}' +
    '.itd-a11y-reset{margin-top:1.1rem; border:0; border-radius:999px; background:#0C1015; color:#fff; padding:.6rem 1.2rem; font-size:.85rem; font-weight:600; cursor:pointer;}' +
    '.itd-a11y-reset:hover{background:#009BCD;}' +
    '@media (prefers-reduced-motion: reduce){#itd-a11y-trigger{transition:none;}}';

  function toggleHtml(key, label, desc) {
    var on = !!settings[key];
    return '<button class="itd-a11y-row" type="button" role="switch" aria-checked="' + on + '" data-a11y-toggle="' + key + '">' +
      '<span><span class="t">' + label + '</span><span class="d">' + desc + '</span></span>' +
      '<span class="itd-a11y-sw" aria-hidden="true"></span></button>';
  }

  function panelHtml() {
    var scaleBtns = SCALES.map(function (s) {
      return '<button type="button" class="itd-a11y-scale" data-a11y-scale="' + s + '" aria-pressed="' + (settings.textScale === s) + '">' + s + '%</button>';
    }).join('');
    return '<div class="itd-a11y-head"><div>' +
      '<span class="itd-a11y-eyebrow">Accessibility</span>' +
      '<h2>Reading &amp; viewing tools</h2></div>' +
      '<button type="button" class="itd-a11y-close" data-a11y-close aria-label="Close accessibility panel">&times;</button></div>' +
      '<div class="itd-a11y-group"><p>Text size</p>' + scaleBtns + '</div>' +
      toggleHtml('highContrast', 'High contrast', 'Increase separation between text and backgrounds.') +
      toggleHtml('underlineLinks', 'Underline links', 'Underline every link so navigation targets stand out.') +
      toggleHtml('reducedMotion', 'Reduce motion', 'Turn off animations and scrolling effects.') +
      toggleHtml('readableFont', 'Readable font', 'Switch to a plain, easy-to-read typeface.') +
      toggleHtml('bigCursor', 'Large cursor', 'Enlarge the mouse pointer so it is easier to follow.') +
      toggleHtml('hideImages', 'Hide images', 'Hide photos and videos to reduce visual distraction.') +
      toggleHtml('readingGuide', 'Reading guide', 'Show a horizontal guide line that follows your pointer.') +
      '<button type="button" class="itd-a11y-reset" data-a11y-reset>Reset settings</button>';
  }

  function render() { panel.innerHTML = panelHtml(); }

  function setOpen(next) {
    open = next;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) { render(); panel.hidden = false; panel.querySelector('[data-a11y-close]').focus(); }
    else { panel.hidden = true; trigger.focus(); }
  }

  function build() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    trigger = document.createElement('button');
    trigger.id = 'itd-a11y-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-label', 'Open accessibility panel');
    trigger.setAttribute('aria-controls', 'itd-a11y-panel');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = '<svg aria-hidden="true" width="26" height="26" viewBox="0 0 293.05 349.63" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M95.37,51.29a51.23,51.23,0,1,1,51.29,51.16h-.07A51.19,51.19,0,0,1,95.37,51.29ZM293,134.59A25.61,25.61,0,0,0,265.49,111h-.13l-89.64,8c-3.06.28-6.13.42-9.19.42H126.65q-4.59,0-9.16-.41L27.7,111a25.58,25.58,0,0,0-4.23,51l.22,0,72.45,6.56a8.55,8.55,0,0,1,7.77,8.48v19.62a33.82,33.82,0,0,1-2.36,12.45L60.48,313.66a25.61,25.61,0,1,0,46.85,20.71h0l39.14-95.61L186,334.63A25.61,25.61,0,0,0,232.86,314L191.63,209.14a34.14,34.14,0,0,1-2.35-12.44V177.09a8.55,8.55,0,0,1,7.77-8.49l72.33-6.55A25.61,25.61,0,0,0,293,134.59Z"/></svg>';
    document.body.appendChild(trigger);

    panel = document.createElement('div');
    panel.id = 'itd-a11y-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Accessibility settings');
    document.body.appendChild(panel);

    trigger.addEventListener('click', function () { setOpen(!open); });
    panel.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('[data-a11y-close]')) { setOpen(false); return; }
      var scale = t.closest('[data-a11y-scale]');
      if (scale) { settings.textScale = parseInt(scale.getAttribute('data-a11y-scale'), 10); apply(); return; }
      var toggle = t.closest('[data-a11y-toggle]');
      if (toggle) { var k = toggle.getAttribute('data-a11y-toggle'); settings[k] = !settings[k]; apply(); return; }
      if (t.closest('[data-a11y-reset]')) { settings = Object.assign({}, DEFAULTS); apply(); }
    });
    document.addEventListener('click', function (e) {
      if (open && !panel.contains(e.target) && !trigger.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) setOpen(false);
    });
  }

  function init() { build(); apply(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
