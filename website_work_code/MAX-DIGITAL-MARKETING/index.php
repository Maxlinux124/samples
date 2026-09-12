<?php
declare(strict_types=1);

$pageTitle = 'Max Digital Marketing | Digital Growth Partner';
$pageDescription = 'Max Digital Marketing helps ambitious businesses build visibility, connect with customers, and grow online.';
$pageCanonical = 'https://www.example.com/';
$pageBodyClass = 'page page--home';

require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/navbar.php';
?>

<main id="main-content" class="site-main" tabindex="-1">
    <section class="hero" aria-labelledby="hero-title">
        <canvas id="brainCanvas" aria-hidden="true" style="position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; display: block;"></canvas>
        <div class="hero__inner">
            <div class="hero-text">
                <p class="hero-text__eyebrow">MAX DIGITAL MARKETING</p>
                <h1 id="hero-title" class="hero-text__title">Grow Your Business in the Digital World</h1>
                <p class="hero-text__description">
                    Max Digital Marketing combines sharp strategy, memorable creative, and measurable performance to turn attention into meaningful growth.
                </p>
                <div class="hero__actions" aria-label="Hero actions">
                    <a class="button button--primary" href="contact.php">Start a Project</a>
                    <a class="button button--secondary" href="services.php">Explore Our Services</a>
                </div>
            </div>

            <div class="hero-service-visual" aria-label="Digital marketing capabilities">
                <div class="hero-service-visual__header">
                    <span class="hero-service-visual__status" aria-hidden="true"></span>
                    <span>DIGITAL SYSTEM</span>
                    <span class="hero-service-visual__counter">01 / 10</span>
                </div>
                <div class="hero-service-visual__viewport">
                    <div class="hero-service-visual__item hero-service-visual__item--website">
                        <span class="hero-service-visual__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18M7 12l2 2-2 2M11 16h5"/></svg></span>
                        <span><strong>Website Development</strong><small>Interface systems / code</small></span>
                    </div>
                    <div class="hero-service-visual__item hero-service-visual__item--seo">
                        <span class="hero-service-visual__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5M8 11h5M10.5 8.5v5"/></svg></span>
                        <span><strong>SEO Growth</strong><small>Search visibility / traffic</small></span>
                    </div>
                    <div class="hero-service-visual__item hero-service-visual__item--social">
                        <span class="hero-service-visual__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="m8 11 8-4M8 13l8 4"/></svg></span>
                        <span><strong>Social Media Marketing</strong><small>Audience / community</small></span>
                    </div>
                    <div class="hero-service-visual__item hero-service-visual__item--facebook">
                        <span class="hero-service-visual__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14 20v-7h2.5l.5-3H14V8.4c0-.9.3-1.4 1.5-1.4H17V4.3c-.5-.1-1.3-.2-2.3-.2-2.3 0-3.7 1.4-3.7 3.9V10H8.5v3h2.5v7"/></svg></span>
                        <span><strong>Facebook Marketing</strong><small>Paid social / reach</small></span>
                    </div>
                    <div class="hero-service-visual__item hero-service-visual__item--video">
                        <span class="hero-service-visual__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3zM5 3v2M9 3v2M13 3v2"/></svg></span>
                        <span><strong>Video Editing</strong><small>Motion / storytelling</small></span>
                    </div>
                    <div class="hero-service-visual__item hero-service-visual__item--analytics">
                        <span class="hero-service-visual__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h16M8 16v-4M12 16V8M16 16v-7M20 16V6"/></svg></span>
                        <span><strong>Analytics &amp; Performance</strong><small>Signals / growth data</small></span>
                    </div>
                    <div class="hero-service-visual__item hero-service-visual__item--branding">
                        <span class="hero-service-visual__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m4 17 9-9 4 4-9 9H4zM14 6l2-2 4 4-2 2M7 20h13"/></svg></span>
                        <span><strong>Branding &amp; Creative</strong><small>Identity / direction</small></span>
                    </div>
                    <div class="hero-service-visual__item hero-service-visual__item--marketing">
                        <span class="hero-service-visual__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><circle cx="4" cy="7" r="1.5"/><circle cx="20" cy="7" r="1.5"/><circle cx="20" cy="18" r="1.5"/><path d="m5.3 8 4 2.5M14.7 10.5 18.7 8M14.5 13.5l4.2 3.2"/></svg></span>
                        <span><strong>Digital Marketing</strong><small>Connected ecosystem</small></span>
                    </div>
                    <div class="hero-service-visual__item hero-service-visual__item--ads">
                        <span class="hero-service-visual__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 18 10 5h4l6 13M7 14h10M5 19h14"/></svg></span>
                        <span><strong>Google Ads</strong><small>Campaign / conversion</small></span>
                    </div>
                    <div class="hero-service-visual__item hero-service-visual__item--ai">
                        <span class="hero-service-visual__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3M10 11h4M12 9v6"/></svg></span>
                        <span><strong>AI Automation</strong><small>Intelligence / workflow</small></span>
                    </div>
                </div>
                <div class="hero-service-visual__footer"><span>LIVE SIGNAL</span><i aria-hidden="true"></i><span>NEURAL LINK ACTIVE</span></div>
            </div>

            <div class="hero-visual-card" aria-label="Digital marketing intelligence visual">
                <span class="hero-visual-card__line hero-visual-card__line--top" aria-hidden="true"></span>
                <span class="hero-visual-card__line hero-visual-card__line--bottom" aria-hidden="true"></span>
                <div class="hero-visual-card__image-wrap">
                    <img src="asset/max.png" alt="Max Digital Marketing strategist" class="hero-visual-card__image">
                </div>
                <div class="hero-visual-card__terminal" aria-live="polite">
                    <span class="hero-visual-card__prompt">&gt;</span>
                    <span data-visual-terminal> SYSTEM ONLINE_</span>
                </div>
                <span class="hero-visual-card__node" aria-hidden="true"></span>
            </div>
        </div>
    </section>
</main>

<script src="js/brain.js" defer></script>
<script src="js/service-panel.js" defer></script>
<?php require_once __DIR__ . '/includes/footer.php'; ?>