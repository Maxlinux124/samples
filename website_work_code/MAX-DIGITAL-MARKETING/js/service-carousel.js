(() => {
    'use strict';

    /*
     * ============================================================
     * MAX DIGITAL MARKETING
     * SECTION 02 — NEURAL 3D SLIDING SERVICE CAROUSEL
     * ------------------------------------------------------------
     * Controller only: the cards themselves are rendered by PHP.
     * This script just writes CSS custom properties (--sv-x,
     * --sv-scale, --sv-ry, --sv-op, --sv-blur, --sv-z) so every
     * transition stays on the compositor and never touches the
     * Brain render loop.
     * ============================================================
     */

    const root = document.querySelector('[data-service-carousel]');

    if (!root) {
        return;
    }

    const stage = root.querySelector('[data-carousel-stage]');
    const cards = Array.from(root.querySelectorAll('[data-carousel-card]'));
    const prevButton = root.querySelector('[data-carousel-prev]');
    const nextButton = root.querySelector('[data-carousel-next]');
    const currentLabel = root.querySelector('[data-carousel-current]');

    if (!stage || cards.length < 2) {
        return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const total = cards.length;
    const half = Math.floor(total / 2);

    /*
     * 4-5s between automatic advances, then a shorter pause before
     * autoplay quietly resumes after the user has interacted.
     */
    const AUTOPLAY_DELAY = 4600;
    const RESUME_DELAY = 4200;
    const DRAG_THRESHOLD = 62;

    const numbers = cards.map((card) => {
        const count = card.querySelector('.services-carousel__count');

        return count ? count.textContent.trim() : '';
    });

    let activeIndex = 0;
    let autoplayTimer = 0;
    let resumeTimer = 0;

    let sectionVisible = false;
    let hovering = false;
    let focused = false;

    let dragging = false;
    let pointerId = null;
    let dragStartX = 0;
    let dragDelta = 0;
    let suppressClickUntil = 0;

    let lastWidth = window.innerWidth;

    /*
     * Depth layout tables — FIVE-CARD COMPOSITION
     * ---------------------------------------------------------
     *   offset 0    ACTIVE centre card
     *   offset 1    NEAR  left / right  — fully visible, still readable
     *   offset 2    FAR   left / right  — partially visible, so the
     *                                     sides clearly say "more exist"
     *   offset 3+   hidden, so ten cards can never pile into a stack
     *
     * Per entry:
     *   x            horizontal offset as a % of the card's OWN width,
     *                so the whole curve scales with the card instead of
     *                with the viewport
     *   scale / ry / tz   depth — shrink, Y-rotation, real Z push-back
     *   op / blur         recession — fade and softness
     *
     * `x` and `ry` are multiplied by the signed card offset, so the left
     * and right sides mirror automatically. The values are tuned so each
     * neighbouring card keeps genuine breathing space instead of hiding
     * underneath the card in front of it.
     */
    const LAYOUT_DESKTOP = [
        { x: 0, scale: 1.00, ry: 0, tz: 0, op: 1.00, blur: 0 },
        { x: 100, scale: 0.87, ry: 18, tz: -70, op: 0.80, blur: 0.2 },
        { x: 167, scale: 0.76, ry: 28, tz: -160, op: 0.42, blur: 0.8 },
        { x: 185, scale: 0.66, ry: 32, tz: -200, op: 0, blur: 1.2 }
    ];

    const LAYOUT_TABLET = [
        { x: 0, scale: 1.00, ry: 0, tz: 0, op: 1.00, blur: 0 },
        { x: 97, scale: 0.70, ry: 18, tz: -60, op: 0.74, blur: 0.3 },
        { x: 150, scale: 0.62, ry: 28, tz: -140, op: 0.36, blur: 0.9 },
        { x: 166, scale: 0.54, ry: 32, tz: -180, op: 0, blur: 1.2 }
    ];

    /*
     * Mobile is a THREE-card composition on purpose:
     *
     *     [ partial ]  [ ACTIVE CARD ]  [ partial ]
     *
     * Only the near pair is shown, so five cards are never squeezed
     * across a phone screen. The neighbours stay tucked slightly behind
     * the active card and slide in as the active service changes.
     */
    const LAYOUT_MOBILE = [
        { x: 0, scale: 1.00, ry: 0, tz: 0, op: 1.00, blur: 0 },
        { x: 100, scale: 0.80, ry: 14, tz: -40, op: 0.66, blur: 0.2 },
        { x: 110, scale: 0.68, ry: 20, tz: -90, op: 0, blur: 1.0 },
        { x: 124, scale: 0.62, ry: 22, tz: -120, op: 0, blur: 1.2 }
    ];

    /* Breakpoints deliberately match the CSS: <=600 mobile, <=1100 tablet. */
    function getLayout() {
        if (window.innerWidth <= 600) {
            return LAYOUT_MOBILE;
        }

        if (window.innerWidth <= 1100) {
            return LAYOUT_TABLET;
        }

        return LAYOUT_DESKTOP;
    }

    /*
     * Shortest signed distance from the active card, so the carousel
     * loops in both directions with no snap and no duplicated state.
     */
    function getOffset(index) {
        let offset = index - activeIndex;

        if (offset > half) {
            offset -= total;
        }

        if (offset < -half) {
            offset += total;
        }

        return offset;
    }

    function render() {
        const layout = getLayout();
        const deepest = layout.length - 1;

        cards.forEach((card, index) => {
            const offset = getOffset(index);
            const distance = Math.min(Math.abs(offset), deepest);
            const step = layout[distance];
            const direction = offset === 0 ? 0 : (offset > 0 ? 1 : -1);
            const isActive = offset === 0;

            card.style.setProperty('--sv-x', String(step.x * direction));
            card.style.setProperty('--sv-scale', String(step.scale));
            card.style.setProperty('--sv-ry', String(step.ry * direction));
            card.style.setProperty('--sv-tz', String(step.tz));
            card.style.setProperty('--sv-op', String(step.op));
            card.style.setProperty('--sv-blur', step.blur + 'px');
            card.style.setProperty('--sv-z', String(50 - distance * 10));

            card.classList.toggle('is-active', isActive);

            /* Only cards the user can actually see stay clickable. */
            card.classList.toggle('is-near', distance <= 2);

            card.setAttribute('aria-hidden', isActive ? 'false' : 'true');

            const link = card.querySelector('[data-carousel-link]');

            if (link) {
                if (isActive) {
                    link.removeAttribute('tabindex');
                } else {
                    link.setAttribute('tabindex', '-1');
                }
            }
        });

        if (currentLabel) {
            currentLabel.textContent = numbers[activeIndex]
                || String(activeIndex + 1).padStart(2, '0');
        }
    }

    function setActive(index) {
        activeIndex = ((index % total) + total) % total;
        render();
    }

    /* ============================================================
       AUTOPLAY — subtle, and always yields to the user
       ============================================================ */

    function stopAutoplay() {
        window.clearTimeout(autoplayTimer);
        autoplayTimer = 0;
    }

    function canAutoplay() {
        return !reducedMotion.matches
            && sectionVisible
            && !document.hidden
            && !hovering
            && !focused
            && !dragging;
    }

    function startAutoplay() {
        stopAutoplay();

        if (!canAutoplay()) {
            return;
        }

        autoplayTimer = window.setTimeout(() => {
            if (!canAutoplay()) {
                return;
            }

            setActive(activeIndex + 1);
            startAutoplay();
        }, AUTOPLAY_DELAY);
    }

    /*
     * Called after any deliberate interaction: the carousel goes
     * quiet for a moment, then resumes on its own.
     */
    function deferAutoplay() {
        window.clearTimeout(autoplayTimer);
        window.clearTimeout(resumeTimer);

        autoplayTimer = 0;

        resumeTimer = window.setTimeout(startAutoplay, RESUME_DELAY);
    }

    /* ============================================================
       DRAG / SWIPE
       ============================================================ */

    function endDrag() {
        if (!dragging) {
            return;
        }

        dragging = false;

        stage.classList.remove('is-dragging');

        if (pointerId !== null && stage.releasePointerCapture) {
            try {
                stage.releasePointerCapture(pointerId);
            } catch (error) {
                /* pointer capture already released */
            }
        }

        pointerId = null;

        /* Release the ring; the cards reposition at the same time. */
        stage.style.setProperty('--sv-drag', '0px');

        if (Math.abs(dragDelta) > 12) {
            suppressClickUntil = Date.now() + 380;
        }

        if (dragDelta <= -DRAG_THRESHOLD) {
            setActive(activeIndex + 1);
        } else if (dragDelta >= DRAG_THRESHOLD) {
            setActive(activeIndex - 1);
        }

        dragDelta = 0;

        deferAutoplay();
    }

    stage.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        dragging = true;
        pointerId = event.pointerId;
        dragStartX = event.clientX;
        dragDelta = 0;

        stage.classList.add('is-dragging');

        stopAutoplay();

        if (stage.setPointerCapture) {
            try {
                stage.setPointerCapture(pointerId);
            } catch (error) {
                /* pointer capture unsupported */
            }
        }
    });

    stage.addEventListener('pointermove', (event) => {
        if (!dragging || event.pointerId !== pointerId) {
            return;
        }

        dragDelta = event.clientX - dragStartX;

        stage.style.setProperty('--sv-drag', (dragDelta * 0.85) + 'px');
    });

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    /*
     * A finished drag must never be read as a click, and a click on a
     * side card brings that card to the centre.
     */
    stage.addEventListener('click', (event) => {
        if (Date.now() < suppressClickUntil) {
            event.preventDefault();
            event.stopPropagation();

            return;
        }

        const card = event.target.closest('[data-carousel-card]');

        if (!card || card.classList.contains('is-active')) {
            return;
        }

        const index = cards.indexOf(card);

        if (index === -1) {
            return;
        }

        setActive(activeIndex + getOffset(index));
        deferAutoplay();
    }, true);


    /* ============================================================
       PREVIOUS / NEXT + KEYBOARD
       ============================================================ */

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            setActive(activeIndex - 1);
            deferAutoplay();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            setActive(activeIndex + 1);
            deferAutoplay();
        });
    }

    stage.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();

            setActive(activeIndex - 1);
            deferAutoplay();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();

            setActive(activeIndex + 1);
            deferAutoplay();
        }
    });

    /* ============================================================
       PAUSE / RESUME
       ============================================================ */

    root.addEventListener('pointerenter', () => {
        hovering = true;

        stopAutoplay();
    });

    root.addEventListener('pointerleave', () => {
        hovering = false;

        startAutoplay();
    });

    root.addEventListener('focusin', () => {
        focused = true;

        stopAutoplay();
    });

    root.addEventListener('focusout', () => {
        focused = false;

        startAutoplay();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });

    if (typeof reducedMotion.addEventListener === 'function') {
        reducedMotion.addEventListener('change', startAutoplay);
    }

    /* ============================================================
       RESIZE — the depth table itself is width dependent
       ============================================================ */

    let resizeTimer = 0;

    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);

        resizeTimer = window.setTimeout(() => {
            if (window.innerWidth === lastWidth) {
                return;
            }

            lastWidth = window.innerWidth;

            render();
        }, 150);
    }, { passive: true });

    /* ============================================================
       INITIALISE
       ============================================================ */

    if ('IntersectionObserver' in window) {
        /*
         * Autoplay only runs while Section 02 is genuinely on screen,
         * so it can never advance behind the user's back.
         */
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                sectionVisible = entry.isIntersecting;
            });

            if (sectionVisible) {
                startAutoplay();
            } else {
                stopAutoplay();
            }
        }, { threshold: 0.35 });

        observer.observe(root);
    } else {
        sectionVisible = true;
    }

    render();

    /* Transitions switch on only after the very first paint. */
    window.requestAnimationFrame(() => {
        root.classList.add('is-ready');
    });

    startAutoplay();
})();

