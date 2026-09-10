'use strict';

document.addEventListener('DOMContentLoaded', () => {

  document.body.classList.add('loaded');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------------- Hero kinetic headline ---------------- */
  const heroLines = document.querySelectorAll('.hero .line-inner');
  if (heroLines.length) {
    const heroEyebrow = document.querySelector('.hero .eyebrow');
    const heroText = document.querySelector('.hero-text');
    const heroButtons = document.querySelector('.hero-buttons');
    if (hasGsap && !prefersReducedMotion) {
      [heroEyebrow, ...heroLines, heroText, heroButtons].forEach((el) => { if (el) el.style.transition = 'none'; });
      gsap.timeline({ delay: 0.15 })
        .fromTo(heroEyebrow, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
        .to(heroLines, { y: '0%', duration: 0.9, ease: 'power4.out', stagger: 0.12 }, '-=0.25')
        .fromTo(heroText, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.5')
        .fromTo(heroButtons, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');
    } else {
      heroLines.forEach((el) => { el.style.transform = 'none'; });
    }
  }

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Sticky navbar + scroll progress + hide-on-scroll ---------------- */
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  const heroAurora = document.querySelector('.hero-aurora');
  const navLinksEl = document.getElementById('navLinks');

  let lastScrollY = window.scrollY || window.pageYOffset;
  let scrollTicking = false;

  function updateOnScroll() {
    const scrollY = window.scrollY || window.pageYOffset;

    navbar.classList.toggle('scrolled', scrollY > 40);
    backToTop.classList.toggle('visible', scrollY > 500);

    lastScrollY = scrollY;

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';

    if (heroAurora && !prefersReducedMotion && scrollY < window.innerHeight) {
      heroAurora.style.transform = `translate3d(0, ${scrollY * 0.15}px, 0)`;
    }

    scrollTicking = false;
  }

  function onScroll() {
    if (!scrollTicking) {
      requestAnimationFrame(updateOnScroll);
      scrollTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateOnScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------------- Magnetic buttons ---------------- */
  if (finePointer && !prefersReducedMotion) {
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        el.style.transition = 'transform 0.15s ease-out';
        el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ---------------- Card spotlight glow ---------------- */
  if (finePointer && !prefersReducedMotion) {
    document.querySelectorAll('.services-grid, .features-grid').forEach((grid) => {
      grid.addEventListener('mousemove', (e) => {
        const card = e.target.closest('.service-card, .feature-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    });
  }

  /* ---------------- Card lift on hover ---------------- */
  if (finePointer && !prefersReducedMotion && hasGsap) {
    const liftTargets = document.querySelectorAll('.service-card, .feature-card');
    liftTargets.forEach((card) => {
      const lift = card.matches('.service-card') ? -8 : -6;
      const setLift = gsap.quickTo(card, 'y', { duration: 0.4, ease: 'power2.out' });

      card.addEventListener('mouseenter', () => setLift(lift));
      card.addEventListener('mouseleave', () => setLift(0));
    });
  }

  /* ---------------- Grid reveal stagger ---------------- */
  function staggerGrid(selector) {
    const grid = document.querySelector(selector);
    if (!grid) return;
    Array.from(grid.children).forEach((child, i) => {
      child.style.transitionDelay = `${(i % 8) * 0.07}s`;
    });
  }
  ['.services-grid', '.features-grid', '.inventory-grid'].forEach(staggerGrid);

  /* ---------------- Mobile menu ---------------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const mobileOverlay = document.getElementById('mobileOverlay');

  function closeMobileMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('mobile-active');
    mobileOverlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMobileMenu() {
    const isOpen = navLinks.classList.toggle('mobile-active');
    hamburger.classList.toggle('active', isOpen);
    mobileOverlay.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMobileMenu);
  mobileOverlay.addEventListener('click', closeMobileMenu);
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* ---------------- Active nav link (current page) ---------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    link.classList.toggle('active', linkPage === currentPage);
  });

  /* ---------------- Scroll reveal ---------------- */
  function revealNewEls(root) {
    const els = root.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    if (hasGsap && !prefersReducedMotion) {
      els.forEach((el) => {
        if (el.dataset.revealBound) return;
        el.dataset.revealBound = '1';
        el.style.transition = 'none';
        const fromX = el.classList.contains('reveal-left') ? -36 : el.classList.contains('reveal-right') ? 36 : 0;
        const fromY = el.classList.contains('reveal-up') ? 30 : 0;
        const delayMatch = el.className.match(/delay-(\d)/);
        const delay = delayMatch ? parseInt(delayMatch[1], 10) * 0.1 : 0;
        gsap.fromTo(el,
          { opacity: 0, x: fromX, y: fromY, scale: 0.97 },
          {
            opacity: 1, x: 0, y: 0, scale: 1, delay,
            duration: 0.9, ease: 'power3.out',
            onStart: () => el.classList.add('visible'),
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
          }
        );
      });
    } else {
      els.forEach((el) => el.classList.add('visible'));
    }
  }

  const revealObserver = hasGsap ? null : new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealNewEls(document);
  if (revealObserver) {
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));
  }

  /* ---------------- Clients marquee (click to pause/resume) ---------------- */
  const clientsTrack = document.querySelector('.clients-track');
  if (clientsTrack) {
    clientsTrack.addEventListener('click', () => {
      clientsTrack.classList.toggle('paused');
    });
  }

  /* ---------------- Animated counters ---------------- */
  const counters = document.querySelectorAll('.stat-num');

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(counter => counterObserver.observe(counter));

  /* ---------------- Projects data + render ---------------- */
  const projects = [
    {
      id: 'dsk-toyota',
      title: "DSK Toyota — Hadapsar, Pune",
      category: 'Flagship Project',
      image: 'https://images.unsplash.com/photo-1576514129883-2f1d47a65da6?w=1000&q=80&auto=format&fit=crop',
      description: "Stage constructed at DSK Toyota Hadapsar, Pune in 12 levels to accommodate approximately 500 people — a landmark production showcasing our in-house engineering and fabrication capability at scale.",
      tags: ['Stage Production', 'Custom Fabrication', 'Corporate Event']
    },
    {
      id: 'intrepid-control-systems',
      title: 'Intrepid Control Systems',
      category: 'Corporate Event',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&q=80&auto=format&fit=crop',
      description: 'End-to-end management and production for a corporate event held for Intrepid Control Systems, delivered with precision staging and seamless on-ground execution.',
      tags: ['Corporate Event', 'Event Management']
    },
    {
      id: 'renault-pune',
      title: 'Renault Pune',
      category: 'Automotive Launch',
      image: 'https://images.unsplash.com/photo-1740276789708-a14e0a735dd9?w=1000&q=80&auto=format&fit=crop',
      description: 'Production support and event execution for Renault Pune, blending sleek staging with brand-focused design.',
      tags: ['Automotive', 'Brand Activation']
    },
    {
      id: 'pps-motor',
      title: 'PPS Motor',
      category: 'Automotive Event',
      image: 'https://images.unsplash.com/photo-1681758043649-7aab7d5a2592?w=1000&q=80&auto=format&fit=crop',
      description: 'Complete event management for PPS Motor, from concept development to on-site production.',
      tags: ['Automotive', 'Production']
    },
    {
      id: 'nuhii',
      title: 'National Union Of Hospitality Industry Of India',
      category: 'Conference',
      image: 'https://images.unsplash.com/photo-1762968274962-20c12e6e8ecd?w=1000&q=80&auto=format&fit=crop',
      description: 'Large-scale conference production for the National Union Of Hospitality Industry Of India, managing logistics, staging and the full delegate experience.',
      tags: ['Conference', 'Logistics']
    },
    {
      id: 'siddharth-auto-engineers',
      title: 'Siddharth Auto Engineers',
      category: 'Corporate Event',
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1000&q=80&auto=format&fit=crop',
      description: 'Corporate event production for Siddharth Auto Engineers, delivered with a strong focus on brand presentation and guest experience.',
      tags: ['Corporate Event', 'Brand Presentation']
    },
    {
      id: 'dilip-oak-academy',
      title: "Dilip Oak's Academy",
      category: 'Institutional Event',
      image: 'https://images.unsplash.com/photo-1778877035014-98c41b7c1460?w=1000&q=80&auto=format&fit=crop',
      description: "Event management and production for Dilip Oak's Academy, supporting a milestone institutional event from planning through to execution.",
      tags: ['Institutional', 'Event Management']
    },
    {
      id: 'godrej-air-bangalore-campaign',
      title: 'Godrej Air, Bangalore — Marketing Campaign',
      category: 'Marketing Campaign',
      image: 'https://images.unsplash.com/photo-1560523160-754a9e25c68f?w=1000&q=80&auto=format&fit=crop',
      description: 'Marketing campaign production for Godrej Air in Bangalore, engineered for a high-impact brand reveal.',
      tags: ['Marketing Campaign', 'Production']
    },
    {
      id: 'godrej-air-bangalore-launch',
      title: 'Godrej Air, Bangalore — Property Launch',
      category: 'Property Launch',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1000&q=80&auto=format&fit=crop',
      description: 'Property launch event for Godrej Air in Bangalore, from concept development through to on-site execution.',
      tags: ['Property Launch', 'Real Estate']
    },
    {
      id: 'sai-dutta-developer',
      title: 'Sai Dutta Developer — Amravati',
      category: 'Real Estate Launch',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1000&q=80&auto=format&fit=crop',
      description: 'Launch event management for Sai Dutta Developer in Amravati, combining stage production with immersive brand storytelling.',
      tags: ['Real Estate', 'Product Launch']
    },
    {
      id: 'chintamani-developers',
      title: 'Chintamani Developers',
      category: 'Real Estate Event',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1000&q=80&auto=format&fit=crop',
      description: 'End-to-end production for a Chintamani Developers event, from structural builds to final execution.',
      tags: ['Real Estate', 'Custom Fabrication']
    },
    {
      id: 'gala-nights',
      title: 'Gala Nights / Opening Events',
      category: 'Social & Opening Events',
      image: 'https://images.unsplash.com/photo-1751071479001-480c55fb1d0d?w=1000&q=80&auto=format&fit=crop',
      description: 'Curated gala nights and grand opening events, designed to leave a lasting impression on every guest.',
      tags: ['Social Events', 'Opening Events']
    },
    {
      id: 'exhibition-stall-structure',
      title: 'Exhibition / Stall / Structure / Customization',
      category: 'Exhibition',
      image: 'https://images.unsplash.com/photo-1752155222944-675c2c3bfafd?w=1000&q=80&auto=format&fit=crop',
      description: 'Custom-fabricated exhibition stalls and structures, tailored to brand identity and spatial requirements.',
      tags: ['Exhibition', 'Custom Fabrication']
    }
  ];

  const projectsGrid = document.getElementById('projectsGrid');

  if (projectsGrid) {
    function renderProjects() {
      const html = projects
        .filter(p => p.id !== 'dsk-toyota')
        .map((p, index) => `
          <article class="project-card reveal-up delay-${(index % 3) + 1}" data-modal-trigger="${p.id}">
            <img src="${p.image}" alt="${p.title} — event production by Jubilant Events & Productions" loading="lazy">
            <div class="project-overlay">
              <span class="project-category">${p.category}</span>
              <h3>${p.title}</h3>
              <span class="project-view"><i class="fa-solid fa-arrows-up-down-left-right"></i> View Project</span>
            </div>
          </article>
        `).join('');

      projectsGrid.innerHTML = html;

      projectsGrid.querySelectorAll('[data-modal-trigger]').forEach(card => {
        card.addEventListener('click', () => openProjectModal(card.dataset.modalTrigger));
      });

      if (revealObserver) {
        Array.from(projectsGrid.children).forEach((child, i) => {
          child.style.transitionDelay = `${(i % 8) * 0.07}s`;
        });
        projectsGrid.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));
      } else {
        revealNewEls(projectsGrid);
      }
    }

    renderProjects();

    /* ---------------- Project modal ---------------- */
    const projectModal = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalContent');
    const modalClose = document.getElementById('modalClose');

    function openProjectModal(id) {
      const project = projects.find(p => p.id === id);
      if (!project) return;

      modalContent.innerHTML = `
        <img src="${project.image}" alt="${project.title} — event production by Jubilant Events & Productions">
        <div class="modal-body">
          <span class="project-category">${project.category}</span>
          <h3 id="modalTitle">${project.title}</h3>
          <p>${project.description}</p>
          <div class="modal-tags">
            ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
          </div>
        </div>
      `;

      projectModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeProjectModal() {
      projectModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-modal-trigger="dsk-toyota"]').forEach(btn => {
      btn.addEventListener('click', () => openProjectModal('dsk-toyota'));
    });

    modalClose.addEventListener('click', closeProjectModal);
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && projectModal.classList.contains('active')) closeProjectModal();
    });
  }

  /* ---------------- Toast notification ---------------- */
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimeout;

  function showToast(title, message) {
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.classList.add('visible');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 4800);
  }

  /* ---------------- Contact form validation ---------------- */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
  const validators = {
    name: (value) => {
      if (!value.trim()) return 'Please enter your name.';
      if (value.trim().length < 2) return 'Name looks too short.';
      return '';
    },
    email: (value) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) return 'Please enter your email.';
      if (!re.test(value.trim())) return 'Please enter a valid email address.';
      return '';
    },
    phone: (value) => {
      const digits = value.replace(/\D/g, '');
      if (!digits) return 'Please enter your phone number.';
      if (digits.length < 10 || digits.length > 13) return 'Please enter a valid phone number.';
      return '';
    },
    eventType: (value) => {
      if (!value) return 'Please select an event type.';
      return '';
    },
    eventDate: (value) => {
      if (!value) return '';
      const selected = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) return 'Event date cannot be in the past.';
      return '';
    },
    message: (value) => {
      if (!value.trim()) return 'Please tell us a little about your event.';
      if (value.trim().length < 10) return 'Please add a few more details (min. 10 characters).';
      return '';
    }
  };

  function setFieldError(fieldName, errorText) {
    const input = document.getElementById(fieldName);
    const errorEl = document.getElementById(fieldName + 'Error');
    const group = input.closest('.form-group');

    if (errorText) {
      group.classList.add('has-error');
      errorEl.textContent = errorText;
    } else {
      group.classList.remove('has-error');
      errorEl.textContent = '';
    }
  }

  function validateField(fieldName) {
    const input = document.getElementById(fieldName);
    const error = validators[fieldName](input.value);
    setFieldError(fieldName, error);
    return !error;
  }

  Object.keys(validators).forEach(fieldName => {
    const input = document.getElementById(fieldName);
    input.addEventListener('blur', () => validateField(fieldName));
    input.addEventListener('input', () => {
      if (input.closest('.form-group').classList.contains('has-error')) {
        validateField(fieldName);
      }
    });
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fieldNames = Object.keys(validators);
    const results = fieldNames.map(validateField);
    const isValid = results.every(Boolean);

    if (!isValid) {
      const firstInvalid = contactForm.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const name = document.getElementById('name').value.trim();

    showToast('Enquiry Sent', `Thank you, ${name.split(' ')[0]} — our team will be in touch shortly.`);
    contactForm.reset();
    fieldNames.forEach(fieldName => setFieldError(fieldName, ''));
  });
  }

});
