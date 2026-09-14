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
                

                <!-- Glowing Cyber Arc Connection Lines (Visual Network Effect) -->
    <svg class="network-arcs-svg" viewBox="0 0 500 500" preserveAspectRatio="none">
        <path class="arc-line arc-1" d="M 200,250 Q 320,100 450,150" />
        <path class="arc-line arc-2" d="M 220,280 Q 350,200 480,280" />
        <path class="arc-line arc-3" d="M 210,320 Q 340,380 460,390" />
    </svg>

    <!-- Right-Side Floating Glass Icons Network -->
    <!-- Top Arc Elements -->
    <div class="sm-glass-card card-small pos-html" title="HTML5">
        <svg viewBox="0 0 24 24" class="svg-icon"><path fill="#E34F26" d="M1.5 0h21l-1.91 21.563L11.97 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.058h8.421l-.342 3.826-2.222.6-2.228-.6-.144-1.618H6.98l.288 3.332 4.702 1.303 4.702-1.303.655-7.308H8.531z"/></svg>
    </div>

    <div class="sm-glass-card card-small pos-wp" title="WordPress">
        <svg viewBox="0 0 24 24" class="svg-icon"><path fill="#21759B" d="M12.158 0C5.457 0 0 5.457 0 12.158c0 5.097 3.142 9.458 7.598 11.237l-4.14-11.334c.54-.027 1.05-.084 1.05-.084.475-.056.418-.755-.058-.727 0 0-1.42.112-2.336.112-.863 0-2.281-.112-2.281-.112-.476-.028-.532.671-.056.727 0 0 .48.057.966.084l4.032 11.026A12.106 12.106 0 010 12.158C0 5.457 5.457 0 12.158 0zm6.273 12.215c0-2.092-.752-3.551-1.401-4.689-.863-1.423-1.673-2.618-1.673-4.032 0-1.589 1.202-3.067 2.899-3.067.073 0 .142.008.214.012A12.08 12.08 0 0012.158.158c-3.805 0-7.202 1.76-9.432 4.512 1.348-.04 2.624.218 2.624.218.476.056.42.755-.056.727 0 0-.48-.057-.966-.084l2.846 7.794 1.7-5.088-1.212-3.328c.476-.027.966-.084.966-.084.476-.056.42-.755-.056-.727 0 0-1.42.112-2.336.112-.132 0-.301-.003-.483-.008A12.128 12.128 0 0112.158.158c2.404 0 4.63.702 6.502 1.91-.252.883-.538 1.921-.538 3.09 0 2.302 1.34 4.089 2.766 6.182.973 1.45 1.968 3.125 1.968 5.61 0 .954-.153 1.834-.413 2.628l-.053.18-2.697-7.543zm-3.882 11.516l3.654-10.596c.642 1.31 1.256 2.818 1.256 4.382 0 1.282-.284 2.385-.689 3.391a12.086 12.086 0 01-4.221 2.823z"/></svg>
    </div>

    <div class="sm-glass-card card-small pos-php" title="PHP">
        <svg viewBox="0 0 24 24" class="svg-icon"><path fill="#777BB4" d="M11.547 10.323c-.347 0-.61.108-.79.323-.18.217-.23.513-.153.89l.385 1.916c.077.388.243.682.5.882.257.2.593.3 1.01.3.385 0 .67-.107.854-.32.185-.214.238-.51.16-.893l-.384-1.905c-.08-.39-.247-.688-.503-.892-.258-.204-.593-.306-1.008-.306zm10.742-5.836H1.711C.766 4.487 0 5.253 0 6.2v11.6c0 .945.766 1.713 1.711 1.713h20.578c.945 0 1.711-.768 1.711-1.713V6.2c0-.947-.766-1.713-1.711-1.713zm-14.77 10.37h-1.39l.863-4.303h1.868c.552 0 .964.12 1.236.36.27.24.343.59.217 1.05-.133.51-.433.91-.9 1.2-.468.29-1.077.435-1.828.435h-.066l-.066-.023v1.28zm5.72 0h-1.426l1.398-6.974h1.427l-.438 2.186h1.72l.438-2.186h1.427l-1.398 6.974h-1.427l.462-2.31h-1.72l-.463 2.31zm5.228-2.671h1.39l-.863 4.303h-1.868c-.552 0-.964-.12-1.236-.36-.27-.24-.343-.59-.217-1.05.133-.51.433-.91.9-1.2.468-.29-1.077.435-1.828.435h.066l.066.023v-1.28z"/></svg>
    </div>

    <!-- Middle Right Arc Elements -->
    <div class="sm-glass-card card-small pos-python" title="Python">
        <svg viewBox="0 0 24 24" class="svg-icon"><path fill="#3776AB" d="M11.898 0c-5.26 0-4.922 2.28-4.922 2.28l.006 2.355h4.985v.702H5.013S1.61 5.012 1.61 10.334c0 5.32 2.973 5.127 2.973 5.127h1.777v-2.49s-.096-2.973 2.92-2.973h4.983s2.825.044 2.825-2.732V2.28S17.472 0 11.898 0zm-2.69 1.488c.478 0 .864.387.864.865a.865.865 0 1 1-1.728 0c0-.478.386-.865.864-.865z"/><path fill="#FFD43B" d="M12.102 24c5.26 0 4.922-2.28 4.922-2.28l-.006-2.355h-4.985v-.702h6.954s3.403.325 3.403-4.997c0-5.32-2.973-5.127-2.973-5.127h-1.777v2.49s.096 2.973-2.92 2.973H9.736s-2.825-.044-2.825 2.732v5.008S6.528 24 12.102 24zm2.69-1.488a.865.865 0 1 1 0-1.73.865.865 0 0 1 0 1.73z"/></svg>
    </div>

    <div class="sm-glass-card card-small pos-java" title="Java">
        <svg viewBox="0 0 24 24" class="svg-icon"><path fill="#5382A1" d="M8.851 18.56s-.917.534.612.656c1.872.149 4.423-.082 6.033-.822 0 0 .428.272.903.488-2.617 1.285-7.857 1.285-9.682-.322h2.134zm-1.897-2.422s-1.026.69.45.823c2.253.204 5.688.068 7.822-.853 0 0 .313.29.695.45-3.178 1.323-9.52 1.309-11.23-.42h2.263zm10.741-2.946s.463.858-.49 1.541c-1.28.913-3.238 1.485-5.59 1.526-2.126.037-4.22-.303-5.385-.859 0 0 .327-.354 1.022-.504 1.472.436 3.791.681 5.927.572 2.058-.105 3.737-.585 4.516-2.276z"/><path fill="#E76F00" d="M12.981 1.05s2.588 2.656-1.035 6.021c-2.915 2.709-1.008 4.236.027 6.021-2.316-2.071-3.21-3.951-1.335-5.83 2.506-2.518 3.235-3.844 2.343-6.212z"/></svg>
    </div>

    <!-- Featured Ads Large Glass Cards (Right Mid) -->
    <div class="sm-glass-card card-large pos-fbads">
        <div class="card-icon-badge">
            <svg viewBox="0 0 24 24" class="svg-icon"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </div>
        <div class="card-info">
            <strong>Meta Campaigns</strong>
            <small>Engajamento Total</small>
        </div>
    </div>

    <div class="sm-glass-card card-large pos-googleads">
        <div class="card-icon-badge">
            <svg viewBox="0 0 24 24" class="svg-icon"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3c0 2.9.7 5.6 1.9 8l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"/></svg>
        </div>
        <div class="card-info">
            <strong>Google Ads</strong>
            <small>Conversão de Vendas</small>
        </div>
    </div>

    <!-- Lower Right Elements -->
    <div class="sm-glass-card card-small pos-pr" title="Premiere Pro">
        <svg viewBox="0 0 24 24" class="svg-icon"><rect width="24" height="24" rx="5" fill="#00005B"/><path fill="#9999FF" d="M5 6h4.5c2.2 0 3.5 1.1 3.5 2.8 0 1.8-1.3 2.9-3.5 2.9H7.2V18H5V6zm2.2 4h2c1 0 1.7-.5 1.7-1.2s-.7-1.2-1.7-1.2h-2V10zm11.8 8h-2.1v-1.1c-.5.8-1.3 1.3-2.3 1.3-1.6 0-2.6-1.1-2.6-2.9v-4.5h2.1v4.1c0 .9.5 1.5 1.3 1.5.9 0 1.5-.6 1.5-1.6v-4h2.1V18z"/></svg>
    </div>

    <div class="sm-glass-card card-small pos-canva" title="Canva">
        <svg viewBox="0 0 24 24" class="svg-icon"><circle cx="12" cy="12" r="12" fill="#00C4CC"/><path fill="#FFF" d="M12.8 8.6c-.6 0-1.1.2-1.5.6l-.3-.5h-1.3v8.6h1.5v-4.5c0-.9.6-1.5 1.4-1.5s1.2.5 1.2 1.4v4.6h1.5v-4.8c0-1.7-.9-2.9-2.5-2.9z"/></svg>
    </div>

    <div class="sm-glass-card card-small pos-logo" title="Logo Design">
        <svg viewBox="0 0 24 24" class="svg-icon"><path fill="#FFB703" d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 21l3.61-.62C9.48 20.73 10.71 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-3 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
    </div>

    <!-- Real-time Live Analytics Board (Right Center Mesh Area) -->
    <div class="sm-glass-card card-analytics-board pos-board-right">
        <div class="board-header">
            <span>CRESCIMENTO DE SEGUIDORES</span>
            <small id="growth-percent">+148%</small>
        </div>
        <canvas id="heroAnalyticsCanvas" width="220" height="70"></canvas>
    </div>
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