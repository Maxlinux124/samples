<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

$pageTitle = $pageTitle ?? SITE_NAME;
$pageDescription = $pageDescription ?? 'A digital marketing agency focused on measurable growth.';
$pageCanonical = $pageCanonical ?? SITE_URL;
$pageBodyClass = $pageBodyClass ?? 'page';

function escapeHtml(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="<?= escapeHtml($pageDescription) ?>">
    <link rel="canonical" href="<?= escapeHtml($pageCanonical) ?>">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="<?= escapeHtml(SITE_NAME) ?>">
    <meta property="og:title" content="<?= escapeHtml($pageTitle) ?>">
    <meta property="og:description" content="<?= escapeHtml($pageDescription) ?>">
    <meta property="og:url" content="<?= escapeHtml($pageCanonical) ?>">
    <meta property="og:image" content="<?= escapeHtml(SITE_URL) ?>assets/images/og-placeholder.jpg">
    <title><?= escapeHtml($pageTitle) ?></title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/animations.css">
    <link rel="stylesheet" href="css/responsive.css">
</head>
<body class="<?= escapeHtml($pageBodyClass) ?>">
    <a class="skip-link" href="#main-content">Skip to main content</a>
