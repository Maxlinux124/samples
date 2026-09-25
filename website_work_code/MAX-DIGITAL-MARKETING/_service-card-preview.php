<?php
declare(strict_types=1);

/*
 * =========================================================
 * SERVICE CARD — COMPONENT PREVIEW (development harness)
 * ---------------------------------------------------------
 * Renders includes/service-card.php in both containers:
 *   1. .service-card-slider  (native scroll-snap + controls)
 *   2. .service-card-grid    (responsive card grid)
 *
 * The component only needs css/service-card.css and
 * js/service-card-slider.js. style.css and
 * service-card-preview.css are page chrome for this harness
 * only — delete this file once the card lands on a real page.
 * =========================================================
 */

require_once __DIR__ . '/includes/service-card.php';

$services = [
    [
        'title'       => 'Premium Ski Instruction',
        'subtitle'    => 'Personalized Coaching',
        'description' => 'One-to-one coaching on blue and red runs, with instant video review after every descent.',
        'image'       => 'asset/services/ski-mountain-day.svg',
        'image_alt'   => 'Skier carving down a bright mountain slope',
        'duration'    => '1h',
        'level'       => 'All',
        'rating'      => 3,
        'status'      => 'Verified Coach',
        'href'        => '#premium-ski-instruction',
    ],
    [
        'title'       => 'Freeride Guiding',
        'subtitle'    => 'Off-Piste Adventure',
        'description' => 'Certified guides read the snowpack, then take you far beyond the marked runs.',
        'image'       => 'asset/services/ski-mountain-dusk.svg',
        'image_alt'   => 'Skier on a floodlit mountain slope at dusk',
        'duration'    => '1.5h',
        'level'       => 'Advanced',
        'rating'      => 5,
        'status'      => 'Guide Certified',
    ],
    [
        'title'       => 'Kids Snow Camp',
        'subtitle'    => 'Family Sessions',
        'description' => 'Playful group lessons that build real confidence on snow, six children per coach.',
        'image'       => 'asset/services/ski-mountain-sunset.svg',
        'image_alt'   => 'Skier on a mountain slope at sunset',
        'duration'    => '2h',
        'level'       => 'Beginner',
        'rating'      => 3,
        'status'      => 'Instructor Verified',
    ],
    [
        'title'       => 'Avalanche Safety Clinic',
        'subtitle'    => 'Backcountry Skills',
        'description' => 'Transceiver drills, snowpack analysis and rescue scenarios practised in real terrain.',
        'image'       => 'asset/services/ski-mountain-dusk.svg',
        'image_alt'   => 'Floodlit slope used for backcountry safety training',
        'duration'    => '3h',
        'level'       => 'Expert',
        'rating'      => 4,
        'status'      => 'Certified Rescue',
    ],
    [
        'title'       => 'Ski Equipment Fitting',
        'subtitle'    => 'Gear Consultation',
        'description' => 'Boot, binding and ski matching from a certified fitter before you reach the slope.',
        'image'       => 'asset/services/ski-mountain-day.svg',
        'image_alt'   => 'Sunlit mountain slope with fresh snow',
        'duration'    => '45m',
        'level'       => 'All',
        'rating'      => 3,
        'status'      => 'Fitter Certified',
    ],
    [
        'title'       => 'Alpine Race Training',
        'subtitle'    => 'Performance Coaching',
        'description' => 'Gate drills and timing analysis for competitive racers through the full season.',
        'image'       => 'asset/services/ski-mountain-sunset.svg',
        'image_alt'   => 'Race slope at sunset',
        'duration'    => '2h',
        'level'       => 'Advanced',
        'rating'      => 5,
        'status'      => 'Coach Verified',
    ],
    [
        'title'       => 'Guided Sunrise Tour',
        'subtitle'    => 'Scenic Experience',
        'description' => 'A first-lift ascent to a quiet summit, with a hot drink waiting at the top.',
        'image'       => 'asset/services/ski-mountain-sunset.svg',
        'image_alt'   => 'Mountain summit at sunrise',
        'duration'    => '1h',
        'level'       => 'All',
        'rating'      => 3,
        'status'      => 'Guide Certified',
    ],
    [
        'title'       => 'Night Ski Session',
        'subtitle'    => 'Floodlit Slopes',
        'description' => 'Coached laps under floodlights, with technique feedback after every single run.',
        'image'       => 'asset/services/ski-mountain-dusk.svg',
        'image_alt'   => 'Floodlit ski slope at night',
        'duration'    => '1.5h',
        'level'       => 'Intermediate',
        'rating'      => 4,
        'status'      => 'Instructor Verified',
    ],
];

$total = count($services);
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Service Card — Component Preview</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/service-card.css">
    <link rel="stylesheet" href="css/service-card-preview.css">
</head>
<body class="page">
<main class="preview">
    <div class="preview__shell">
        <h1 class="preview__title">Service Card Component</h1>
        <p class="preview__note">
            <?= (int) $total ?> demo records rendered from <code>includes/service-card.php</code>
            — no CDN, no external font, no inline styles or scripts.
        </p>

        <section class="preview__group" aria-labelledby="preview-slider">
            <h2 class="preview__label" id="preview-slider">Carousel / slider</h2>

            <div class="preview__surface">
                <div class="service-card-slider"
                     data-service-slider
                     role="region"
                     aria-roledescription="carousel"
                     aria-label="Popular ski services"
                     tabindex="0">
<?php foreach ($services as $position => $service): ?>
                    <?= renderServiceCard($service + [
                        'index'    => $position + 1,
                        'total'    => $total,
                        'carousel' => true,
                    ]) . "\n" ?>
<?php endforeach; ?>
                </div>

                <div class="service-card-slider__nav">
                    <button class="service-card-slider__control" type="button"
                            data-service-slider-prev aria-label="Previous service">&#8592;</button>
                    <span class="service-card-slider__dots" data-service-slider-dots></span>
                    <button class="service-card-slider__control" type="button"
                            data-service-slider-next aria-label="Next service">&#8594;</button>
                </div>

                <p class="preview__status" data-service-slider-status aria-live="polite">Card 1 of <?= (int) $total ?></p>
            </div>
        </section>

        <section class="preview__group" aria-labelledby="preview-grid">
            <h2 class="preview__label" id="preview-grid">Grid layout</h2>

            <div class="preview__surface">
                <div class="service-card-grid">
<?php foreach ($services as $position => $service): ?>
                    <?= renderServiceCard($service + [
                        'index' => $position + 1,
                        'total' => $total,
                    ]) . "\n" ?>
<?php endforeach; ?>
                </div>
            </div>
        </section>
    </div>
</main>

<script src="js/service-card-slider.js" defer></script>
</body>
</html>
