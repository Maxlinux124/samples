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
        <div class="hero__inner">
            <div class="hero__content">
                <p class="hero__eyebrow">Strategy. Creative. Growth.</p>
                <h1 id="hero-title" class="hero__title">
                    Build a digital presence that <span>moves your business forward.</span>
                </h1>
                <p class="hero__description">
                    Max Digital Marketing combines sharp strategy, memorable creative, and measurable performance to turn attention into meaningful growth.
                </p>
                <div class="hero__actions" aria-label="Hero actions">
                    <a class="button button--primary" href="contact.php">Start a Project</a>
                    <a class="button button--secondary" href="services.php">Explore Our Services</a>
                </div>
                <p class="hero__trust">
                    <span class="hero__trust-mark" aria-hidden="true"></span>
                    Built for ambitious brands ready to grow with clarity.
                </p>
            </div>

            <div class="hero__visual" aria-hidden="true" data-hero-visual>
                <div class="hero__canvas-layer" data-hero-canvas></div>
            </div>
        </div>
    </section>
</main>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
