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
  document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    try {
      const url = new URL(href, window.location.href);
      if (url.pathname === currentPath ||
          (currentPath !== '/' && url.pathname !== '/' && currentPath.startsWith(url.pathname))) {
        link.classList.add('active');
      }
    } catch (e) {}
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

  /* ── Contact form ── */
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('[type="submit"]');
      const successMsg = document.querySelector('#form-success');
      const errorMsg   = document.querySelector('#form-error');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      if (successMsg) successMsg.style.display = 'none';
      if (errorMsg)   errorMsg.style.display = 'none';

      const data = Object.fromEntries(new FormData(contactForm));

      try {
        const res = await fetch(contactForm.action || '/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString(),
        });

        if (res.ok) {
          contactForm.reset();
          if (successMsg) { successMsg.style.display = 'block'; }
        } else {
          throw new Error('Server error');
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
