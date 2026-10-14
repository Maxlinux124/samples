/* =========================================================
   HOME PAGE — LOADING OVERLAY CONTROLLER
   Max Digital Marketing
   ---------------------------------------------------------
   Drives css/page-loader.css. Vanilla, no dependencies, no
   library, no build step.

   WHAT IT DOES
     1. advances a progress value from REAL load milestones
        (DOM parsed, then window load);
     2. keeps the overlay up for a short, fixed MINIMUM so a
        fast load still reads as intentional rather than a flash;
     3. fades the overlay away and removes it from the DOM.

   THE "DON'T DELAY THE USER" RULE
     The minimum is a FLOOR, never an addition. The overlay is
     released at:
         max(readyMoment, minimumDisplay)
     So a page that takes 4s to arrive shows the overlay for
     4s — not 4s + 700ms. Only a page that is ready almost
     immediately is held for the extra moment, which is exactly
     the case where the motion is what sells the page.

   THE "DON'T SHOW A BROKEN PAGE" RULE
     Release is triggered by window 'load', NOT
     DOMContentLoaded. That deliberately waits for images,
     stylesheets and fonts, so on a slow connection the user
     keeps watching the branded overlay instead of being shown
     a half-styled page. A 12s failsafe guarantees the overlay
     can never trap anyone if an asset hangs.

   HONEST PROGRESS
     The percentage is driven by actual milestones, not a
     random ticker. Before the window 'load' event the value
     asymptotically approaches (but never reaches) 90%, so a
     slow connection shows movement without ever lying about
     completion. 100% is shown only at the moment of release.

   REDUCED MOTION
     The minimum drops from 700ms to 240ms, so nothing is held
     on screen for the sake of an animation the visitor asked
     not to see.
   ========================================================= */

(function () {
    'use strict';

    var loader = document.getElementById('pageLoader');

    /* Nothing to drive (not the home page, or markup removed). */
    if (!loader) {
        return;
    }

    var root = document.documentElement;
    var bar = loader.querySelector('.page-loader__bar');
    var value = loader.querySelector('.page-loader__value');
    var status = loader.querySelector('.page-loader__status-text');

    var reducedMotion = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* A floor, not a delay. See the header note. */
    var MINIMUM_DISPLAY = reducedMotion ? 240 : 700;

    /* Backstop so one hanging asset can never lock the page. */
    var FAILSAFE_MS = 12000;

    var startedAt = Date.now();
    var released = false;
    var progress = 0;
    var creepTimer = null;

    /* ---------------------------------------------------------
       Progress
       --------------------------------------------------------- */

    function render() {
        if (bar) {
            bar.style.setProperty('--page-loader-progress', progress.toFixed(3));
        }
        if (value) {
            value.textContent = String(Math.round(progress * 100));
        }
    }

    /*
     * Monotonic by design: progress only ever moves forward, so
     * a late milestone can never rewind the bar.
     */
    function setProgress(next) {
        if (next > progress) {
            progress = next;
            render();
        }
    }

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    /* ---------------------------------------------------------
       Scroll lock — applied only while the overlay is up
       --------------------------------------------------------- */

    function lockScroll() {
        root.classList.add('js-page-loader-lock');
    }

    function unlockScroll() {
        root.classList.remove('js-page-loader-lock');
    }


    /* ---------------------------------------------------------
       Release
       --------------------------------------------------------- */

    function remove() {
        stopCreep();

        if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }

        unlockScroll();
    }

    function leave() {
        loader.classList.add('is-leaving');

        /*
         * transitionend is the precise signal, but it never fires
         * if the tab is backgrounded mid-transition, or if the
         * element is display:none'd. The timeout guarantees the
         * overlay can never be left covering the page.
         */
        var settled = false;

        function finish() {
            if (settled) {
                return;
            }
            settled = true;
            remove();
        }

        loader.addEventListener('transitionend', finish, { once: true });
        window.setTimeout(finish, reducedMotion ? 260 : 900);
    }

    function release() {
        if (released) {
            return;
        }
        released = true;

        stopCreep();

        /* The page is genuinely ready, so the bar completes. */
        setProgress(1);
        setStatus('Ready');

        var elapsed = Date.now() - startedAt;
        var wait = Math.max(0, MINIMUM_DISPLAY - elapsed);

        window.setTimeout(leave, wait);
    }

    /* ---------------------------------------------------------
       Creep — movement without a lie
       --------------------------------------------------------- */

    function stopCreep() {
        if (creepTimer !== null) {
            window.clearInterval(creepTimer);
            creepTimer = null;
        }
    }

    function startCreep() {
        if (reducedMotion) {
            return;
        }

        creepTimer = window.setInterval(function () {
            /*
             * Capped at 0.9 — the bar approaches 100% and waits
             * there until window 'load' really has fired.
             */
            if (progress >= 0.9) {
                return;
            }
            setProgress(progress + (0.9 - progress) * 0.06);
        }, 120);
    }

    /* ---------------------------------------------------------
       Wiring
       --------------------------------------------------------- */

    /* First paint of the bar. */
    setProgress(0.04);

    lockScroll();

    setStatus('Loading');

    /*
     * Milestone 1 — the document is parsed. This is deliberately
     * NOT the release signal; it only moves the bar.
     */
    document.addEventListener('DOMContentLoaded', function () {
        setProgress(0.55);
        setStatus('Preparing');
    });

    /*
     * Milestone 2 and the real release signal — every image,
     * stylesheet and font has arrived.
     */
    window.addEventListener('load', release);

    /* Backstop for a hung third-party asset. */
    window.setTimeout(release, FAILSAFE_MS);

    startCreep();

    /*
     * This file is deferred, so on a warm cache the page may
     * already be complete — 'load' has been and gone and would
     * never fire again. Check readyState directly.
     */
    if (document.readyState === 'complete') {
        release();
    }
}());
