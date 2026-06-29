/**
 * AMANA Fresh Flowers — Premium Link-in-Bio
 * script.js | Vanilla JavaScript
 * ============================================================
 * Features:
 *  - Smooth page load entrance sequence
 *  - Scroll-reveal animations for feature cards
 *  - Button ripple effect on click
 *  - Floating scroll-to-top button visibility
 *  - Scroll progress indicator
 *  - Badge stagger animation on load
 * ============================================================
 */

'use strict';

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

/**
 * Debounce a function call
 * @param {Function} fn - function to debounce
 * @param {number} delay - milliseconds
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Check if an element is within the viewport
 * @param {HTMLElement} el
 * @param {number} offset - px offset from bottom of viewport
 */
function isInViewport(el, offset = 80) {
  const rect = el.getBoundingClientRect();
  return rect.top <= (window.innerHeight - offset);
}

/* ============================================================
   1. SCROLL REVEAL — Feature Cards
   ============================================================ */

/**
 * Observe feature cards and reveal them as they enter the viewport.
 * Uses IntersectionObserver when available, falls back to scroll event.
 */
function initScrollReveal() {
  const cards = document.querySelectorAll('.feature-card');
  if (!cards.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger each card slightly for a cascade effect
            const delay = parseInt(entry.target.dataset.revealDelay || '0', 10);
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    cards.forEach((card, i) => {
      // Assign stagger delay as a data attribute
      card.dataset.revealDelay = String(i * 80);
      observer.observe(card);
    });

  } else {
    // Fallback: scroll event
    function revealOnScroll() {
      cards.forEach((card, i) => {
        if (isInViewport(card) && !card.classList.contains('revealed')) {
          setTimeout(() => card.classList.add('revealed'), i * 80);
        }
      });
    }
    window.addEventListener('scroll', debounce(revealOnScroll, 50), { passive: true });
    revealOnScroll(); // Run once on load
  }
}

/* ============================================================
   2. RIPPLE EFFECT — Action Buttons
   ============================================================ */

/**
 * Attach ripple click effect to all action buttons.
 * Creates an expanding circle from the click point.
 */
function initRippleEffect() {
  const buttons = document.querySelectorAll('.action-btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const ripple = this.querySelector('.btn-ripple');
      if (!ripple) return;

      // Get click position relative to button
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const diameter = Math.max(rect.width, rect.height) * 2;

      // Reset and trigger ripple
      ripple.style.left   = `${x}px`;
      ripple.style.top    = `${y}px`;
      ripple.style.width  = '0px';
      ripple.style.height = '0px';
      ripple.style.opacity = '1';

      // Force reflow so transition triggers
      void ripple.offsetWidth;

      ripple.style.width   = `${diameter}px`;
      ripple.style.height  = `${diameter}px`;
      ripple.style.opacity = '0';
    });
  });
}

/* ============================================================
   3. SCROLL-TO-TOP BUTTON
   ============================================================ */

/**
 * Show/hide the scroll-to-top button based on scroll position.
 * Smooth scroll to top when clicked.
 */
function initScrollTop() {
  const btn = document.getElementById('scroll-top-btn');
  if (!btn) return;

  const SHOW_THRESHOLD = 400; // px from top

  // Visibility toggle
  function toggleScrollTopBtn() {
    if (window.scrollY > SHOW_THRESHOLD) {
      btn.style.display = 'flex';
    } else {
      btn.style.display = 'none';
    }
  }

  window.addEventListener('scroll', debounce(toggleScrollTopBtn, 80), { passive: true });

  // Scroll to top on click
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Initial check
  toggleScrollTopBtn();
}

/* ============================================================
   4. BADGE STAGGER ANIMATION
   ============================================================ */

/**
 * Animate category badges with a staggered entrance after page load.
 */
function initBadgeStagger() {
  const badges = document.querySelectorAll('.badge');

  badges.forEach((badge, i) => {
    // Initially hidden via inline style; CSS opacity still 0 from animation
    badge.style.opacity = '0';
    badge.style.transform = 'translateY(12px) scale(0.95)';
    badge.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';

    setTimeout(() => {
      badge.style.opacity = '1';
      badge.style.transform = 'translateY(0) scale(1)';
    }, 700 + i * 80); // Start after hero animations
  });
}

/* ============================================================
   5. SCROLL PROGRESS INDICATOR
   ============================================================ */

/**
 * Create and update a thin progress bar at the top of the page
 * that reflects how far the user has scrolled.
 */
function initScrollProgress() {
  // Create progress bar element
  const bar = document.createElement('div');
  bar.id = 'scroll-progress-bar';
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    width: 0%;
    background: linear-gradient(90deg, #2E7D32, #66BB6A, #D4AF37);
    z-index: 9999;
    transition: width 0.1s ease;
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px rgba(212,175,55,0.5);
  `;
  document.body.appendChild(bar);

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(pct, 100)}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress(); // Initial state
}

/* ============================================================
   6. FLOATING BUTTON TOOLTIP
   ============================================================ */

/**
 * Add a small animated tooltip to the floating WhatsApp button
 * that appears briefly on page load to draw attention.
 */
function initFloatingButtonTooltip() {
  const floatingBtn = document.querySelector('.floating-wa');
  if (!floatingBtn) return;

  // Create tooltip
  const tooltip = document.createElement('span');
  tooltip.textContent = 'Order Now!';
  tooltip.setAttribute('aria-hidden', 'true');
  tooltip.style.cssText = `
    position: absolute;
    right: 70px;
    top: 50%;
    transform: translateY(-50%);
    background: #1B5E20;
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    white-space: nowrap;
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  // Arrow for tooltip
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.style.cssText = `
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 6px solid #1B5E20;
  `;
  tooltip.appendChild(arrow);
  floatingBtn.appendChild(tooltip);

  // Show tooltip after a brief delay, then hide
  setTimeout(() => {
    tooltip.style.opacity = '1';
    setTimeout(() => {
      tooltip.style.opacity = '0';
    }, 3000);
  }, 2500);

  // Show tooltip on hover
  floatingBtn.addEventListener('mouseenter', () => {
    tooltip.style.opacity = '1';
  });
  floatingBtn.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
  });
}

/* ============================================================
   7. LOGO CLICK EASTER EGG
   ============================================================ */

/**
 * Fun easter egg: clicking the logo cycles through emoji confetti
 */
function initLogoEasterEgg() {
  const logoCircle = document.querySelector('.logo-circle');
  if (!logoCircle) return;

  const emojis = ['🌸', '🍎', '🥦', '🌿', '⭐', '🌾', '🥜', '💚', '🌺', '🍊'];
  let count = 0;

  logoCircle.style.cursor = 'pointer';

  logoCircle.addEventListener('click', function () {
    // Pop confetti emoji near the logo
    const wrapper = document.querySelector('.logo-wrapper');
    if (!wrapper) return;

    for (let i = 0; i < 6; i++) {
      const emoji = document.createElement('span');
      emoji.textContent = emojis[(count + i) % emojis.length];
      emoji.setAttribute('aria-hidden', 'true');
      emoji.style.cssText = `
        position: absolute;
        font-size: 1.4rem;
        pointer-events: none;
        z-index: 10;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: emojiPop 1s ease-out forwards;
        --tx: ${(Math.random() - 0.5) * 160}px;
        --ty: ${-(Math.random() * 120 + 40)}px;
      `;
      wrapper.appendChild(emoji);
      setTimeout(() => emoji.remove(), 1000);
    }
    count += 6;
  });

  // Inject emoji animation keyframes
  if (!document.getElementById('emoji-pop-style')) {
    const style = document.createElement('style');
    style.id = 'emoji-pop-style';
    style.textContent = `
      @keyframes emojiPop {
        0%   { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
        60%  { opacity: 1; transform: translate(calc(-50% + var(--tx, 0px)), calc(-50% + var(--ty, -60px))) scale(1.2); }
        100% { opacity: 0; transform: translate(calc(-50% + var(--tx, 0px)), calc(-50% + var(--ty, -80px))) scale(0.5); }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ============================================================
   8. PAGE LOAD INIT
   ============================================================ */

/**
 * Main initializer — runs when DOM is ready.
 * Coordinates all feature initializations.
 */
function init() {
  initScrollReveal();
  initRippleEffect();
  initScrollTop();
  initBadgeStagger();
  initScrollProgress();
  initFloatingButtonTooltip();
  initLogoEasterEgg();

  // Log a friendly message in the console
  console.log(
    '%c🌿 AMANA Fresh Flowers %c| Premium Link-in-Bio\n%cFresh Fruits • Vegetables • Flowers • Indian Grocery',
    'color:#2E7D32; font-size:16px; font-weight:800;',
    'color:#D4AF37; font-size:14px; font-weight:600;',
    'color:#5A7A5A; font-size:12px;'
  );
}

/* ── Boot ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM already parsed (deferred script)
  init();
}
