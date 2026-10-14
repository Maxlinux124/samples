(() => {
    'use strict';

    /*
     * =========================================================
     * MAX DIGITAL MARKETING
     * SECTION ?f????s???,?? OUR WORK / 3D WEBSITE UNIVERSE CONTROLLER
     * ---------------------------------------------------------
     * WHAT THIS IS NOT
     *   Not a carousel. Not a ring. Not an orbit. Nothing revolves
     *   around a centre and nothing travels a path. The layout
     *   table below is a fixed, hand-tuned scatter in X/Y/Z ?f????s???,?? the
     *   world is already "there" when the page loads, and the only
     *   thing that ever moves is the CAMERA.
     *
     * RESPONSIBILITIES
     *   1. Write each panel's static layout (--pf-x/y/z/rx/ry/rz,
     *      --pf-dim, --pf-blur) exactly once, from the table.
     *   2. Drag  -> rotate the whole world (--pf-world-x/y) with
     *      inertia and friction.
     *   3. Mouse -> depth-weighted parallax on the world, plus a
     *      soft circular field (--pf-near) on nearby panels.
     *   4. Entry -> one slow camera settle (--pf-dolly). No
     *      per-card fly-in, no path, no choreography.
     *   5. Flag panels whose screenshot is missing.
     *
     * PERFORMANCE
     *   Every frame writes a fixed, small number of custom
     *   properties. There is no canvas, no library, no layout read
     *   inside the loop, and the loop self-cancels the moment the
     *   world comes to rest. It never touches the Brain.
     * =========================================================
     */

    const root = document.querySelector('[data-portfolio]');

    if (!root) {
        return;
    }

    const stage = root.querySelector('[data-portfolio-stage]');
    const universe = root.querySelector('[data-portfolio-universe]');
    const cards = Array.from(root.querySelectorAll('[data-portfolio-card]'));

    if (!stage || !universe || cards.length === 0) {
        return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    /*
     * ---------------------------------------------------------
     * LAYOUT TABLE ?f????s???,?? the universe
     * ---------------------------------------------------------
     * x / y  position as a % of the stage (so it scales with the
     *        viewport instead of being pinned to pixels)
     * z      REAL depth in px. Positive = toward the camera.
     *        The browser's perspective does the scaling from here,
     *        so a far panel is genuinely smaller, not scale()'d.
     * ry/rx  a little yaw/pitch so panels read as objects with
     *        faces, not billboards.
     * scale  a small extra multiplier for the hero panel only.
     *
     * Deliberately UNEVEN. The offsets are not mirrored and the
     * spacing is not regular, so the field reads as a scatter
     * rather than a grid or a mandala. Index 0 is the featured
     * project and sits nearest the middle.
     */
    const LAYOUT = [
        { x: 50.0, y: 50.0, z:   80, rx: -2, ry:   0, rz:   0, s: 1.12 }, // 0  CENTRE (featured)
        { x: 49.5, y: 19.0, z: -120, rx:  8, ry:   3, rz:  -1, s: 0.90 }, // 1  upper-centre
        { x: 16.0, y: 22.0, z:  -40, rx:  6, ry:  24, rz:  -2, s: 0.95 }, // 2  upper-left
        { x: 84.0, y: 19.0, z:  -90, rx: -7, ry: -26, rz:   2, s: 0.92 }, // 3  upper-right
        { x:  8.0, y: 51.0, z:  140, rx:  2, ry:  34, rz:  -1, s: 0.98 }, // 4  middle-left (near)
        { x: 92.0, y: 48.0, z:   30, rx: -3, ry: -32, rz:   1, s: 0.96 }, // 5  middle-right
        { x: 15.0, y: 80.0, z:  -50, rx:  5, ry:  22, rz:   2, s: 0.93 }, // 6  lower-left
        { x: 50.0, y: 82.0, z: -110, rx: -8, ry:   0, rz:   0, s: 0.89 }, // 7  lower-centre
        { x: 85.0, y: 79.0, z:  -20, rx:  4, ry: -24, rz:  -2, s: 0.94 }, // 8  lower-right
        { x: 30.0, y:  8.0, z: -300, rx: 11, ry:  16, rz:  -3, s: 0.80 }, // 9  far upper-left
        { x: 71.0, y:  8.0, z: -360, rx: -12, ry: -18, rz:  3, s: 0.78 }, // 10 far upper-right
        { x:  5.0, y: 33.0, z: -420, rx:   7, ry:  30, rz:  -2, s: 0.74 }, // 11 far left
        { x: 95.0, y: 67.0, z: -450, rx:  -8, ry: -30, rz:  2, s: 0.72 }, // 12 far right
        { x: 26.0, y: 93.0, z: -480, rx:  9, ry:  20, rz:  -3, s: 0.70 }, // 13 far lower-left
        { x: 75.0, y: 92.0, z: -510, rx: -10, ry: -22, rz:  3, s: 0.68 }  // 14 far lower-right
    ];
    /*
     * Depth ramp. The nearest panel is at LAYOUT[0].z; anything
     * further back is mapped onto 0..1 and drives both the dimming
     * and the softening. A single curve, so a panel can never end
     * up dark but sharp, or soft but bright.
     */
    const Z_NEAR = LAYOUT[0].z;
    const Z_FAR = LAYOUT[LAYOUT.length - 1].z;

    /* Drag sensitivity: degrees of world rotation per pixel. */
    const DRAG_Y = 0.055;
    const DRAG_X = 0.030;

    /* Inertia. */
    const FRICTION = 0.94;
    const MAX_SPIN = 26;

    /* Pointer parallax, in px of world offset at full deflection. */
    const PARALLAX_X = 34;
    const PARALLAX_Y = 22;

    /* Radius of the soft circular mouse field, as a share of the
       stage's smaller side. Deliberately generous but still soft. */
    const FIELD = 0.42;

    /* ---- state ---- */

    let worldY = 0;
    let worldX = 0;
    let spinY = 0;
    let spinX = 0;

    let dragging = false;
    let pointerId = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragWorldY = 0;
    let dragWorldX = 0;
    let dragDistance = 0;

    let mouseX = 0;
    let mouseY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let parallaxTX = 0;
    let parallaxTY = 0;

    let fieldX = -9999;
    let fieldY = -9999;

    let frameId = 0;
    let settled = true;
    let introduced = false;
    let introFrame = 0;
    let suppressClickUntil = 0;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    /* ---------------------------------------------------------
       APPLY THE LAYOUT
       Written once, up front. The universe is fully formed before
       the first paint completes ?f????s???,?? there is no assembly animation
       and nothing flies in.
       --------------------------------------------------------- */

    const panelState = cards.map((card, index) => {
        /*
         * If there are more cards than the table has rows (someone
         * adds a project), the extras are pushed further back and
         * spread out, so they still read as part of the field
         * instead of stacking on top of the featured panel.
         */
        const spec = LAYOUT[index] || (() => {
            const extra = index - LAYOUT.length + 1;

            return {
                x: 50 + (extra % 2 ? 1 : -1) * (8 + extra * 3),
                y: 50 + (Math.floor(extra / 2) % 2 ? 1 : -1) * (10 + extra * 4),
                z: Z_FAR - extra * 120,
                rx: 4,
                ry: extra % 2 ? 18 : -18,
                rz: 0,
                s: 0.5
            };
        })();

        const span = Math.max(1, Z_NEAR - Z_FAR);
        const depth01 = clamp((Z_NEAR - spec.z) / span, 0, 1);

        card.style.setProperty('--pf-x', spec.x + '%');
        card.style.setProperty('--pf-y', spec.y + '%');
        card.style.setProperty('--pf-z', spec.z + 'px');
        card.style.setProperty('--pf-rx', spec.rx + 'deg');
        card.style.setProperty('--pf-ry', spec.ry + 'deg');
        card.style.setProperty('--pf-rz', spec.rz + 'deg');
        card.style.setProperty('--pf-scale', String(spec.s));
        card.style.setProperty('--pf-dim', Math.pow(depth01, 1.15).toFixed(3));

        /*
         * Depth of field, capped low on purpose: the brief asks for
         * background panels to be *slightly* softer, and a heavy
         * blur would destroy the screenshot it exists to present.
         */
        card.style.setProperty('--pf-blur', (Math.pow(depth01, 1.6) * 2.1).toFixed(2) + 'px');

        /* Stagger the idle drift so the field never pulses together. */
        card.style.setProperty('--pf-float-delay', (-index * 0.9).toFixed(1) + 's');

        return { card, x: spec.x, y: spec.y, depth01 };
    });

    /* ---------------------------------------------------------
       THE LOOP
       One rAF for camera, inertia, parallax and the mouse field.
       It cancels itself the instant nothing is moving, so the
       section costs nothing once it has settled.
       --------------------------------------------------------- */

    function writeField() {
        const rect = stage.getBoundingClientRect();

        if (!rect.width || !rect.height) {
            return;
        }

        const radius = Math.min(rect.width, rect.height) * FIELD;

        for (const state of panelState) {
            if (state.card.hidden) {
                continue;
            }

            /*
             * Screen position from the panel's layout percentages.
             * Cheap, and accurate enough for a field this soft ??,????
             * no per-card getBoundingClientRect inside the loop.
             */
            const px = rect.left + (state.x / 100) * rect.width;
            const py = rect.top + (state.y / 100) * rect.height;

            const dx = fieldX - px;
            const dy = fieldY - py;
            const distance = Math.sqrt(dx * dx + dy * dy);

            /* Smooth falloff, exactly zero outside the radius. */
            const falloff = clamp(1 - distance / radius, 0, 1);

            state.card.style.setProperty(
                '--pf-near',
                (falloff * falloff * (3 - 2 * falloff)).toFixed(3)
            );
        }
    }

    function frame() {
        frameId = 0;

        let busy = false;

        /* --- drag inertia, world-level --- */
        if (!dragging) {
            if (Math.abs(spinY) > 0.01 || Math.abs(spinX) > 0.01) {
                worldY += spinY;
                worldX += spinX;

                spinY *= FRICTION;
                spinX *= FRICTION;

                busy = true;
            } else {
                spinY = 0;
                spinX = 0;
            }
        }

        /* --- pointer parallax, eased --- */
        const nextX = parallaxX + (parallaxTX - parallaxX) * 0.08;
        const nextY = parallaxY + (parallaxTY - parallaxY) * 0.08;

        if (Math.abs(nextX - parallaxX) > 0.05 || Math.abs(nextY - parallaxY) > 0.05) {
            busy = true;
        }

        parallaxX = nextX;
        parallaxY = nextY;

        stage.style.setProperty('--pf-mouse-x', parallaxX.toFixed(2) + 'px');
        stage.style.setProperty('--pf-mouse-y', parallaxY.toFixed(2) + 'px');

        universe.style.setProperty('--pf-world-y', worldY.toFixed(2) + 'deg');

    /* ---------------------------------------------------------
       DRAG ??,???? rotates the WORLD
       Horizontal drag yaws the whole universe, vertical drag
       pitches it slightly. One pointer path covers mouse and
       touch, and the page keeps scrolling vertically because
       touch-action: pan-y is set in CSS.
       --------------------------------------------------------- */

    stage.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        dragging = true;
        pointerId = event.pointerId;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        dragWorldY = worldY;
        dragWorldX = worldX;
        dragDistance = 0;

        spinY = 0;
        spinX = 0;

        stage.classList.add('is-dragging');

        if (stage.setPointerCapture) {
            try {
                stage.setPointerCapture(pointerId);
            } catch (error) {
                /* pointer capture unsupported */
            }
        }

        run();
    });

    stage.addEventListener('pointermove', (event) => {
        if (dragging) {
            if (event.pointerId !== pointerId) {
                return;
            }

            const dx = event.clientX - dragStartX;
            const dy = event.clientY - dragStartY;

            dragDistance = Math.max(dragDistance, Math.abs(dx));

            const targetY = dragWorldY + dx * DRAG_Y;
            const targetX = dragWorldX - dy * DRAG_X;

            /* Per-frame velocity becomes the release inertia. */
            spinY = clamp(targetY - worldY, -MAX_SPIN, MAX_SPIN);
            spinX = clamp(targetX - worldX, -MAX_SPIN, MAX_SPIN);

            worldY = targetY;
            worldX = targetX;

            run();
            return;
        }

        /* --- pointer parallax + the soft circular field --- */
        if (motionQuery.matches || event.pointerType === 'touch') {
            return;
        }

        const rect = stage.getBoundingClientRect();

        if (!rect.width || !rect.height) {
            return;
        }

        fieldX = event.clientX;
        fieldY = event.clientY;

        parallaxTX = ((event.clientX - rect.left) / rect.width - 0.5) * 2 * PARALLAX_X;
        parallaxTY = ((event.clientY - rect.top) / rect.height - 0.5) * 2 * PARALLAX_Y;

        run();
    });

    function endDrag(event) {
        if (!dragging || (event && event.pointerId !== pointerId)) {
            return;
        }

        dragging = false;

        if (pointerId !== null && stage.releasePointerCapture) {
            try {
                stage.releasePointerCapture(pointerId);
            } catch (error) {
                /* already released */
            }
        }

        pointerId = null;

        stage.classList.remove('is-dragging');

        /* A drag must never be read as a click on a panel. */
        if (dragDistance > 8) {
            suppressClickUntil = Date.now() + 320;
        }

        run();
    }

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    /* Leaving the stage releases the field and recentres parallax. */
    stage.addEventListener('pointerleave', () => {
        fieldX = -9999;
        fieldY = -9999;
        parallaxTX = 0;

    /* ---------------------------------------------------------
       ENTRY ??,???? one slow camera settle
       The universe is already built. The camera simply eases
       forward from a little way back, so the section "arrives".
       No panel travels a path and nothing is choreographed.
       --------------------------------------------------------- */

    const INTRO_MS = 1900;
    const INTRO_FROM = 340;

    function playIntro() {
        if (introduced) {
            return;
        }

        introduced = true;

        if (motionQuery.matches) {
            stage.style.setProperty('--pf-dolly', '0px');
            return;
        }

        const started = performance.now();

        stage.style.setProperty('--pf-dolly', INTRO_FROM + 'px');

        function step(now) {
            const t = Math.min(1, (now - started) / INTRO_MS);

            /* easeOutCubic: quick departure, long gentle landing. */
            const eased = 1 - Math.pow(1 - t, 3);

            stage.style.setProperty(
                '--pf-dolly',
                (INTRO_FROM * (1 - eased)).toFixed(1) + 'px'
            );

            if (t < 1) {
                introFrame = window.requestAnimationFrame(step);
            }
        }

        introFrame = window.requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    playIntro();
                    observer.disconnect();
                }
            }
        }, { threshold: 0.18 });

        observer.observe(stage);
    } else {
        playIntro();
    }

    /* ---------------------------------------------------------
       RESPONSIVE LAYERS
       On small screens the outermost, furthest panels are hidden
       outright. Hiding beats shrinking: a 360px viewport cannot
       show fifteen panels legibly, and unreadable panels would
       only add noise.
       --------------------------------------------------------- */

    const layerQueries = [
        { max: 1024, keep: 13 },
        { max: 768, keep: 9 },
        { max: 600, keep: 6 }
    ];

    function applyLayers() {
        let keep = panelState.length;

        for (const entry of layerQueries) {
            if (window.innerWidth <= entry.max) {
                keep = entry.keep;
                break;
            }
        }

        panelState.forEach((state, index) => {
            state.card.hidden = index >= keep;
        });
    }

    /* ---------------------------------------------------------
       MISSING SCREENSHOTS
       No project images exist yet, so this path is what keeps the
       section honest: the frame says so instead of showing a
       broken-image icon. Drop real files in and the placeholder
       simply never appears.
       --------------------------------------------------------- */

    cards.forEach((card) => {
        const image = card.querySelector('[data-portfolio-shot]');

        if (!image) {
            return;
        }

        const markMissing = () => {
            card.classList.add('is-missing');
            image.setAttribute('aria-hidden', 'true');
        };

        if (image.complete && image.naturalWidth === 0) {
            markMissing();
            return;
        }

        image.addEventListener('error', markMissing, { once: true });
    });

    /* ---- go ---- */

    if (motionQuery.matches) {
        stage.classList.add('is-reduced');
    }

    applyLayers();
    writeField();

    window.addEventListener('resize', () => {
        applyLayers();
        run();
    }, { passive: true });
})();

        parallaxTY = 0;

        run();
    });

    /* ---------------------------------------------------------
       CLICK GUARD
       A panel link is a real <a>. If the user dragged to rotate
       the world, the pointerup ending that drag must not also
       navigate, so a completed drag cancels the click.
       --------------------------------------------------------- */

    stage.addEventListener('click', (event) => {
        if (Date.now() < suppressClickUntil) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);

        universe.style.setProperty('--pf-world-x', worldX.toFixed(2) + 'deg');

        writeField();

        settled = !busy && !dragging;

        if (busy || dragging) {
            frameId = window.requestAnimationFrame(frame);
        }
    }

    function run() {
        if (!frameId) {
            frameId = window.requestAnimationFrame(frame);
        }
    }


