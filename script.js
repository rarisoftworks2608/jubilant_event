'use strict';
/* Jubilant Events & Productions: motion layer, projects, forms. No dependencies. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches && innerWidth > 900;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Fail-safe: never leave the page hidden behind the intro.
  const ready = () => { root.classList.remove('loading'); root.classList.add('ready'); };
  setTimeout(() => { const l = $('#loader'); if (l) l.classList.add('done'); ready(); }, 4500);

  /* ---------- reveal on scroll ---------- */
  const rio = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
  }), { threshold: 0.05 });
  function watchReveals(scope) {
    $$('[data-reveal], [data-split]', scope).forEach((el) => {
      if (el.dataset.watched) return;
      el.dataset.watched = '1';
      if (el.hasAttribute('data-reveal')) el.style.setProperty('--d', (el.dataset.delay || 0) + 'ms');
      if (el.closest('.hero')) return;
      if (reduce) el.classList.add('in'); else rio.observe(el);
    });
  }

  /* ---------- split headings into masked words ---------- */
  function splitInto(node, counter, goldWrap) {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.textContent = tok; i.style.setProperty('--i', counter.n++);
          if (goldWrap) i.className = 'gold-text';
          w.appendChild(i); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        const gold = n.classList.contains('gold-text');
        if (gold) n.classList.remove('gold-text');
        splitInto(n, counter, gold || goldWrap);
      }
    });
  }
  $$('[data-split]').forEach((el) => splitInto(el, { n: 0 }, false));

  /* ---------- counters ---------- */
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suffix; return; }
    const t0 = performance.now(), dur = 1500;
    const tick = (t) => {
      const k = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suffix;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => cio.observe(el));

  /* ---------- intro curtain (home page, once per visit) ---------- */
  const loader = $('#loader');
  let seen = false;
  try { seen = sessionStorage.getItem('jubilantIntro') === '1'; sessionStorage.setItem('jubilantIntro', '1'); } catch (e) {}
  if (loader) {
    if (reduce || seen) { loader.remove(); requestAnimationFrame(ready); }
    else {
      root.classList.add('loading');
      const go = () => setTimeout(() => { loader.classList.add('done'); setTimeout(ready, 650); setTimeout(() => loader.remove(), 1400); }, 2000);
      if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
    }
  } else requestAnimationFrame(ready);

  watchReveals(document);

  /* ---------- hero slideshow ---------- */
  const slides = $$('.hero .slide'), bars = $$('#bars button'), cur = $('#cur');
  if (slides.length) {
    let idx = 0, timer = 0;
    const show = (n) => {
      const old = slides[idx];
      slides.forEach((s) => s.classList.remove('prev'));
      if (n !== idx) { old.classList.remove('on'); old.classList.add('prev'); }
      idx = n; slides[idx].classList.add('on');
      if (cur) cur.textContent = String(idx + 1).padStart(2, '0');
      bars.forEach((b, i) => { b.classList.remove('act'); b.classList.toggle('past', i < idx); });
      void root.offsetWidth; if (bars[idx]) bars[idx].classList.add('act');
    };
    const play = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show((idx + 1) % slides.length), 6000); };
    show(0); play();
    bars.forEach((b, i) => b.addEventListener('click', () => { if (i !== idx) show(i); play(); }));
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearInterval(timer); else play(); });
    const hero = $('.hero');
    if (fine && !reduce) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
      hero.addEventListener('pointerleave', () => { hero.style.setProperty('--mx', 0); hero.style.setProperty('--my', 0); });
    }
  }

  /* ---------- video: play only while visible; still poster for reduced motion ---------- */
  $$('video[autoplay]').forEach((v) => {
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { threshold: 0.15 }).observe(v);
  });

  /* ---------- gold dust ---------- */
  if (!reduce) {
    $$('canvas.dust').forEach((cv) => {
      const ctx = cv.getContext('2d'); const N = +cv.dataset.dust || 30; let W = 0, H = 0, run = false, raf = 0;
      const P = [];
      const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
      const spawn = (init) => ({ x: Math.random() * W, y: init ? Math.random() * H : H + 10, r: 0.6 + Math.random() * 1.9, v: 0.15 + Math.random() * 0.5, ph: Math.random() * 6.28, a: 0.25 + Math.random() * 0.6 });
      const tick = (t) => {
        ctx.clearRect(0, 0, W, H);
        P.forEach((p, i) => {
          p.y -= p.v; p.x += Math.sin(t / 1800 + p.ph) * 0.25;
          if (p.y < -10) P[i] = spawn(false);
          const tw = 0.55 + 0.45 * Math.sin(t / 600 + p.ph);
          ctx.beginPath(); ctx.fillStyle = 'rgba(236,217,171,' + (p.a * tw * 0.22).toFixed(3) + ')'; ctx.arc(p.x, p.y, p.r * 3.2, 0, 6.28); ctx.fill();
          ctx.beginPath(); ctx.fillStyle = 'rgba(244,228,188,' + (p.a * tw).toFixed(3) + ')'; ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
        });
        if (run) raf = requestAnimationFrame(tick);
      };
      size(); for (let i = 0; i < N; i++) P.push(spawn(true));
      new ResizeObserver(size).observe(cv);
      new IntersectionObserver((es) => es.forEach((e) => { run = e.isIntersecting; cancelAnimationFrame(raf); if (run) raf = requestAnimationFrame(tick); })).observe(cv);
    });
  }

  /* ---------- cursor + magnetic buttons ---------- */
  const dot = $('.curdot');
  if (fine && !reduce && dot) {
    root.classList.add('has-cur');
    addEventListener('pointermove', (e) => { dot.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; });
    $$('.btn').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.28).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.4).toFixed(1) + 'px';
      });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }

  /* ---------- scroll: progress, nav, hero parallax, back to top, marquee ---------- */
  const nav = $('#nav'), back = $('#backToTop'), hero = $('.hero');
  const solid = document.body.classList.contains('nav-solid');
  const track = $('.mq div');
  let half = track ? track.scrollWidth / 2 : 0, mx = 0, vel = 0, lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY, vh = innerHeight, max = document.documentElement.scrollHeight - vh;
    root.style.setProperty('--sp', max > 0 ? (y / max).toFixed(4) : 0);
    if (nav) nav.classList.toggle('scrolled', solid || y > 40);
    if (back) back.classList.toggle('visible', y > 500);
    if (hero && !reduce) hero.style.setProperty('--hp', Math.min(y / vh, 1).toFixed(3));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => { if (track) half = track.scrollWidth / 2; onScroll(); });
  onScroll();
  if (back) back.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  if (!reduce && track) {
    (function loop() {
      const dy = scrollY - lastY; lastY = scrollY;
      vel += (Math.max(-30, Math.min(30, dy)) * 0.35 - vel) * 0.1;
      mx -= 0.7 + vel;
      if (mx <= -half) mx += half; else if (mx > 0) mx -= half;
      track.style.transform = 'translate3d(' + mx.toFixed(2) + 'px,0,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- mobile drawer + current page ---------- */
  const burger = $('#hamburger'), drawer = $('#mobileDrawer'), overlay = $('#mobileOverlay'), dClose = $('#mobileDrawerClose');
  const setMenu = (open) => {
    if (!drawer) return;
    drawer.classList.toggle('active', open); overlay.classList.toggle('active', open); burger.classList.toggle('active', open);
    burger.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : '';
  };
  if (burger) burger.addEventListener('click', () => setMenu(!drawer.classList.contains('active')));
  if (overlay) overlay.addEventListener('click', () => setMenu(false));
  if (dClose) dClose.addEventListener('click', () => setMenu(false));
  $$('.mobile-drawer-link').forEach((l) => l.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setMenu(false); closeModal(); } });
  const yearEl = $('#currentYear'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- projects ---------- */
  const projects = [
    { id: 'udta-teer', title: 'Udta Teer — Film Promotion', client: 'Seasons Mall, Pune', category: 'Celebrity Management', image: 'images/events/udta-teer/udta-teer-11.jpg',
      description: 'Film promotion for Udta Teer with Ayushmann Khurrana and Sara Ali Khan — a cinema meet & greet with the stars, followed by a packed fan event in the Seasons Mall atrium with crowd barricading and security, felicitation and a dhol welcome.',
      tags: ['Celebrity Management', 'Brand Promotion', 'Crowd Management'],
      gallery: ['06', '10', '12', '15', '17', '19', '29', '32', '03', '43', '50'].map((n) => 'images/events/udta-teer/udta-teer-' + n + '.jpg') },
    { id: 'seasons-awarapan-2', title: 'Awarapan 2 — Star Cast Meet & Greet', client: 'Seasons Mall, Pune', category: 'Celebrity Management', image: 'images/events/project-awarapan-2.jpg',
      description: 'Celebrity meet & greet for the film Awarapan 2 at Seasons Mall, Pune — stage and branded backdrop, artist coordination, security and crowd management, and live special effects for a packed, multi-level atrium audience.', tags: ['Celebrity Management', 'Mall Activation', 'Live Event'] },
    { id: 'seasons-vibe', title: 'VIBE — Film Promotion Meet & Greet', client: 'Seasons Mall, Pune', category: 'Brand Promotion', image: 'images/events/project-vibe.jpg',
      description: 'Promotional star-cast appearance for VIBE at Seasons Mall, Pune — artist arrival and movement, stage and backdrop production, fan engagement and crowd control from entry to exit.', tags: ['Celebrity Management', 'Brand Promotion', 'Mall Activation'] },
    { id: 'seasons-anniversary', title: 'Seasons Mall 13th Anniversary Celebration', client: 'Seasons Mall, Pune', category: 'Corporate Event', image: 'images/events/project-anniversary-felicitation.jpg',
      description: 'Anniversary celebration at Seasons Mall, Pune — LED stage and backdrop, atrium décor, seated guest set-up and the full felicitation programme on the day.', tags: ['Corporate Event', 'Stage Production', 'Décor'] },
    { id: 'dsk-toyota', title: 'DSK Toyota — Hadapsar, Pune', client: 'DSK Toyota', category: 'Flagship Project', image: 'images/stock/project-dsk-toyota-stage.jpg',
      description: 'Stage constructed at DSK Toyota Hadapsar, Pune in 12 levels to accommodate approximately 500 people — a landmark production showcasing our in-house engineering and fabrication capability at scale.', tags: ['Stage Production', 'Custom Fabrication', 'Corporate Event'] },
    { id: 'intrepid-control-systems', title: 'Intrepid Control Systems', client: 'Intrepid Control Systems', category: 'Corporate Event', image: 'images/stock/project-intrepid-control-systems.jpg',
      description: 'End-to-end management and production for a corporate event held for Intrepid Control Systems, delivered with precision staging and seamless on-ground execution.', tags: ['Corporate Event', 'Event Management'] },
    { id: 'renault-pune', title: 'Renault Pune', client: 'Renault', category: 'Automotive Launch', image: 'images/stock/project-renault-car.jpg',
      description: 'Production support and event execution for Renault Pune, blending sleek staging with brand-focused design.', tags: ['Automotive', 'Brand Activation'] },
    { id: 'pps-motor', title: 'PPS Motor', client: 'PPS Motor', category: 'Automotive Event', image: 'images/stock/project-pps-motor.jpg',
      description: 'Complete event management for PPS Motor, from concept development to on-site production.', tags: ['Automotive', 'Production'] },
    { id: 'nuhii', title: 'National Union Of Hospitality Industry Of India', client: 'NUHII', category: 'Conference', image: 'images/stock/project-nuhii-conference.jpg',
      description: 'Large-scale conference production for the National Union Of Hospitality Industry Of India, managing logistics, staging and the full delegate experience.', tags: ['Conference', 'Logistics'] },
    { id: 'siddharth-auto-engineers', title: 'Siddharth Auto Engineers', client: 'Siddharth Auto Engineers', category: 'Corporate Event', image: 'images/stock/project-siddharth-auto.jpg',
      description: 'Corporate event production for Siddharth Auto Engineers, delivered with a strong focus on brand presentation and guest experience.', tags: ['Corporate Event', 'Brand Presentation'] },
    { id: 'dilip-oak-academy', title: "Dilip Oak's Academy", client: "Dilip Oak's Academy", category: 'Institutional Event', image: 'images/stock/project-dilip-oaks-academy.jpg',
      description: "Event management and production for Dilip Oak's Academy, supporting a milestone institutional event from planning through to execution.", tags: ['Institutional', 'Event Management'] },
    { id: 'godrej-air-bangalore-campaign', title: 'Godrej Air, Bangalore — Marketing Campaign', client: 'Godrej Air', category: 'Marketing Campaign', image: 'images/stock/project-godrej-air-campaign.jpg',
      description: 'Marketing campaign production for Godrej Air in Bangalore, engineered for a high-impact brand reveal.', tags: ['Marketing Campaign', 'Production', 'Real Estate'] },
    { id: 'godrej-air-bangalore-launch', title: 'Godrej Air, Bangalore — Property Launch', client: 'Godrej Air', category: 'Property Launch', image: 'images/stock/project-godrej-air-launch.jpg',
      description: 'Property launch event for Godrej Air in Bangalore, from concept development through to on-site execution.', tags: ['Property Launch', 'Real Estate'] },
    { id: 'sai-dutta-developer', title: 'Sai Dutta Developer — Amravati', client: 'Sai Dutta Developer', category: 'Real Estate Launch', image: 'images/stock/project-sai-dutta.jpg',
      description: 'Launch event management for Sai Dutta Developer in Amravati, combining stage production with immersive brand storytelling.', tags: ['Real Estate', 'Product Launch'] },
    { id: 'chintamani-developers', title: 'Chintamani Developers', client: 'Chintamani Developers', category: 'Real Estate Event', image: 'images/stock/project-chintamani.jpg',
      description: 'End-to-end production for a Chintamani Developers event, from structural builds to final execution.', tags: ['Real Estate', 'Custom Fabrication'] },
    { id: 'destination-wedding-decor', title: 'Destination Wedding Décor — Shirdi', client: null, category: 'Décor & Social Events', image: 'images/events/decor-haldi-stage.jpg',
      description: 'Multi-function wedding décor and production across three days in Shirdi — an illuminated floral entrance tunnel, a vibrant haldi stage and floral canopy set-ups, designed, fabricated and installed by our in-house team.', tags: ['Décor', 'Custom Fabrication', 'Social Events'],
      gallery: ['images/events/gallery-shirdi-stage-1.jpg', 'images/events/gallery-shirdi-stage-2.jpg', 'images/events/gallery-floral-entrance.jpg', 'images/events/gallery-pastel-haldi.jpg'] },
    { id: 'floral-mandap-lounge', title: 'Floral Mandap & Lounge Set-up', client: null, category: 'Décor & Social Events', image: 'images/events/decor-floral-mandap.jpg',
      description: 'An indoor floral mandap with a crystal-strand canopy and rose-wrapped pillars, paired with a curated guest lounge — designed and built in-house for a ballroom celebration.', tags: ['Décor', 'Stage Design', 'Social Events'] },
    { id: 'gala-nights', title: 'Gala Nights / Opening Events', client: null, category: 'Social & Opening Events', image: 'images/stock/header-contact-table-setting.jpg',
      description: 'Curated gala nights and grand opening events, designed to leave a lasting impression on every guest.', tags: ['Social Events', 'Opening Events'] },
    { id: 'exhibition-stall-structure', title: 'Exhibition / Stall / Structure / Customization', client: null, category: 'Exhibition', image: 'images/stock/project-exhibition-structure.jpg',
      description: 'Custom-fabricated exhibition stalls and structures, tailored to brand identity and spatial requirements.', tags: ['Exhibition', 'Custom Fabrication'] }
  ];
  const grid = $('#projectsGrid');
  const modal = $('#projectModal'), modalContent = $('#modalContent');
  function openModal(id) {
    const p = projects.find((x) => x.id === id);
    if (!p || !modal) return;
    const photos = p.gallery ? [p.image, ...p.gallery] : [];
    const thumbs = photos.length ? '<div class="modal-gallery">' + photos.map((src, i) =>
      '<button type="button" class="modal-thumb' + (i === 0 ? ' active' : '') + '" data-src="' + src + '" aria-label="Show photo ' + (i + 1) + ' of ' + photos.length + '"><img src="' + src + '" alt="" loading="lazy"></button>').join('') + '</div>' : '';
    modalContent.innerHTML = '<div class="modal-media"><img class="modal-main" src="' + p.image + '" alt="' + p.title + ' — event production by Jubilant Events &amp; Productions"></div>' + thumbs +
      '<div class="modal-body"><span class="cat">' + p.category + '</span><h3 id="modalTitle">' + p.title + '</h3>' +
      (p.client && p.client !== p.title ? '<p class="project-client">' + p.client + '</p>' : '') + '<p>' + p.description + '</p>' +
      '<div class="dots">' + p.tags.map((t) => '<span>' + t + '</span>').join('') + '</div></div>';
    const main = $('.modal-main', modalContent);
    $$('.modal-thumb', modalContent).forEach((t) => t.addEventListener('click', () => {
      main.src = t.dataset.src; $$('.modal-thumb', modalContent).forEach((x) => x.classList.toggle('active', x === t));
    }));
    modal.classList.add('active'); document.body.style.overflow = 'hidden';
  }
  function closeModal() { if (modal && modal.classList.contains('active')) { modal.classList.remove('active'); document.body.style.overflow = ''; } }
  if (modal) {
    const mc = $('#modalClose'); if (mc) mc.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    $$('.featured [data-modal-trigger]').forEach((b) => b.addEventListener('click', () => openModal(b.dataset.modalTrigger)));
  }
  if (grid) {
    const FEATURED = 'udta-teer';
    const group = (p) => {
      const c = (p.category + ' ' + (p.tags || []).join(' ')).toLowerCase();
      if (c.includes('celebrity') || c.includes('promotion')) return 'celebrity';
      if (c.includes('real estate') || c.includes('property')) return 'real-estate';
      if (c.includes('automotive') || c.includes('launch') || c.includes('motor')) return 'automotive';
      if (c.includes('corporate') || c.includes('conference') || c.includes('institutional')) return 'corporate';
      if (c.includes('décor') || c.includes('social') || c.includes('wedding')) return 'decor';
      if (c.includes('exhibition') || c.includes('stall') || c.includes('fabrication')) return 'exhibition';
      return 'other';
    };
    const list = projects.filter((p) => p.id !== FEATURED);
    $$('.filter').forEach((f) => {
      const g = f.dataset.filter || 'all';
      const n = g === 'all' ? list.length : list.filter((p) => group(p) === g).length;
      const c = $('.pill-count', f); if (c) c.textContent = '(' + n + ')';
    });
    const render = (g) => {
      const items = list.filter((p) => g === 'all' || group(p) === g);
      grid.innerHTML = items.map((p, i) =>
        '<article class="pcard hover-lift" data-reveal data-delay="' + ((i % 3) * 90) + '" data-modal-trigger="' + p.id + '"><div class="mat"><div class="ph" style="--bg:url(\'' + p.image + '\')"><img src="' + p.image + '" alt="' + p.title + ' — event production by Jubilant Events &amp; Productions" loading="lazy"></div></div>' +
        '<div class="card-b"><span class="cat">' + p.category + '</span><h3>' + p.title + '</h3>' + (p.client && p.client !== p.title ? '<p class="sub">' + p.client + '</p>' : '') +
        '<span class="textlink">View project <i class="fa-solid fa-arrow-right"></i></span></div></article>').join('');
      $$('[data-modal-trigger]', grid).forEach((c) => c.addEventListener('click', () => openModal(c.dataset.modalTrigger)));
      watchReveals(grid);
    };
    render('all');
    const fs = $$('.filter');
    fs.forEach((f) => f.addEventListener('click', () => { fs.forEach((x) => x.classList.remove('active')); f.classList.add('active'); render(f.dataset.filter || 'all'); }));
  }

  /* ---------- contact form ---------- */
  const form = $('#contactForm');
  if (form) {
    const toast = $('#toast');
    let tt;
    const showToast = (title, msg) => {
      if (!toast) return;
      $('#toastTitle').textContent = title; $('#toastMessage').textContent = msg;
      toast.classList.add('visible'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('visible'), 4800);
    };
    const rules = {
      name: (v) => !v.trim() ? 'Please enter your name.' : v.trim().length < 2 ? 'Name looks too short.' : '',
      email: (v) => !v.trim() ? 'Please enter your email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Please enter a valid email address.' : '',
      phone: (v) => { const d = v.replace(/\D/g, ''); return !d ? 'Please enter your phone number.' : (d.length < 10 || d.length > 13) ? 'Please enter a valid phone number.' : ''; },
      eventType: (v) => v ? '' : 'Please select an event type.',
      eventDate: (v) => { if (!v) return ''; const t = new Date(); t.setHours(0, 0, 0, 0); return new Date(v) < t ? 'Event date cannot be in the past.' : ''; },
      message: (v) => !v.trim() ? 'Please tell us a little about your event.' : v.trim().length < 10 ? 'Please add a few more details (min. 10 characters).' : ''
    };
    const setErr = (name, text) => {
      const input = document.getElementById(name), err = document.getElementById(name + 'Error');
      if (!input || !err) return;
      const g = input.closest('.form-group'); if (g) g.classList.toggle('has-error', !!text); err.textContent = text;
    };
    const check = (name) => { const i = document.getElementById(name); if (!i) return true; const e = rules[name](i.value); setErr(name, e); return !e; };
    Object.keys(rules).forEach((name) => {
      const i = document.getElementById(name); if (!i) return;
      i.addEventListener('blur', () => check(name));
      i.addEventListener('input', () => { const g = i.closest('.form-group'); if (g && g.classList.contains('has-error')) check(name); });
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = Object.keys(rules).map(check).every(Boolean);
      if (!ok) { const f = $('.has-error input, .has-error select, .has-error textarea', form); if (f) f.focus(); return; }
      const first = document.getElementById('name').value.trim().split(' ')[0];
      showToast('Enquiry sent', 'Thank you, ' + first + '. Our team will be in touch shortly.');
      form.reset(); Object.keys(rules).forEach((n) => setErr(n, ''));
    });
  }
})();
