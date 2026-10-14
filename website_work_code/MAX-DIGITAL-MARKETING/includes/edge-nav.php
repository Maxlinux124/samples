<?php
declare(strict_types=1);

/*
 * =========================================================
 *  EDGE NAVIGATION  —  home page only
 *  Max Digital Marketing
 * ---------------------------------------------------------
 * Replaces includes/navbar.php ON THE HOME PAGE ONLY. The
 * traditional horizontal bar is no longer rendered here; the
 * hero starts clean and fullscreen and every primary control
 * lives on a screen edge.
 *
 * CLOSED
 *   .edge-nav__strip    slim vertical trigger, LEFT edge
 *   .edge-nav__account  low-profile profile trigger, TOP RIGHT
 *   Neither shows a navigation label, so the hero reads as one
 *   clean fullscreen composition.
 *
 * OPEN
 *   .edge-nav__panel  fixed glass sheet sliding in from the left.
 *   Desktop ~44% of the viewport, tablet/mobile ~86%. The rest of
 *   the screen is left untouched so the Brain canvas stays visible
 *   and keeps tracking the pointer.
 *
 * ARCHITECTURAL SAFETY
 *   * The panel is position:fixed and never participates in layout,
 *     so it cannot push, resize or reflow .brain-visual-layer.
 *     js/brain.js is neither modified nor aware of this file.
 *   * No section, section order or data-brain-section attribute is
 *     touched, so the Brain's pose per section is unchanged.
 *   * Only transform/opacity are animated, so opening the panel
 *     causes no layout and no canvas resize.
 *
 * ACCESSIBILITY
 *   * Both triggers are real buttons sharing aria-expanded and
 *     aria-controls, so either opens or closes the same panel.
 *   * The panel is a NON-modal dialog (aria-modal="false"): the page
 *     behind stays live, which is what lets the canvas keep
 *     responding. Being non-modal, it deliberately has no focus trap.
 *   * Closed, the panel is visibility:hidden AND inert, so its links
 *     leave the tab order instead of being hidden visually only.
 * ========================================================= */

/*
 * Primary links. 'href' is the only field to change per item.
 *
 * Process / Our Team / Why Choose Us / FAQ have no page of their own
 * and are mapped to the nearest existing section, so they behave as
 * in-page jumps. Valid targets are the section ids in index.php:
 * strategy, web-development, performance, technology, creative,
 * about, work, contact-cta.
 */
$edgeNavItems = [
    ['label' => 'Home',          'href' => 'index.php'],
    ['label' => 'About',         'href' => 'about.php'],
    ['label' => 'Services',      'href' => 'services.php'],
    ['label' => 'Process',       'href' => '#strategy'],
    ['label' => 'Our Team',      'href' => '#about'],
    ['label' => 'Why Choose Us', 'href' => '#technology'],
    ['label' => 'FAQ',           'href' => '#contact-cta'],
    ['label' => 'Contact',       'href' => 'contact.php'],
];

/*
 * Social labels are PLACEHOLDER TEXT ONLY, as specified: no outbound
 * destinations and no real brand links are invented. They render as
 * spans, not anchors, so they can never be followed and are not
 * announced as links.
 */
$edgeNavSocial = ['Facebook', 'Instagram', 'LinkedIn'];
?>
<aside class="edge-nav" data-edge-nav data-edge-nav-state="closed">
    <!-- =====================================================
         CLOSED STATE — TRIGGER 1, LEFT EDGE
         A slim vertical strip. Its glyph is the only menu
         affordance on this side; the word is rotated and small
         so it reads as texture rather than as a link.
    ====================================================== -->
    <button
        class="edge-nav__strip"
        type="button"
        aria-controls="edgeNavPanel"
        aria-expanded="false"
        data-edge-nav-open
    >
        <span class="edge-nav__strip-icon" aria-hidden="true">
            <svg class="edge-nav__icon" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <path d="M4 7h16"></path>
                <path d="M4 12h16"></path>
                <path d="M4 17h16"></path>
            </svg>
        </span>
        <span class="edge-nav__strip-label" aria-hidden="true">Menu</span>
        <span class="edge-nav__sr-only">Open navigation menu</span>
    </button>

    <!-- =====================================================
         CLOSED STATE — TRIGGER 2, TOP RIGHT
         A low-profile glass disc. The glyph is aria-hidden and
         the sr-only span carries the name, so it is announced
         once and correctly.
    ====================================================== -->
    <button
        class="edge-nav__account"
        type="button"
        aria-controls="edgeNavPanel"
        aria-expanded="false"
        data-edge-nav-open
    >
        <span class="edge-nav__account-ring" aria-hidden="true"></span>
        <span class="edge-nav__account-icon" aria-hidden="true">
            <svg class="edge-nav__icon" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5"
                 stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8.5" r="3.25"></circle>
                <path d="M5.25 19.25a7 7 0 0 1 13.5 0"></path>
            </svg>
        </span>
        <span class="edge-nav__sr-only">Open navigation menu</span>
    </button>

<!-- =====================================================
         OPEN STATE — SCRIM
         Fixed over the viewport, but DARKEST AT THE LEFT and
         fading to nearly clear on the right. That keeps the
         panel legible while leaving the Brain and hero on the
         right genuinely visible rather than greyed out. It
         carries no colour of its own.
    ====================================================== -->
    <div class="edge-nav__scrim" data-edge-nav-scrim></div>

    <!-- =====================================================
         OPEN STATE — GLASS PANEL
         aria-modal="false" on purpose: the page behind stays
         interactive. js/edge-nav.js adds inert while closed, so
         these links never sit in the tab order unseen.
    ====================================================== -->
    <div class="edge-nav__panel" id="edgeNavPanel" role="dialog"
         aria-modal="false" aria-label="Site navigation"
         data-edge-nav-panel>
        <div class="edge-nav__inner">
            <!-- Brand + close -->
            <div class="edge-nav__head">
                <a class="edge-nav__brand" href="index.php"
                   aria-label="Max Digital Marketing home">
                    <span class="edge-nav__brand-mark" aria-hidden="true">M</span>
                    <span class="edge-nav__brand-text">
                        <span class="edge-nav__brand-name">Max</span>
                        <span class="edge-nav__brand-sub">Digital Marketing</span>
                    </span>
                </a>

                <!-- Explicit, elegant close. Not the only exit:
                     Escape and a scrim click also close. -->
                <button class="edge-nav__close" type="button" data-edge-nav-close>
                    <span class="edge-nav__close-icon" aria-hidden="true">
                        <svg class="edge-nav__icon" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                            <path d="M6 6l12 12"></path>
                            <path d="M18 6L6 18"></path>
                        </svg>
                    </span>
                    <span class="edge-nav__close-text" aria-hidden="true">Close</span>
                    <span class="edge-nav__sr-only">Close navigation menu</span>
                </button>
            </div>

            <!-- Primary links -->
            <nav class="edge-nav__menu" aria-label="Primary">
                <ul class="edge-nav__list">
                    <?php foreach ($edgeNavItems as $itemIndex => $item): ?>
                        <?php $edgeLabel = (string) $item['label']; ?>
                        <li class="edge-nav__item">
                            <a class="edge-nav__link"
                               href="<?= escapeHtml((string) $item['href']) ?>"
                               data-edge-nav-link>
                                <span class="edge-nav__link-index" aria-hidden="true"><?= str_pad((string) ($itemIndex + 1), 2, '0', STR_PAD_LEFT) ?></span>
                                <span class="edge-nav__link-label"><?= escapeHtml($edgeLabel) ?></span>
                                <span class="edge-nav__link-arrow" aria-hidden="true">
                                    <svg class="edge-nav__icon" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" stroke-width="1.5"
                                         stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </span>
                            </a>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </nav>

            <!-- Social: placeholder text only -->
            <div class="edge-nav__social">
                <p class="edge-nav__social-title">Connect</p>
                <ul class="edge-nav__social-list">
                    <?php foreach ($edgeNavSocial as $edgeSocialLabel): ?>
                        <li>
                            <span class="edge-nav__social-item"><?= escapeHtml((string) $edgeSocialLabel) ?></span>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        </div>
    </div>
</aside>