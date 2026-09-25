<?php
declare(strict_types=1);

/*
 * =========================================================
 * MAX DIGITAL MARKETING
 * COMPONENT — SERVICE CARD
 * ---------------------------------------------------------
 * Presentation-only renderer for the white service card used
 * by the carousel and grid containers.
 *
 * Markup only: every rule lives in css/service-card.css, so
 * the component can be dropped on any page that links that
 * single stylesheet.
 *
 * Usage:
 *   require_once __DIR__ . '/includes/service-card.php';
 *   echo renderServiceCard([
 *       'title'       => 'Premium Ski Instruction',
 *       'subtitle'    => 'Personalized Coaching',
 *       'description' => '...',
 *       'image'       => 'asset/services/ski-mountain-day.svg',
 *       'badge'       => '1/8 Services',
 *       'duration'    => '1h',
 *       'level'       => 'All',
 *       'rating'      => 3,
 *       'status'      => 'Verified Coach',
 *   ]);
 * =========================================================
 */

if (!function_exists('serviceCardEscape')) {
    /**
     * Local escape helper so the component also works on a page
     * that has not required includes/header.php.
     */
    function serviceCardEscape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('serviceCardIcon')) {
    /**
     * Inline 24x24 stroke icons. Inlined on purpose: the card must
     * render without an icon font, a sprite sheet or a CDN request.
     */
    function serviceCardIcon(string $name): string
    {
        $paths = [
            'duration' => '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.7V12l2.9 1.9"/>',
            'level'    => '<path d="M4.6 19.4V12M9.9 19.4V4.6M15.2 19.4v-5.1M20.6 19.4H3.4"/>',
            'verified' => '<circle cx="12" cy="12" r="8.4"/><path d="M8.4 12.3l2.4 2.4 4.8-5"/>',
        ];

        if (!isset($paths[$name])) {
            return '';
        }

        return '<svg class="service-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
            . ' stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'
            . ' focusable="false">' . $paths[$name] . '</svg>';
    }
}

if (!function_exists('serviceCardStars')) {
    /**
     * Five SVG stars. The numeric value is exposed separately as
     * screen-reader-only text so the rating is not icon-only.
     */
    function serviceCardStars(float $rating): string
    {
        $filled = (int) round(max(0.0, min(5.0, $rating)));
        $stars = '';

        for ($index = 1; $index <= 5; $index++) {
            $state = $index <= $filled ? 'on' : 'off';

            $stars .= '<svg class="service-card__star service-card__star--' . $state . '"'
                . ' viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">'
                . '<path d="M12 3.6l2.62 5.31 5.86.85-4.24 4.14 1 5.83L12 16.98l-5.24 2.75 1-5.83L3.52 9.76l5.86-.85z"/>'
                . '</svg>';
        }

        return $stars;
    }
}

if (!function_exists('renderServiceCard')) {
    /**
     * Render one service card.
     *
     * Required:  title (string), image (local path, relative to web root)
     * Optional:  subtitle, description, status, href, badge, image_alt,
     *            duration (e.g. '1h'), level (e.g. 'All'),
     *            rating (0-5; 0 hides the rating fact),
     *            index + total (builds the '1/8 Services' badge),
     *            carousel (bool — adds [data-carousel-card] / slide ARIA
     *            hooks with no styling side effects).
     */
    function renderServiceCard(array $card): string
    {
        $title = (string) ($card['title'] ?? '');
        $subtitle = (string) ($card['subtitle'] ?? '');
        $description = (string) ($card['description'] ?? '');
        $image = (string) ($card['image'] ?? '');
        $imageAlt = (string) ($card['image_alt'] ?? $title);
        $duration = (string) ($card['duration'] ?? '');
        $level = (string) ($card['level'] ?? '');
        $status = (string) ($card['status'] ?? '');
        $href = (string) ($card['href'] ?? '');

        $rating = max(0.0, min(5.0, (float) ($card['rating'] ?? 0)));

        $badge = (string) ($card['badge'] ?? '');

        if ($badge === '' && isset($card['index'], $card['total'])) {
            $badge = (string) $card['index'] . '/' . (string) $card['total'] . ' Services';
        }

        $attributes = 'class="service-card"';

        if (!empty($card['carousel'])) {
            $slideLabel = $badge !== '' ? $badge . ' — ' . $title : $title;

            $attributes .= ' data-carousel-card'
                . ' data-index="' . (int) ($card['index'] ?? 0) . '"'
                . ' role="group"'
                . ' aria-roledescription="slide"'
                . ' aria-label="' . serviceCardEscape($slideLabel) . '"';
        }

        $badgeMarkup = $badge === ''
            ? ''
            : '<span class="service-card__badge">' . serviceCardEscape($badge) . '</span>';

        /* -------- Media banner -------- */

        $mediaMarkup = $image === ''
            ? ''
            : '<div class="service-card__media">'
                . '<img class="service-card__image"'
                . ' src="' . serviceCardEscape($image) . '"'
                . ' alt="' . serviceCardEscape($imageAlt) . '"'
                . ' width="1200" height="800"'
                . ' loading="lazy" decoding="async">'
                . '</div>';

        /* -------- Heading -------- */

        $titleMarkup = $href === ''
            ? serviceCardEscape($title)
            : '<a class="service-card__title-link" href="' . serviceCardEscape($href) . '">'
                . serviceCardEscape($title) . '</a>';

        /* -------- Footer facts -------- */

        $facts = '';

        if ($duration !== '') {
            $facts .= '<li class="service-card__fact">'
                . serviceCardIcon('duration')
                . '<span>' . serviceCardEscape($duration) . '</span></li>';
        }

        if ($level !== '') {
            $facts .= '<li class="service-card__fact">'
                . serviceCardIcon('level')
                . '<span>' . serviceCardEscape($level) . '</span></li>';
        }

        if ($rating > 0) {
            $ratingLabel = rtrim(rtrim(number_format($rating, 1, '.', ''), '0'), '.');

            $facts .= '<li class="service-card__fact service-card__fact--rating">'
                . '<span class="service-card__stars" aria-hidden="true">' . serviceCardStars($rating) . '</span>'
                . '<span class="service-card__sr-only">Rated ' . serviceCardEscape($ratingLabel) . ' out of 5</span>'
                . '</li>';
        }

        $factsMarkup = $facts === ''
            ? ''
            : '<ul class="service-card__facts">' . $facts . '</ul>';

        $statusMarkup = $status === ''
            ? ''
            : '<span class="service-card__status">'
                . serviceCardIcon('verified')
                . '<span>' . serviceCardEscape($status) . '</span>'
                . '</span>';

        return '<article ' . $attributes . '>'
            . $badgeMarkup
            . $mediaMarkup
            . '<div class="service-card__body">'
            . '<h3 class="service-card__title">' . $titleMarkup . '</h3>'
            . ($subtitle === '' ? '' : '<p class="service-card__subtitle">' . serviceCardEscape($subtitle) . '</p>')
            . ($description === '' ? '' : '<p class="service-card__description">' . serviceCardEscape($description) . '</p>')
            . '</div>'
            . '<footer class="service-card__meta">' . $factsMarkup . $statusMarkup . '</footer>'
            . '</article>';
    }
}
