<?php

// Sabse pehle session start karein taaki header error na de
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include_once "db.php";
$conn = getDBConnection();

// --- 1. SETTING DEFAULTS ---
$base_url = "https://" . $_SERVER['HTTP_HOST'];
$pageTitle = "ClassifyX – Free Classified Ads | Buy · Sell · Connect Instantly";
$metaDescription = "Thousands trust ClassifyX daily for safe trading. Post free ads for jobs, vehicles, and services. Fast, Easy & Secure!";
$metaKeywords = "classifieds, free ads, jobs, property, vehicles, electronics, services, online marketplace";
$canonical = $base_url . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// --- 2. DYNAMIC SEO FOR CATEGORIES ---
if(isset($_GET['cat']) && !empty($_GET['cat'])){
   $cat_raw = $_GET['cat'];
   $cat_clean = htmlspecialchars(ucfirst(str_replace('-', ' ', $cat_raw)));

   $pageTitle = "$cat_clean - Verified Local Listings | ClassifyX";
   $metaDescription = "Looking for $cat_clean? Skip the middleman and chat directly with sellers. Every listing is verified for a safe trading experience on ClassifyX.";
   $metaKeywords = strtolower($cat_clean) . ", free ads, local marketplace, verified $cat_clean";
   $canonical = $base_url . "/index.php?cat=" . urlencode($cat_raw);
}

// --- 3. SEARCH SEO ---
if(isset($_GET['q']) && !empty($_GET['q'])){
   $q = htmlspecialchars($_GET['q']);
   $pageTitle = "Results for '$q' | Verified Ads | ClassifyX";
   $metaDescription = "Find the best deals for '$q'. Our system guides you through safe transactions to ensure your money is protected.";
   $canonical = $base_url . "/index.php?q=" . urlencode($q);
}

// --- 4. DATA FETCHING (PREPARED STATEMENTS) ---
$ads = [];

if(isset($_GET['q']) && !empty($_GET['q'])){
    // Search logic with Prepared Statement
    $q_search = "%" . $_GET['q'] . "%";
    $stmt = $conn->prepare("SELECT * FROM ads WHERE title LIKE ? OR description LIKE ? ORDER BY created_at DESC");
    $stmt->bind_param("ss", $q_search, $q_search);
    $stmt->execute();
    $ads = $stmt->get_result();
} elseif(isset($_GET['cat']) && !empty($_GET['cat'])){
    // Category logic
    $stmt = $conn->prepare("SELECT * FROM ads WHERE category=? ORDER BY created_at DESC");
    $stmt->bind_param("s", $_GET['cat']);
    $stmt->execute();
    $ads = $stmt->get_result();
} else {
    // Default Home Page Ads
    $ads = $conn->query("SELECT * FROM ads ORDER BY created_at DESC LIMIT 12");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="google-adsense-account" content="ca-pub-8973475809909904">
    <meta name="89ff60bd7ca41ed6c498edf53c7b19bd4b5c2b38" content="89ff60bd7ca41ed6c498edf53c7b19bd4b5c2b38" />

    <meta name="google-site-verification" content="suAMAqkrTPI65wo7K45nGRLBZZrYHtRCLE29ZO9ABZ8" />

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="google-site-verification" content="BPU6mv-kEGKdvL3qTnPBPmK29CWpb2-RJxxaI1vy4_U" />

  <!-- Site Icon / Favicon -->
  <link rel="icon" type="image/png" href="uploads/logo7.png" sizes="32x32" >
  <link rel="apple-touch-icon" href="uploads/logo7.png" >
  <meta name="theme-color" content="#ffffff">

<title><?php echo htmlspecialchars($pageTitle); ?></title>
<meta name="description" content="<?php echo htmlspecialchars($metaDescription); ?>">
<meta name="keywords" content="<?php echo htmlspecialchars($metaKeywords); ?>">
<link rel="canonical" href="<?php echo htmlspecialchars($canonical); ?>">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
<script src="https://cdn.tailwindcss.com"></script>

<!-- --- CSS --- -->
<link rel="stylesheet" href="assets/css/index.css">
</head>
<body class="overflow-x-hidden">
  <?php include_once "header.php"; ?>

  <!-- Mobile Menu Script -->



<?php include __DIR__ . '/app/Views/partials/home/hero-search.php'; ?>

<?php include __DIR__ . '/app/Views/partials/home/category-grid.php'; ?>

<?php include __DIR__ . '/app/Views/partials/home/latest-ad-grid.php'; ?>

<?php include __DIR__ . '/app/Views/partials/home/chat-widget.php'; ?>

<?php include __DIR__ . '/app/Views/partials/home/story-section.php'; ?>

<?php include __DIR__ . '/app/Views/partials/home/trust-stats.php'; ?>

<?php include __DIR__ . '/app/Views/partials/home/how-it-works.php'; ?>

<?php include __DIR__ . '/app/Views/partials/home/whatsapp-button.php'; ?>

<!-- --- FOOTER --- -->

 <?php include_once "footer.php"; ?>








<script src="assets/js/index.js"></script>
<?php $conn->close(); ?>
</body>
</html>
