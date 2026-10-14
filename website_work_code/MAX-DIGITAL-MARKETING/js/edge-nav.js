/* =========================================================
   MAX DIGITAL MARKETING
   EDGE NAVIGATION — CONTROLLER
   ---------------------------------------------------------
   Drives css/edge-nav.css. Vanilla ES5, no dependencies, no
   build step, no framework. js/brain.js is not imported,
   wrapped or modified, and nothing here touches the canvas.

   RESPONSIBILITIES
     1. Open and close from EITHER trigger.
     2. Toggle the one attribute the CSS reads.
     3. Keep aria-expanded honest on both triggers.
     4. Return focus to the trigger that opened the panel.
     5. Manage `inert` so hidden links leave the tab order.

   WHAT IT DELIBERATELY DOES NOT DO
     * No scroll lock. The panel is a fixed overlay and the page
       behind it stays scrollable, which is what keeps the canvas
       rendering and keeps the page feeling alive. Locking scroll
       would also change the viewport width on some platforms and
       force a canvas resize.
     * No focus trap. This is a NON-modal dialog by design
       (aria-modal="false"): Tab is allowed to leave the panel and
       reach the page, and the scrim is deliberately not a blocker.
     * No direct style writes. The only thing this script changes
       is one attribute, so the CSS remains the single source of
       truth for how the panel looks.
   ========================================================= */

(function () {
    'use strict';

    var root = document.querySelector('[data-edge-nav]');

    /* Not the home page, or the markup was removed. */
    if (!root) {
        return;
    }

    var panel = root.querySelector('[data-edge-nav-panel]');
    var scrim = root.querySelector('[data-edge-nav-scrim]');
    var openers = root.querySelectorAll('[data-edge-nav-open]');
    var closer = root.querySelector('[data-edge-nav-close]');
    var links = root.querySelectorAll('[data-edge-nav-link]');

    if (!panel) {
        return;
    }

    var STATE_ATTR = 'data-edge-nav-state';
    var OPEN = 'open';
    var CLOSED = 'closed';

    /* The trigger that opened the panel, so focus can be handed
       back to the same control the visitor actually used. */
    var lastOpener = null;

    function isOpen() {
        return root.getAttribute(STATE_ATTR) === OPEN;
    }

    /*
     * `inert` is what actually removes the panel's links from the
     * tab order. visibility:hidden in CSS covers older engines, so
     * this is belt-and-braces rather than load-bearing. The try/catch
     * is defensive only; assigning inert on a plain object is
     * harmless when unsupported.
     */
    function setInert(nextInert) {
        try {
            if (nextInert) {
                panel.setAttribute('inert', '');
            } else {
                panel.removeAttribute('inert');
            }
        } catch (error) {
            /* No-op: visibility:hidden already handles it. */
        }
    }

    function applyState(nextState) {
        root.setAttribute(STATE_ATTR, nextState);

        /* Both triggers always report the real state. */
        Array.prototype.forEach.call(openers, function (opener) {
            opener.setAttribute('aria-expanded', nextState === OPEN ? 'true' : 'false');
        });

        /* The compact rail keeps its icon links available while closed;
           expansion only reveals their labels. */
        setInert(false);
    }

    function open(event) {
        lastOpener = event && event.currentTarget ? event.currentTarget : null;
        applyState(OPEN);

        /* Move focus into the panel so keyboard and screen-reader
           users are not left behind on the trigger. The close
           button is the sensible landing spot. */
        if (closer && typeof closer.focus === 'function') {
            closer.focus();
        }
    }

    function close() {
        if (!isOpen()) {
            return;
        }

        applyState(CLOSED);

        /* Hand focus back to whatever opened it. Guarded because
           the opener can be gone after a viewport change. */
        if (lastOpener && typeof lastOpener.focus === 'function'
            && typeof lastOpener.offsetParent !== 'undefined') {
            lastOpener.focus();
        }
        lastOpener = null;
    }

    function toggle(event) {
        if (isOpen()) {
            close();
        } else {
            open(event);
        }
    }

    /* --- EVENTS ------------------------------------------------ */

    /* Both triggers toggle the same panel. */
    Array.prototype.forEach.call(openers, function (opener) {
        opener.addEventListener('click', toggle);
    });

    if (closer) {
        closer.addEventListener('click', close);
    }

    /* Clicking the darkened area to the right closes it. The scrim
       is never used to trap the pointer — the page behind stays
       live — this is only a convenience. */
    if (scrim) {
        scrim.addEventListener('click', close);
    }

    /* A link closes the panel automatically, so the destination is
       never left sitting behind an open overlay. */
    Array.prototype.forEach.call(links, function (link) {
        link.addEventListener('click', close);
    });

    /* Escape closes from anywhere, not only when focus is inside
       the panel. */
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
            close();
        }
    });

    /* Adopt whatever state the PHP rendered, and make the initial
       aria-expanded and inert match it. */
    applyState(isOpen() ? OPEN : CLOSED);
}());