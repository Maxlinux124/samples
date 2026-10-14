<?php
declare(strict_types=1);

$pageTitle = 'Max Digital Marketing | Digital Growth Partner';
$pageDescription = 'Max Digital Marketing helps ambitious businesses build visibility, connect with customers, and grow online.';
$pageCanonical = 'https://www.example.com/';
$pageBodyClass = 'page page--home';

/*
 * Page-level stylesheet, loaded after every global sheet in
 * includes/header.php via its $pageStyles hook. This is how the
 * section background rhythm is applied without editing the
 * header or any of the per-section stylesheets:
 *
 *   01 DARK · 02 LIGHT · 03 DARK · 04 LIGHT · 05 DARK
 *   06 LIGHT · 07 DARK · 08 DARK (footer-anchored) · 09 untouched
 *
 * css/page-loader.css is the loading overlay and is listed last
 * so it wins over anything a component sheet might set.
 *
 * css/edge-nav.css is the edge navigation. It sits above the
 * loader in the source order but below it in z-index (8000 vs
 * 9000), so the loader still covers the triggers while the page
 * is arriving.
 */
$pageStyles = [
    'css/section-rhythm.css',
    'css/edge-nav.css',
    'css/page-loader.css',
];

/*
 * =========================================================
 *  HERO HEADLINE MESSAGES  (content only — no animation yet)
 * ---------------------------------------------------------
 * Ten short headline / description pairs, one per intended
 * rotation slot. They are held here as the single source of
 * truth and are emitted into the markup two ways:
 *
 *   1. The FIRST pair is rendered as real text inside the H1
 *      and the paragraph, so the Hero reads correctly with
 *      JavaScript disabled and before any script runs.
 *   2. The WHOLE list is JSON-encoded into a data-hero-messages
 *      attribute on the wrapper, which is the hand-off point
 *      for the smooth text-change animation in a later task.
 *      That task only has to read this attribute — it does not
 *      need to touch PHP again.
 *
 * COPY RULES APPLIED
 *   * Headlines stay short enough to set in two lines at the
 *     existing max-width of 15ch, never more than three.
 *   * Descriptions are one short sentence each. No paragraphs.
 *
 * LENGTH CHECK
 *   .hero-text__description in css/components.css caps the
 *   measure at 34rem, so every description below wraps to at
 *   most two lines on desktop and one or two on mobile.
 * ========================================================= */

$heroMessages = [
    [
        'heading'     => 'Grow Your Digital Future.',
        'description' => 'Marketing that moves your business forward.',
    ],
    [
        'heading'     => 'Build Better. Grow Faster.',
        'description' => 'Strategy, content and technology, working as one.',
    ],
    [
        'heading'     => 'Turn Ideas Into Impact.',
        'description' => 'From a first idea to real, measurable results.',
    ],
    [
        'heading'     => 'Make Your Brand Visible.',
        'description' => 'Be found, remembered and chosen.',
    ],
    [
        'heading'     => 'Create. Connect. Grow.',
        'description' => 'Creative, content and growth under one roof.',
    ],
    [
        'heading'     => 'Digital Strategy That Moves.',
        'description' => 'Clear plans, fast action and real results.',
    ],
    [
        'heading'     => 'Build Experiences That Matter.',
        'description' => 'Design and technology working together.',
    ],
    [
        'heading'     => 'Turn Attention Into Growth.',
        'description' => 'Reach the right people and convert them.',
    ],
    [
        'heading'     => 'Think Digital. Grow Smarter.',
        'description' => 'Smarter decisions, backed by data.',
    ],
    [
        'heading'     => 'Your Next Growth Starts Here.',
        'description' => 'Let us build your next chapter together.',
    ],
];

/*
 * JSON for the future rotation script. JSON_UNESCAPED_SLASHES keeps
 * href-style slashes readable, and escapeHtml() below makes the whole
 * payload safe to sit inside a double-quoted HTML attribute.
 */
$heroMessagesJson = (string) json_encode(
    $heroMessages,
    JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
);

require_once __DIR__ . '/includes/header.php';

/*
 * Home page navigation.
 *
 * The traditional horizontal bar (includes/navbar.php) is NOT
 * rendered here any more. The hero now starts clean and
 * fullscreen, and every primary control lives on a screen edge:
 * a vertical strip on the left and a profile disc top-right.
 * Both open the same glass panel.
 *
 * includes/edge-nav.php is included here, after the header and
 * before <main>, so it sits outside the main landmark and adds
 * no section, no ordering change and no data-brain-section
 * attribute. navbar.php is left untouched on disk for any other
 * page that may want it.
 */
require_once __DIR__ . '/includes/edge-nav.php';
?>

<!-- =========================================================
     LOADING OVERLAY
     ---------------------------------------------------------
     A sibling of <main>, not a section. It owns no page content
     and is removed from the DOM by js/page-loader.js once the
     page has genuinely finished loading.

     BRAND ASSET NOTE — PLEASE READ
       There is currently NO valid Max Digital Marketing logo in
       this project. Every image in asset/ (logo.jpg, logo2.png,
       logo2 (2).png, max.png) is a different company's artwork
       reading "MAX linux", and it carries purple, which is not
       in the project palette. The navbar also points at
       asset/logo.png, which does not exist at all.

       Rather than ship the wrong brand, the lockup below is
       typographic and built from the existing SITE_NAME and
       display font. Drop in a real logo later by replacing the
       .page-loader__brand block with an <img> — no other change
       is needed.
     ========================================================== -->
<script>
    /*
     * CRITICAL, inline and deliberately tiny.
     *
     * This runs during the parse pass BEFORE the overlay below is
     * reached, which gives us two guarantees at once:
     *
     *   1. css/page-loader.css keeps .page-loader { display:none }
     *      by default and only paints it under ".js". Adding the
     *      class here, in the same parse pass, means the overlay
     *      is never painted uncovered — no flash.
     *
     *   2. If JavaScript is unavailable, ".js" is never added, so
     *      the overlay is never painted at all and the page shows
     *      normally. Same result if js/page-loader.js 404s, which
     *      is why the failsafe below exists: the page can never be
     *      left permanently covered.
     */
    (function (d) {
        d.documentElement.classList.add('js');
        window.setTimeout(function () {
            var l = d.getElementById('pageLoader');
            if (l && l.parentNode) { l.parentNode.removeChild(l); }
        }, 15000);
    }(document));
</script>

<div class="page-loader" id="pageLoader" role="status" aria-live="polite">
    <span class="page-loader__sr">Loading Max Digital Marketing</span>

    <span class="page-loader__grid" aria-hidden="true"></span>
    <span class="page-loader__scan" aria-hidden="true"></span>

    <div class="page-loader__inner" aria-hidden="true">
        <p class="page-loader__status">
            <span class="page-loader__status-text">Loading</span>
        </p>

        <!-- Neural core: rings + spokes + node. Pure CSS motion. -->
        <div class="page-loader__core">
            <span class="page-loader__ring"></span>
            <span class="page-loader__ring"></span>
            <span class="page-loader__ring"></span>

            <span class="page-loader__spokes">
                <span class="page-loader__spoke"></span>
                <span class="page-loader__spoke"></span>
                <span class="page-loader__spoke"></span>
                <span class="page-loader__spoke"></span>
                <span class="page-loader__spoke"></span>
                <span class="page-loader__spoke"></span>
            </span>

            <span class="page-loader__node"></span>
        </div>

        <p class="page-loader__brand">
            <span class="page-loader__brand-max">Max</span>
            <span class="page-loader__brand-sub">Digital Marketing</span>
        </p>
    </div>

    <div class="page-loader__foot" aria-hidden="true">
        <div class="page-loader__track">
            <span class="page-loader__bar"></span>
        </div>
        <span class="page-loader__value">0</span>
    </div>
</div>

<!-- =========================================================
     GLOBAL BRAIN VISUAL LAYER
     One persistent fixed canvas that travels through the page.
========================================================== -->
<div class="brain-visual-layer" aria-hidden="true">
    <canvas id="brainCanvas" class="brain-canvas"></canvas>
</div>

<!--
    =========================================================
     HOME PAGE — CONTENT CLEARED FOR REBUILD
    ==========================================================

     Every heading, paragraph, image, button and data-driven card
     has been removed. What remains is the SKELETON:

       - the shared .home-section / .home-section__inner /
         .home-section__content containers
       - the per-section id and class hooks
       - the data-brain-section / data-brain-position attributes
         that js/brain.js reads to move the neural canvas

     IMPORTANT — those attributes are POSITIONAL. brain.js builds
     its scroll index from the ordered list of [data-brain-section]
     elements and blends worldSections[] against that index, so:

       * keep the sections in their current order;
       * keep at least two of them — brain.js returns early when it
         finds fewer than two (js/brain.js:387) and the canvas
         stops travelling entirely;
       * a section without the attribute is simply skipped, which
         is why Section 08 (Portfolio) omits it.

     The shared heading/description/meta content classes used by the
     old sections are still available and still styled:

       .home-section__number      01 / 02 / 03 …
       .home-section__eyebrow     small uppercase label
       .home-section__title       the main heading
       .home-section__description the paragraph
       .home-section__meta        <div> of <span> chips
       .home-section__actions     button row
       .button.button--primary     primary action
       .button.button--secondary   secondary action

     Reference section shell:

       <section id="unique-id" class="home-section" data-brain-section="N">
           <div class="home-section__inner">
               <div class="home-section__content"> … </div>
           </div>
       </section>

    =========================================================
-->

<main id="main-content" class="site-main" tabindex="-1">

    <!-- =========================================================
         SECTION 01 — HERO
         Brain Position: CENTER
    ========================================================== -->
    <section
        id="hero"
        class="hero home-section home-section--hero"
        data-brain-section="1"
        data-brain-position="center"
    >
        <div class="hero__inner home-section__inner">

            <!--
                =========================================================
                 HERO TEXT — prepared content, NO rotation animation yet
                ==========================================================

                ONE H1 AND ONE SHORT LINE. NOTHING ELSE: no cards, no
                buttons, no images.

                PLACEMENT — THE POINT OF THIS BLOCK
                  The heading sits in the TOP-LEFT corner of the hero
                  and the supporting line in the BOTTOM-RIGHT corner.
                  The middle of the screen is left completely empty
                  on purpose: that is where the Brain canvas draws
                  itself, and this layout keeps it fully unobstructed
                  at every width.

                  All of that placement is done in css/hero.css with
                  a full-height column flex box and space-between.
                  Nothing here is absolutely positioned, so the two
                  corners stay correct as the viewport changes and
                  no fixed pixel offsets can drift out of date.

                WHY THIS WRAPPER IS .hero__copy AND NOT .hero-text
                  The historical .hero-text class must NOT come back.
                  js/drag-cards.js:63 does
                      const heroText = document.querySelector(".hero-text");
                  and line 67 then calls getElementCenter(heroText) —
                  a function that is not defined anywhere in the project.
                  Re-adding .hero-text would therefore throw a
                  ReferenceError on every page load. .hero__copy is a
                  different name with an identical job, so that script
                  keeps finding null and skipping safely.

                TYPOGRAPHY
                  The H1 and the paragraph deliberately keep the existing
                  classes .hero-text__title and .hero-text__description
                  (css/components.css). Those give the current Hero look:
                  clamp(2.5rem, 5.4vw, 4.35rem) — 69.6px on desktop —
                  weight 800, -0.045em tracking, 15ch measure.

                data-hero-messages
                  The full list of ten pairs, JSON-encoded, waiting for
                  the next task. The rotation script only needs to read
                  this attribute; it never has to come back to PHP.

                STATIC ON PURPOSE
                  No JavaScript is added in this task, and the perpetual
                  drift animations that those two classes normally carry
                  are switched off for this block in css/hero.css, so
                  the copy sits still until the animation task arrives.
                ========================================================= -->
            <div
                class="hero__copy"
                data-hero-messages="<?= escapeHtml($heroMessagesJson) ?>"
            >
                <h1
                    class="hero-text__title"
                    data-hero-heading
                ><?= escapeHtml($heroMessages[0]['heading']) ?></h1>

                <p
                    class="hero-text__description"
                    data-hero-description
                ><?= escapeHtml($heroMessages[0]['description']) ?></p>
            </div>

        </div>
    </section>

    <!-- =========================================================
         SECTION 02 — SERVICES
         Brain Position: RIGHT
    ========================================================== -->
    <section
        id="strategy"
        class="home-section home-section--strategy"
        data-brain-section="2"
        data-brain-position="right"
    >
        <div class="home-section__inner"></div>
    </section>

    <!-- =========================================================
         SECTION 03 — WEBSITE & EXPERIENCE
         Brain Position: LEFT
    ========================================================== -->
    <section
        id="web-development"
        class="home-section home-section--website"
        data-brain-section="3"
        data-brain-position="left"
    >
        <div class="home-section__inner"></div>
    </section>

    <!-- =========================================================
         SECTION 04 — PERFORMANCE MARKETING
         Brain Position: RIGHT
    ========================================================== -->
    <section
        id="performance"
        class="home-section home-section--performance"
        data-brain-section="4"
        data-brain-position="right"
    >
        <div class="home-section__inner"></div>
    </section>

    <!-- =========================================================
         SECTION 05 — CREATIVE & CONTENT
         Brain Position: LEFT
    ========================================================== -->
    <section
        id="creative"
        class="home-section home-section--creative"
        data-brain-section="5"
        data-brain-position="left"
    >
        <div class="home-section__inner"></div>
    </section>

    <!-- =========================================================
         SECTION 06 — TECHNOLOGY / AI
         Brain Position: CENTER
    ========================================================== -->
    <section
        id="technology"
        class="home-section home-section--technology"
        data-brain-section="6"
        data-brain-position="center"
    >
        <div class="home-section__inner"></div>
    </section>

    <!-- =========================================================
         SECTION 07 — ABOUT
         Brain Position: LEFT
    ========================================================== -->
    <section
        id="about"
        class="home-section home-section--about"
        data-brain-section="7"
        data-brain-position="left"
    >
        <div class="home-section__inner"></div>
    </section>

    <!-- =========================================================
         SECTION 08 — OUR WORK / PORTFOLIO
         No data-brain-section here, by design: that attribute
         is read positionally, so adding a section before it would
         shift the Brain pose of every following section. It
         inherits the 06 -> 07 transition instead.
    ========================================================== -->
    <section
        id="work"
        class="home-section home-section--portfolio"
        data-portfolio
    >
        <div class="home-section__inner"></div>
    </section>

    <!-- =========================================================
         SECTION 09 — FINAL CTA
         Brain Position: CENTER
    ========================================================== -->
    <section
        id="contact-cta"
        class="home-section home-section--cta"
        data-brain-section="8"
        data-brain-position="center"
    >
        <div class="home-section__inner"></div>
    </section>

</main>


<!-- =============================================================
     JAVASCRIPT
============================================================== -->

<!--
     Deferred scripts execute in document order. The loading
     experience (page-loader.js) runs first; js/brain.js is
     untouched.

     edge-nav.js runs after page-loader.js and before brain.js.
     It only flips one data attribute, so it cannot affect how
     the canvas is sized or drawn.
-->
<script src="js/page-loader.js" defer></script>
<script src="js/edge-nav.js" defer></script>

<script src="js/brain.js" defer></script>
<script src="js/service-panel.js" defer></script>
<script src="js/service-carousel.js" defer></script>
<script src="js/portfolio.js" defer></script>
<script src="js/drag-cards.js" defer></script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
