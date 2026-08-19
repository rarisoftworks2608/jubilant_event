'use strict';

document.addEventListener('DOMContentLoaded', () => {

  document.body.classList.add('loaded');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

    if (!navLinksEl.classList.contains('mobile-active')) {
      const scrollingDown = scrollY > lastScrollY;
      navbar.classList.toggle('nav-hidden', scrollingDown && scrollY > 220);
    }
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

  /* ---------------- Custom cursor ---------------- */
  if (finePointer && !prefersReducedMotion) {
    document.body.classList.add('custom-cursor-active');

    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    }, { passive: true });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);

    const hoverTargets = 'a, button, .service-card, .feature-card, .project-card, .inventory-card, input, select, textarea';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) cursorRing.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) cursorRing.classList.remove('cursor-hover');
    });
  }

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

  /* ---------------- Active nav link on scroll ---------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinkMap = {};
  document.querySelectorAll('.nav-link').forEach(link => {
    navLinkMap[link.dataset.section] = link;
  });

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        Object.values(navLinkMap).forEach(l => l.classList.remove('active'));
        const activeLink = navLinkMap[entry.target.id];
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => navObserver.observe(section));

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));

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
      id: 'godrej-air-bangalore',
      title: 'Godrej Air — Bangalore',
      category: 'Product Launch',
      image: 'https://images.unsplash.com/photo-1560523160-754a9e25c68f?w=1000&q=80&auto=format&fit=crop',
      description: 'Product launch production for Godrej Air in Bangalore, engineered for a high-impact brand reveal.',
      tags: ['Product Launch', 'Production']
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

    Array.from(projectsGrid.children).forEach((child, i) => {
      child.style.transitionDelay = `${(i % 8) * 0.07}s`;
    });

    projectsGrid.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));
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

});
