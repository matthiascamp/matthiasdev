/* ═══════════════════════════════════════════════
   MATTHIAS CAMPBELL — Portfolio JS
   ═══════════════════════════════════════════════ */

'use strict';

/* ── Nav scroll behaviour ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── Hamburger / mobile menu ── */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
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

/* ── Custom cursor ── */
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mx = -100, my = -100, fx = -100, fy = -100;

window.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
}, { passive: true });

function followCursor() {
  fx += (mx - fx) * 0.14;
  fy += (my - fy) * 0.14;
  cursorFollower.style.left = fx + 'px';
  cursorFollower.style.top  = fy + 'px';
  requestAnimationFrame(followCursor);
}
followCursor();

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hovered');
    cursorFollower.classList.add('hovered');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hovered');
    cursorFollower.classList.remove('hovered');
  });
});

/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
const observer  = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

// Trigger hero reveals immediately
document.querySelectorAll('#hero .reveal-up').forEach((el, i) => {
  setTimeout(() => el.classList.add('revealed'), 200 + i * 120);
});

/* ── Typewriter effect ── */
const words   = ['Websites.', 'Web Apps.', 'Online Stores.', 'Booking Systems.', 'SEO Campaigns.', 'AI Tools.', 'Dashboards.', 'Landing Pages.'];
const el      = document.getElementById('typewriter');
let wordIdx   = 0, charIdx = 0, deleting = false;

function type() {
  const word    = words[wordIdx];
  const current = deleting
    ? word.substring(0, charIdx--)
    : word.substring(0, charIdx++);

  el.textContent = current;

  if (!deleting && charIdx > word.length) {
    deleting = true;
    setTimeout(type, 1800);
    return;
  }
  if (deleting && charIdx < 0) {
    deleting = false;
    wordIdx  = (wordIdx + 1) % words.length;
    setTimeout(type, 400);
    return;
  }
  setTimeout(type, deleting ? 65 : 90);
}
setTimeout(type, 1200);

/* ── Stat counter animation ── */
function animateCounter(el, target, duration = 1800) {
  const start    = performance.now();
  const update   = timestamp => {
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statNums  = document.querySelectorAll('.stat-num');
let   statsRun  = false;
const statsObs  = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !statsRun) {
    statsRun = true;
    statNums.forEach(numEl => {
      animateCounter(numEl, parseInt(numEl.dataset.target));
    });
  }
}, { threshold: 0.5 });
if (statNums.length) statsObs.observe(statNums[0].closest('.hero-stats'));

/* ── Particle canvas ── */
const canvas  = document.getElementById('particles');
const ctx     = canvas.getContext('2d');
let   W, H, particles;

function resize() {
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x    = Math.random() * W;
    this.y    = Math.random() * H;
    this.r    = Math.random() * 1.5 + 0.4;
    this.vx   = (Math.random() - 0.5) * 0.25;
    this.vy   = (Math.random() - 0.5) * 0.25;
    this.life = Math.random();
    this.dLife= 0.002 + Math.random() * 0.003;
    this.color= Math.random() > 0.5 ? '74,222,128' : '134,239,172';
  }
  update() {
    this.x    += this.vx;
    this.y    += this.vy;
    this.life -= this.dLife;
    if (this.life <= 0 || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.life * 0.6})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = Array.from({ length: 80 }, () => new Particle());
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(drawParticles);
}

window.addEventListener('resize', () => { resize(); }, { passive: true });
resize();
initParticles();
drawParticles();

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Contact form ── */
const form     = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

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

/* ── Active nav link highlight on scroll ── */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObs.observe(s));

/* ── iframe preview scaling ── */
function scaleIframePreviews() {
  document.querySelectorAll('.project-iframe-wrap').forEach(wrap => {
    const iframe = wrap.querySelector('iframe');
    if (!iframe) return;
    const scale = wrap.offsetWidth / 1200;
    iframe.style.transform = `scale(${scale})`;
    const wrapH = wrap.offsetHeight;
    if (wrapH > 0) iframe.style.height = Math.ceil(wrapH / scale) + 'px';
  });
}
scaleIframePreviews();
window.addEventListener('resize', scaleIframePreviews, { passive: true });

/* ── Pricing tabs ── */
const pricingTabs   = document.querySelectorAll('.pricing-tab');
const pricingPanels = document.querySelectorAll('.pricing-panel');

pricingTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    pricingTabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    pricingPanels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    const panel = document.getElementById('panel-' + target);
    if (panel) panel.classList.add('active');
  });
});
