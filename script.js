const loader = document.getElementById('loader');
const cursor = document.querySelector('.cursor-dot');
const revealItems = document.querySelectorAll('.reveal');
const mapButtons = document.querySelectorAll('.map-marker');
const mapTitle = document.getElementById('mapTitle');
const mapSummary = document.getElementById('mapSummary');
const mapPartner = document.getElementById('mapPartner');
const filterButtons = document.querySelectorAll('.filter-pill');
const writingCards = document.querySelectorAll('.writing-card');
const counters = document.querySelectorAll('.counter');
const commandMenu = document.getElementById('commandMenu');
const commandTrigger = document.querySelector('.command-trigger');
const commandClose = document.querySelector('.command-close');
const commandBackdrop = document.querySelector('.command-menu__backdrop');
const mobileNav = document.getElementById('mobileNav');
const mobileToggle = document.querySelector('.menu-toggle');
const themeToggle = document.getElementById('themeToggle');
// Hero slider elements
const heroSlider = document.querySelector('.hero-slider__track');
const heroSlides = document.querySelectorAll('.hero-slide');
const heroPrev = document.querySelector('.hero-slider__prev');
const heroNext = document.querySelector('.hero-slider__next');
const heroDotsWrap = document.querySelector('.hero-slider__dots');
const heroFrame = document.querySelector('.hero-slider__frame');
const heroProgressBar = document.querySelector('.hero-slider__progress span');
const heroSliderStatus = document.getElementById('heroSliderStatus');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let heroIndex = 0;
let heroTimer = null;
const testimonialCards = document.querySelectorAll('.testimonial-card');
const prevTestimonial = document.querySelector('.testimonial-prev');
const nextTestimonial = document.querySelector('.testimonial-next');
const galleryCards = document.querySelectorAll('.gallery-card');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const newsletterForm = document.getElementById('newsletterForm');
const contactForm = document.getElementById('contactForm');
const newsletterMessage = document.getElementById('newsletterMessage');
const contactMessage = document.getElementById('contactMessage');
let testimonialIndex = 0;

window.addEventListener('load', () => {
  loader?.classList.add('is-hidden');
  setupTestimonials();
  setupGallery();
});

window.addEventListener('mousemove', (event) => {
  if (!cursor) return;
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
});

const scrollProgressBar = document.querySelector('#scrollProgress span');
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  document.querySelectorAll('.map-globe, .book-cover, .featured-story').forEach((item) => {
    item.style.transform = `translateY(${scrollY * 0.015}px)`;
  });

  if (scrollProgressBar) {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (scrollY / scrollable) * 100 : 0;
    scrollProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  backToTopButton?.classList.toggle('is-visible', scrollY > 600);
}, { passive: true });

backToTopButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

document.addEventListener('mousedown', () => {
  cursor?.classList.add('is-down');
});

document.addEventListener('mouseup', () => {
  cursor?.classList.remove('is-down');
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      if (entry.target.id === 'impact') {
        animateCounters();
      }
    }
  });
}, { threshold: 0.16 });

const motionItems = document.querySelectorAll('.story-card, .media-card, .counter-card, .writing-card');
motionItems.forEach((item, index) => {
  item.animate(
    [
      { transform: 'translateY(16px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ],
    {
      duration: 600,
      delay: index * 40,
      fill: 'forwards',
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
    }
  );
});

revealItems.forEach((item) => observer.observe(item));

mapButtons.forEach((button) => {
  button.addEventListener('click', () => {
    mapButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    if (mapTitle) mapTitle.textContent = button.dataset.country || 'Investigation';
    if (mapSummary) mapSummary.textContent = button.dataset.summary || 'Select a region to learn more.';
    if (mapPartner) mapPartner.textContent = `Media Partner: ${button.dataset.partner || 'BBC'}`;
  });
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter || 'all';
    filterButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');

    writingCards.forEach((card) => {
      const cardFilter = card.dataset.publication || 'all';
      card.classList.toggle('is-hidden', filter !== 'all' && cardFilter !== filter);
    });
  });
});

function setupTestimonials() {
  if (!testimonialCards.length) return;
  const showTestimonial = (index) => {
    testimonialCards.forEach((card, cardIndex) => card.classList.toggle('is-active', cardIndex === index));
    testimonialIndex = (index + testimonialCards.length) % testimonialCards.length;
  };
  prevTestimonial?.addEventListener('click', () => showTestimonial(testimonialIndex - 1));
  nextTestimonial?.addEventListener('click', () => showTestimonial(testimonialIndex + 1));
  setInterval(() => showTestimonial(testimonialIndex + 1), 6000);
  showTestimonial(0);
}

function setupGallery() {
  galleryCards.forEach((card) => {
    const image = card.dataset.image;
    const preview = card.querySelector('.gallery-card__image');
    if (preview && image) {
      preview.style.setProperty('--image', `url('${image}')`);
    }
    card.addEventListener('click', () => {
      lightboxImage.src = image;
      lightbox?.classList.add('is-open');
      lightbox?.setAttribute('aria-hidden', 'false');
    });
  });
}

function openCommandMenu() {
  commandMenu?.classList.add('is-open');
  commandMenu?.setAttribute('aria-hidden', 'false');
}

function createHeroDots() {
  if (!heroDotsWrap || heroSlides.length < 2) return;
  heroSlides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', () => { goToHero(i); startHeroAutoplay(); });
    heroDotsWrap.appendChild(b);
  });
  updateHeroDots();
}

function updateHeroDots() {
  if (!heroDotsWrap) return;
  Array.from(heroDotsWrap.children).forEach((btn, i) => {
    btn.classList.toggle('is-active', i === heroIndex);
    btn.setAttribute('aria-selected', i === heroIndex ? 'true' : 'false');
  });
}

function updateHeroSlideState() {
  heroSlides.forEach((slide, i) => {
    const isActive = i === heroIndex;
    slide.classList.toggle('is-active', isActive);
    slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  });
}

function announceHeroSlide() {
  if (!heroSliderStatus) return;
  const activeSlide = heroSlides[heroIndex];
  const title = activeSlide?.querySelector('.hero-slide__tag')?.textContent || `Slide ${heroIndex + 1}`;
  heroSliderStatus.textContent = `Slide ${heroIndex + 1} of ${heroSlides.length}: ${title}`;
}

function goToHero(i) {
  heroIndex = (i + heroSlides.length) % heroSlides.length;
  if (heroSlider) heroSlider.style.transform = `translateX(-${heroIndex * 100}%)`;
  updateHeroDots();
  updateHeroSlideState();
  announceHeroSlide();
}

function nextHero() { goToHero(heroIndex + 1); }
function prevHero() { goToHero(heroIndex - 1); }

function restartHeroProgress() {
  if (!heroProgressBar) return;
  heroProgressBar.classList.remove('is-running', 'is-paused');
  // force reflow so the width/animation keyframe restarts from zero
  void heroProgressBar.offsetWidth;
  heroProgressBar.classList.add('is-running');
}

function startHeroAutoplay() {
  stopHeroAutoplay();
  if (prefersReducedMotion || heroSlides.length < 2) return;
  heroTimer = setInterval(nextHero, 5000);
  restartHeroProgress();
}

function stopHeroAutoplay() {
  if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
  heroProgressBar?.classList.add('is-paused');
}

if (heroNext) heroNext.addEventListener('click', () => { nextHero(); startHeroAutoplay(); });
if (heroPrev) heroPrev.addEventListener('click', () => { prevHero(); startHeroAutoplay(); });
if (heroSlider) {
  heroSlider.addEventListener('mouseenter', stopHeroAutoplay);
  heroSlider.addEventListener('mouseleave', startHeroAutoplay);
}

// Keyboard navigation when the slider frame has focus
heroFrame?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    nextHero();
    startHeroAutoplay();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    prevHero();
    startHeroAutoplay();
  }
});
heroFrame?.addEventListener('focusin', stopHeroAutoplay);
heroFrame?.addEventListener('focusout', startHeroAutoplay);

// Pause autoplay while the tab isn't visible, resume when it is
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopHeroAutoplay();
  else startHeroAutoplay();
});

createHeroDots();
updateHeroSlideState();
startHeroAutoplay();
// Lazy-load hero images when slide becomes active or adjacent
function loadHeroImage(index) {
  const slide = heroSlides[index];
  if (!slide) return;
  const img = slide.querySelector('img.hero-img');
  if (!img) return;
  if (img.dataset.loaded) return;
  const src = img.dataset.src;
  const srcset = img.dataset.srcset;
  if (srcset) img.srcset = srcset;
  if (src) img.src = src;
  img.dataset.loaded = 'true';
}

function ensureHeroImages(i) {
  loadHeroImage(i);
  loadHeroImage((i + 1) % heroSlides.length);
  loadHeroImage((i - 1 + heroSlides.length) % heroSlides.length);
}

// initial load
ensureHeroImages(heroIndex);

// update images when slide changes
const originalGoToHero = goToHero;
goToHero = function(i) {
  originalGoToHero(i);
  ensureHeroImages(heroIndex);
};

// Touch / momentum swipe support for hero slider (velocity-sensitive)
(() => {
  const frame = document.querySelector('.hero-slider__frame');
  if (!frame || !heroSlider) return;
  let dragging = false;
  let startX = 0;
  let lastX = 0;
  let lastT = 0;
  const samples = [];

  const frameWidth = () => frame.clientWidth || frame.getBoundingClientRect().width;

  const setSliderX = (x, animate = true, duration = 0.48) => {
    if (animate) gsap.to(heroSlider, { x, duration, ease: 'power4.out' });
    else gsap.set(heroSlider, { x });
  };

  const getCurrentX = () => {
    const style = window.getComputedStyle(heroSlider);
    const matrix = style.transform || '';
    if (matrix && matrix !== 'none') {
      const values = matrix.match(/matrix\(([^)]+)\)/);
      if (values && values[1]) {
        const parts = values[1].split(',');
        return parseFloat(parts[4]);
      }
    }
    return 0;
  };

  frame.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    lastX = startX;
    lastT = e.timeStamp;
    samples.length = 0;
    samples.push({ x: startX, t: lastT });
    frame.setPointerCapture(e.pointerId);
    stopHeroAutoplay();
  });

  frame.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const cur = getCurrentX();
    const next = cur + dx;
    gsap.set(heroSlider, { x: next });
    lastX = e.clientX;
    lastT = e.timeStamp;
    samples.push({ x: lastX, t: lastT });
    if (samples.length > 6) samples.shift();
  });

  frame.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    frame.releasePointerCapture(e.pointerId);

    if (samples.length >= 2) {
      const first = samples[0];
      const last = samples[samples.length - 1];
      const velocity = (last.x - first.x) / (last.t - first.t || 1); // px per ms
      const pxPerSecond = velocity * 1000; // px/s

      const thresholdPx = 50; // distance threshold
      const slideW = frameWidth();
      const curX = getCurrentX();
      const rawIndex = -curX / slideW;
      let targetIndex = Math.round(rawIndex);

      const delta = e.clientX - startX;
      if (Math.abs(pxPerSecond) > 600 || Math.abs(delta) > thresholdPx) {
        if (pxPerSecond < 0 || delta < 0) targetIndex = Math.ceil(rawIndex + 0.4);
        else targetIndex = Math.floor(rawIndex - 0.4);
      }

      targetIndex = Math.max(0, Math.min(heroSlides.length - 1, targetIndex));
      heroIndex = targetIndex;
      const targetX = -targetIndex * slideW;
      const duration = Math.min(0.8, Math.max(0.28, Math.abs(pxPerSecond) > 0 ? 0.35 : 0.45));
      setSliderX(targetX, true, duration);
      updateHeroDots();
      ensureHeroImages(heroIndex);
    } else {
      const slideW = frameWidth();
      const targetX = -heroIndex * slideW;
      setSliderX(targetX, true, 0.36);
    }

    startHeroAutoplay();
  });

  frame.addEventListener('pointercancel', () => {
    dragging = false;
    const slideW = frameWidth();
    const targetX = -heroIndex * slideW;
    setSliderX(targetX, true, 0.36);
    startHeroAutoplay();
  });

  window.addEventListener('resize', () => {
    const slideW = frameWidth();
    const targetX = -heroIndex * slideW;
    gsap.set(heroSlider, { x: targetX });
  });
})();

function closeCommandMenu() {
  commandMenu?.classList.remove('is-open');
  commandMenu?.setAttribute('aria-hidden', 'true');
}

commandTrigger?.addEventListener('click', openCommandMenu);
commandClose?.addEventListener('click', closeCommandMenu);
commandBackdrop?.addEventListener('click', closeCommandMenu);

function toggleMobileNav() {
  mobileNav?.classList.toggle('is-open');
  mobileNav?.setAttribute('aria-hidden', mobileNav.classList.contains('is-open') ? 'false' : 'true');
}

mobileToggle?.addEventListener('click', toggleMobileNav);
mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => mobileNav.classList.remove('is-open')));

function updateThemeToggle() {
  const isLight = document.body.classList.contains('light-mode');
  if (!themeToggle) return;
  themeToggle.textContent = isLight ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
}

function setTheme(isLight) {
  document.body.classList.toggle('light-mode', isLight);
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  updateThemeToggle();
}

themeToggle?.addEventListener('click', () => {
  const nextTheme = !document.body.classList.contains('light-mode');
  setTheme(nextTheme);
});

const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'light') setTheme(true);
else if (storedTheme === 'dark') setTheme(false);
else updateThemeToggle();

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeCommandMenu();
    mobileNav?.classList.remove('is-open');
    mobileNav?.setAttribute('aria-hidden', 'true');
    lightbox?.classList.remove('is-open');
    lightbox?.setAttribute('aria-hidden', 'true');
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    commandMenu?.classList.contains('is-open') ? closeCommandMenu() : openCommandMenu();
  }
});

newsletterForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = newsletterForm.querySelector('input');
  if (input?.value) {
    newsletterMessage.textContent = 'Thank you for subscribing to the editorial dispatch.';
    newsletterForm.reset();
  }
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  contactMessage.textContent = 'Your inquiry has been received. I will respond directly.';
  contactForm.reset();
});

lightbox?.addEventListener('click', () => {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
});

function animateCounters() {
  counters.forEach((counter, index) => {
    const target = Number(counter.dataset.target || 0);
    const duration = 1100 + index * 80;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      counter.textContent = value.toString();
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  });
}

// GSAP motion polish: hero entry, avatar pop, and scroll parallax
try {
  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    const heroEl = document.querySelector('.hero');
    const heroCard = document.querySelector('.hero__card');
    const heroContent = document.querySelector('.hero__content');

    // Hero card entry
    gsap.from(heroCard, {
      opacity: 0,
      y: 28,
      duration: 1,
      ease: 'power3.out'
    });

    // Staggered content reveal
    if (heroContent) {
      gsap.from(heroContent.querySelectorAll('h1, p, .hero__actions, .hero__narrative, .stats-grid'), {
        y: 18,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        delay: 0.28,
        ease: 'power3.out'
      });
    }

    // Subtle parallax on decorative layers
    gsap.to('.hero__glow', {
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: heroEl || '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to('.hero__signal--one', {
      y: -18,
      rotation: -6,
      ease: 'none',
      scrollTrigger: {
        trigger: heroEl || '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to('.hero__signal--two', {
      y: 22,
      rotation: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: heroEl || '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Slight scale of hero card during scroll to add depth
    if (heroCard) {
      gsap.to(heroCard, {
        scale: 1.02,
        ease: 'none',
        scrollTrigger: {
          trigger: heroEl || '.hero',
          start: 'top top',
          end: '+=320',
          scrub: 0.6
        }
      });
    }
  }
} catch (e) {
  // fail gracefully if GSAP isn't available
  console.warn('GSAP motion init failed', e);
}
