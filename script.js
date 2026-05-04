/* ═══════════════════════════════════════════════
   MATTHIASDEV — Site JS
   ═══════════════════════════════════════════════ */

'use strict';

/* ── Nav scroll behaviour ── */
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ── Hamburger / mobile menu ── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');

  function closeMobileMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
}

/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll('.reveal-up');
if (revealEls.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Contact form ── */
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (form && formNote) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    try {
      const data = new FormData(form);
      const response = await fetch('https://formspree.io/f/mdapbdbp', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        formNote.className = 'form-note form-note--success';
        formNote.textContent = '✓ Message sent! I\'ll reply within 24 hours.';
        form.reset();
      } else {
        formNote.className = 'form-note form-note--error';
        formNote.textContent = 'Something went wrong. Please try again or email me directly.';
      }
    } catch {
      formNote.className = 'form-note form-note--error';
      formNote.textContent = 'Something went wrong. Please try again or email me directly.';
    }

    btn.disabled = false;
    btn.querySelector('span').textContent = 'Send message';
    setTimeout(() => { formNote.textContent = ''; formNote.className = 'form-note'; }, 6000);
  });
}

/* ── iframe preview scaling ── */
function scaleIframePreviews() {
  document.querySelectorAll('.project-preview iframe, .showcase-frame iframe').forEach(iframe => {
    const wrap = iframe.parentElement;
    if (!wrap) return;
    const scale = wrap.offsetWidth / 1440;
    iframe.style.transform = `scale(${scale})`;
    iframe.style.width = '1440px';
    iframe.style.height = '810px';
  });
}

scaleIframePreviews();
window.addEventListener('resize', scaleIframePreviews, { passive: true });
window.addEventListener('load', scaleIframePreviews);
