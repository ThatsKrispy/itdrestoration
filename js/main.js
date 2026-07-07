/* ============================================================
   ITD RESTORATION — Main JS
   ============================================================ */

(function () {
  'use strict';

  /* ── Nav scroll state ── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile nav ── */
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileNav = document.querySelector('.nav__mobile');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', open);
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Active nav link ── */
  const currentPath = window.location.pathname;
  const linkMatches = (link) => {
    const href = link.getAttribute('href');
    if (!href) return false;
    try {
      const url = new URL(href, window.location.href);
      return url.pathname === currentPath;
    } catch (e) { return false; }
  };

  document.querySelectorAll('.nav__link, .nav__mobile-link, .nav__dropdown-link, .nav__mobile-sublink').forEach(link => {
    if (linkMatches(link)) link.classList.add('active');
  });

  // Highlight the parent dropdown trigger when a child page is active
  document.querySelectorAll('.nav__dropdown').forEach(dropdown => {
    if (dropdown.querySelector('.nav__dropdown-link.active')) {
      const trigger = dropdown.closest('.nav__item')?.querySelector('.nav__link');
      if (trigger) trigger.classList.add('active');
    }
  });

  /* ── FAQ Accordion ── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.maxHeight = '0';
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Open this one if it was closed
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    btn.setAttribute('aria-expanded', 'false');
  });

  /* ── Contact form (Web3Forms) ──
     Get a free access key at https://web3forms.com — register it to
     info@itdrestoration.com so submissions land in the client's inbox.
     Until a real key is set, the form falls back to opening the visitor's
     email app pre-filled (no fake "message sent" confirmations). */
  const W3F_ACCESS_KEY = 'REPLACE_WITH_WEB3FORMS_KEY';

  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('[type="submit"]');
      const successMsg = document.querySelector('#form-success');
      const errorMsg   = document.querySelector('#form-error');
      const mailtoMsg  = document.querySelector('#form-mailto');

      const data = Object.fromEntries(new FormData(contactForm));
      delete data.botcheck;

      // Basic required-field check (form has novalidate)
      const missing = ['first-name', 'last-name', 'email', 'phone'].filter(k => !String(data[k] || '').trim());
      if (missing.length) {
        contactForm.querySelector(`[name="${missing[0]}"]`)?.focus();
        if (errorMsg) {
          errorMsg.textContent = 'Please fill in your name, email, and phone number so we can reach you.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      [successMsg, errorMsg, mailtoMsg].forEach(el => { if (el) el.style.display = 'none'; });

      // No key configured yet → open the visitor's email app pre-filled instead
      if (W3F_ACCESS_KEY.indexOf('REPLACE') === 0) {
        const body = Object.entries(data)
          .filter(([k, v]) => v && ['subject', 'from_name'].indexOf(k) === -1)
          .map(([k, v]) => `${k.replace(/-/g, ' ')}: ${v}`)
          .join('\n');
        window.location.href = 'mailto:info@itdrestoration.com'
          + '?subject=' + encodeURIComponent('Estimate request from ' + data['first-name'] + ' ' + data['last-name'])
          + '&body=' + encodeURIComponent(body);
        if (mailtoMsg) mailtoMsg.style.display = 'block';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ access_key: W3F_ACCESS_KEY, ...data }),
        });
        const result = await res.json();

        if (res.ok && result.success) {
          contactForm.reset();
          if (successMsg) { successMsg.style.display = 'block'; successMsg.scrollIntoView({ block: 'nearest' }); }
        } else {
          throw new Error(result.message || 'Server error');
        }
      } catch {
        if (errorMsg) { errorMsg.style.display = 'block'; }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });
  }

  /* ── Lazy-load images ── */
  if ('IntersectionObserver' in window) {
    const imgs = document.querySelectorAll('img[loading="lazy"]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) { img.src = img.dataset.src; }
          io.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    imgs.forEach(img => io.observe(img));
  }

  /* ── Counter animation ── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1800;
        const start = Date.now();
        const tick = () => {
          const progress = Math.min((Date.now() - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target).toLocaleString();
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countIO.unobserve(el);
      });
    }, { threshold: 0.3 });
    counters.forEach(c => countIO.observe(c));
  }

  /* ── Scroll reveal — FIXED ── 
     Pure CSS-class approach: add .reveal-init to hide, .reveal-visible to show.
     No inline style manipulation which breaks when class fires before DOMContentLoaded.
  ── */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (revealEls.length) {
    // Only run if user hasn't requested reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduced && 'IntersectionObserver' in window) {
      // Initialize all elements as hidden
      revealEls.forEach(el => {
        el.classList.add('reveal-init');
      });

      const revealIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-init');
            entry.target.classList.add('reveal-visible');
            revealIO.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.06,
        rootMargin: '0px 0px -30px 0px'
      });

      revealEls.forEach(el => revealIO.observe(el));
    }
    // If reduced motion or no IntersectionObserver: elements stay visible (no class added)
  }

  /* ── Phone number accessibility ── */
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    if (!link.getAttribute('aria-label')) {
      link.setAttribute('aria-label', 'Call us at ' + link.textContent.trim());
    }
  });

})();
