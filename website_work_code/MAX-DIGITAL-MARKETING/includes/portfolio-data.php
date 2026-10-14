<?php
declare(strict_types=1);

/*
 * =========================================================
 * MAX DIGITAL MARKETING
 * PORTFOLIO / OUR WORK — PROJECT DATA
 * ---------------------------------------------------------
 * Single source of truth for the 3D showcase in index.php.
 *
 * WHY A PHP ARRAY AND NOT data/portfolio.json
 *   data/portfolio.json exists but is 0 bytes, so it cannot be
 *   decoded yet. Reading it today would need error handling for an
 *   empty file and would render an empty gallery if it stayed empty.
 *   This array is deliberately 1:1 with the requested JSON shape
 *   (id, title, category, image, url, description) so it can be
 *   moved into data/portfolio.json in a single step later:
 *
 *       file_put_contents('data/portfolio.json',
 *           json_encode(portfolioProjects(), JSON_PRETTY_PRINT));
 *
 * PLACEHOLDER CONTENT NOTICE
 *   Every title, category, description and URL below is DEMO data.
 *   There are no real client names, no results, no metrics and no
 *   real project URLs — inventing those would be unsupported
 *   claims. Replace the array contents once real work is supplied;
 *   nothing else in the codebase needs to change.
 *
 *   `image` points at asset/portfolio/<slug>.jpg. Those files do not
 *   exist yet: the card renders a branded wireframe placeholder and
 *   js/portfolio.js flags the card so the missing file is visible to
 *   assistive tech instead of showing a broken-image icon.
 * =========================================================
 */

if (!function_exists('portfolioProjects')) {
    /**
     * Nine projects: index 0 is the FEATURED centre card, the rest
     * fill the 3D ring. Order is clockwise from the front.
     *
     * @return array<int, array{
     *     id: int,
     *     title: string,
     *     category: string,
     *     image: string,
     *     url: string,
     *     description: string
     * }>
     */
    function portfolioProjects(): array
    {
        return [
            [
                'id' => 1,
                'title' => 'Northwind',
                'category' => 'Corporate Website',
                'image' => 'asset/portfolio/northwind.jpg',
                'url' => 'portfolio.php?project=northwind',
                'description' => 'A multi-section corporate site structured for clear messaging and a fast first paint.',
            ],
            [
                'id' => 2,
                'title' => 'Studio Form',
                'category' => 'Web Development',
                'image' => 'asset/portfolio/studio-form.jpg',
                'url' => 'portfolio.php?project=studio-form',
                'description' => 'Responsive front-end build with a component-driven layout system.',
            ],
            [
                'id' => 3,
                'title' => 'Meridian',
                'category' => 'SEO',
                'image' => 'asset/portfolio/meridian.jpg',
                'url' => 'portfolio.php?project=meridian',
                'description' => 'Technical SEO foundations, structured data and content architecture.',
            ],
            [
                'id' => 4,
                'title' => 'Cobalt',
                'category' => 'E-Commerce',
                'image' => 'asset/portfolio/cobalt.jpg',
                'url' => 'portfolio.php?project=cobalt',
                'description' => 'A product experience designed around browsing speed and clear purchase paths.',
            ],
            [
                'id' => 5,
                'title' => 'Lumen',
                'category' => 'Creative & Content',
                'image' => 'asset/portfolio/lumen.jpg',
                'url' => 'portfolio.php?project=lumen',
                'description' => 'Brand direction and content production carried across every channel.',
            ],
            [
                'id' => 6,
                'title' => 'Vertex',
                'category' => 'Digital Strategy',
                'image' => 'asset/portfolio/vertex.jpg',
                'url' => 'portfolio.php?project=vertex',
                'description' => 'Positioning, messaging and channel planning for a growing brand.',
            ],
            [
                'id' => 7,
                'title' => 'Signal',
                'category' => 'Technology & AI',
                'image' => 'asset/portfolio/signal.jpg',
                'url' => 'portfolio.php?project=signal',
                'description' => 'AI-assisted research and workflow automation behind a marketing team.',
            ],
            [
                'id' => 8,
                'title' => 'Harbourline',
                'category' => 'Performance Marketing',
                'image' => 'asset/portfolio/harbourline.jpg',
                'url' => 'portfolio.php?project=harbourline',
                'description' => 'Paid search and social built around testing and steady iteration.',
            ],
            [
                'id' => 9,
                'title' => 'Solstice',
                'category' => 'Web Development',
                'image' => 'asset/portfolio/solstice.jpg',
                'url' => 'portfolio.php?project=solstice',
                'description' => 'A long-form editorial build with a careful typographic system.',
            ],
            [
                'id' => 10,
                'title' => 'Kestrel',
                'category' => 'E-Commerce',
                'image' => 'asset/portfolio/kestrel.jpg',
                'url' => 'portfolio.php?project=kestrel',
                'description' => 'A storefront built around fast browsing and clear product detail.',
            ],
            [
                'id' => 11,
                'title' => 'Halcyon',
                'category' => 'Digital Strategy',
                'image' => 'asset/portfolio/halcyon.jpg',
                'url' => 'portfolio.php?project=halcyon',
                'description' => 'A repositioning project that aligned brand and product.',
            ],
            [
                'id' => 12,
                'title' => 'Vantage',
                'category' => 'SEO',
                'image' => 'asset/portfolio/vantage.jpg',
                'url' => 'portfolio.php?project=vantage',
                'description' => 'Technical cleanup and content architecture for a large site.',
            ],
            [
                'id' => 13,
                'title' => 'Nimbus',
                'category' => 'Technology & AI',
                'image' => 'asset/portfolio/nimbus.jpg',
                'url' => 'portfolio.php?project=nimbus',
                'description' => 'An automated content pipeline with a human review stage.',
            ],
            [
                'id' => 14,
                'title' => 'Arcline',
                'category' => 'Creative & Content',
                'image' => 'asset/portfolio/arcline.jpg',
                'url' => 'portfolio.php?project=arcline',
                'description' => 'Campaign creative and launch content produced as one system.',
            ],
            [
                'id' => 15,
                'title' => 'Aperture',
                'category' => 'Performance Marketing',
                'image' => 'asset/portfolio/aperture.jpg',
                'url' => 'portfolio.php?project=aperture',
                'description' => 'Paid media restructured around testing and steady iteration.',
            ],
        ];
    }
}
