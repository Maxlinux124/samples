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
<style>
body { font-family: 'Inter', sans-serif; background: #ffffffff; margin:0; padding:0; }

/* Header */
header { background: #fff; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
header .logo { font-weight: bold; font-size: 1.5rem; color: #007bff; cursor: pointer; }
header nav a { margin:0 0.5rem; text-decoration:none; color:#333; font-weight:500; transition: all 0.3s ease; }
header nav a:hover { color:#007bff; transform:translateY(-2px); }
header nav a.signup { color:white; font-weight:bold; padding:0.5rem 1rem; border-radius:0.5rem; border:2px solid transparent; transition: all 0.3s ease; }
header nav a.signup:hover { background:#007bff; color:#fff; border-color:#007bff; }

/* Hero Section */
.hero-bg { background: linear-gradient(to right, #053b7c, #3c8efc); animation: moveGradient 15s linear infinite; color: white; text-align:center; padding:5rem 1rem; }
@keyframes moveGradient { 0% {background-position:0%} 50% {background-position:100%} 100% {background-position:0%} }
.hero-bg h1 { font-size:2rem; font-weight:bold; }
.hero-bg p { margin-top:0.5rem; font-size:1rem; }
.hero-bg .btn-post:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.2); }

/* Search Form */
form input, form select, form button { padding:0.75rem; border-radius:1rem; border:1px solid #ccc; font-size:0.875rem; }
form button { background:#2563eb; color:white; cursor:pointer; transition: all 0.3s ease; }
form button:hover { background:#1e40af; }

/* Cards */
.card { transition: all 0.3s ease; border-radius:1rem; overflow:hidden; }
.card:hover { transform:translateY(-5px); box-shadow:0 10px 20px rgba(0,0,0,0.1); }
.card h3 { font-size:0.9rem; margin-bottom:0.25rem; }
.card img { height:200px; width:100%; object-fit:cover; }
@media (min-width: 768px) {
  .hero-bg h1 { font-size:3rem; }
  .hero-bg p { font-size:1.25rem; }
  .card h3 { font-size:1rem; }
  .card img { height:12rem; }
}

/* Footer */
footer { background:#111827; color:#d1d5db; padding:3rem 1rem; text-align:center; }

/* Mobile Nav Toggle */
#menu-btn { display:none; }
@media (max-width: 768px) {
  #menu-btn { display:block; }
  #menu { display:none; flex-direction:column; width:100%; text-align:center; }
  #menu a { margin:0.5rem 0; display:block; }
}

</style>
</head>
<body class="overflow-x-hidden">
  <?php include_once "header.php"; ?>

  <!-- Mobile Menu Script -->
<script>
document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.getElementById("menu-btn");
  const menu = document.getElementById("menu");

  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      menu.classList.toggle("hidden");
    });
  }
});
</script>
<style>
  /* GLOBAL SMOOTH ANIMATIONS */
* {
  transition: all 0.35s ease-in-out;
}

/* Hero Section */
.hero-bg {
  animation: gradientMove 15s linear infinite, heroFadeIn 1s ease forwards;
}
@keyframes heroFadeIn {
  0% { opacity:0; transform:translateY(20px); }
  100% { opacity:1; transform:translateY(0); }
}
@keyframes gradientMove {
  0% { background-position:0% 50%; }
  50% { background-position:100% 50%; }
  100% { background-position:0% 50%; }
}

/* Buttons */
.btn-post, .btn-outline, .card a, .card button, #chatButton {
  transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
}
.btn-post:hover, .btn-outline:hover, .card a:hover, .card button:hover, #chatButton:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

/* Cards */
.card {
  opacity: 0;
  transform: translateY(20px);
  animation: cardFadeIn 0.6s ease forwards;
}
.card:nth-child(1){ animation-delay:0.1s; }
.card:nth-child(2){ animation-delay:0.2s; }
.card:nth-child(3){ animation-delay:0.3s; }
.card:nth-child(4){ animation-delay:0.4s; }
@keyframes cardFadeIn {
  to { opacity:1; transform:translateY(0); }
}

/* Popups */
.popup, .no-result {
  animation: fadeSlide 0.5s ease forwards;
}
@keyframes fadeSlide {
  0% { opacity:0; transform:translateY(20px); }
  100% { opacity:1; transform:translateY(0); }
}

/* Chat Box & Messages */
#chatPopupBox {
  animation: slideUpFade 0.5s ease forwards;
}
@keyframes slideUpFade {
  0% { opacity:0; transform: translateY(100%); }
  100% { opacity:1; transform: translateY(0); }
}
#chatMessages p {
  animation: msgFade 0.3s ease forwards;
}
@keyframes msgFade {
  0% { opacity:0; transform:translateY(10px); }
  100% { opacity:1; transform:translateY(0); }
}

/* Categories Grid */
.grid a {
  opacity:0; transform:translateY(20px);
  animation: fadeUp 0.6s ease forwards;
}
.grid a:nth-child(1){ animation-delay:0.1s; }
.grid a:nth-child(2){ animation-delay:0.2s; }
.grid a:nth-child(3){ animation-delay:0.3s; }
.grid a:nth-child(4){ animation-delay:0.4s; }
.grid a:nth-child(5){ animation-delay:0.5s; }
.grid a:nth-child(6){ animation-delay:0.6s; }
@keyframes fadeUp {
  to { opacity:1; transform:translateY(0); }
}
</style>

<!-- --- HERO SECTION --- -->
<section class="hero-bg">
  <style>
    body {
      margin:0;
      font-family:'Poppins',sans-serif;
      background:#ffffff; /* stable background */
    }

    .hero-bg {
      text-align:center;
      padding:6rem 1rem 7rem;
      background: linear-gradient(120deg, #030304, #2563eb);
      color:#fff;
      position:relative;
      overflow:hidden;
      border-bottom-left-radius:500px;
      border-bottom-right-radius:500px;
      box-shadow:0 12px 30px rgba(0,0,0,0.25);
    }
    .hero-bg h1 { font-size:2.5rem; font-weight:600; margin-bottom:12px; }
    .hero-bg p { font-size:1.2rem; font-weight:300; margin-bottom:34px; color:#f3f4f6; }

    .btn-post, .btn-outline {
      display:inline-block; padding:14px 32px; border-radius:999px;
      font-weight:500; font-size:16px; text-decoration:none; cursor:pointer;
      transition:all 0.3s ease; margin:10px;
    }
    .btn-post { background:#fff; color:#2563eb; box-shadow:0 6px 18px rgba(255,255,255,0.25); }
    .btn-post:hover { transform:translateY(-3px) scale(1.04); box-shadow:0 10px 25px rgba(255,255,255,0.35); }
    .btn-outline { border:2px solid #fff; color:#fff; box-shadow:0 6px 18px rgba(0,0,0,0.25); }
    .btn-outline:hover { background:#fff; color:#2563eb; transform:translateY(-3px) scale(1.04); box-shadow:0 10px 25px rgba(0,0,0,0.3); }

    /* Search box */
    .search-box { margin-top:40px; display:flex; justify-content:center; flex-wrap:wrap; }
    .search-wrapper { position:relative; width:340px; }
    .search-input {
      padding:14px 50px 14px 45px;
      border-radius:999px; border:2px solid #fff;
      background:rgba(255,255,255,0.15); color:#fff; width:100%;
      font-size:16px; outline:none; transition:border .3s, background .3s;
    }
    .search-input:focus { border-color:#93c5fd; background:rgba(255,255,255,0.25); }
    .voice-btn, .search-icon {
      position:absolute; top:50%; transform:translateY(-50%);
      border:none; background:transparent; color:#fff; font-size:20px;
      cursor:pointer; transition:color 0.3s;
    }
    .search-icon { left:14px; cursor:pointer; }
    .voice-btn { right:14px; }
    .voice-btn:hover, .search-icon:hover { color:#93c5fd; }

    /* Results container */
    .results {
      max-width:900px;
      margin:50px auto;
      padding:0 15px;
      text-align:left;
    }

    .ad-box {
      background:#fff;
      padding:20px;
      margin:20px auto;
      border-radius:16px;
      box-shadow:0 6px 18px rgba(0,0,0,0.12);
      display:flex;
      align-items:flex-start;
      gap:15px;
      text-decoration:none;
      color:inherit;
      transition:transform 0.2s, box-shadow 0.3s;
    }
    .ad-box:hover {
      transform:translateY(-4px);
      box-shadow:0 8px 22px rgba(0,0,0,0.2);
    }
    .ad-img {
      width:65px; height:65px;
      border-radius:50%;
      object-fit:cover;
      box-shadow:0 4px 10px rgba(0,0,0,0.15);
      pointer-events:none; /* disable click on image only */
    }
    .ad-content { flex:1; }
    .ad-box h3 { margin:0 0 6px; color:#2563eb; font-size:18px; }
    .ad-box p { margin:0; color:#444; font-size:15px; }

    /* No Result Popup */
    .popup {
      display:none; position:fixed; top:0; left:0;
      width:100%; height:100%; background:rgba(0,0,0,0.65);
      backdrop-filter:blur(6px); justify-content:center; align-items:center;
      z-index:9999;
    }
    .popup-content {
      background:#1e293b;
      border:1px solid #38bdf8;
      color:#fff;
      padding:30px; border-radius:20px; text-align:center;
      width:90%; max-width:400px;
      box-shadow:0 0 25px rgba(56,189,248,0.8);
    }

    /* Mobile Responsive */
@media (max-width: 640px) {
    .hero-card { padding: 40px 20px; }
    .main-title { font-size: 36px; }
}

    /* Listening animation */
    .listening {
      margin-top:15px; width:50px; height:50px;
      border-radius:50%; background:rgba(0,255,255,0.15);
      border:2px solid cyan;
      animation:pulse 1.2s infinite ease-in-out;
      margin-left:auto; margin-right:auto;
    }
    @keyframes pulse {
      0% { transform:scale(1); opacity:1; }
      50% { transform:scale(1.3); opacity:0.6; }
      100% { transform:scale(1); opacity:1; }
    }

    
  </style>
<section style=" padding: 20px 20px; display: flex; justify-content: center; font-family: 'Inter', -apple-system, sans-serif; text-align: center;">
    
    <div style="max-width: 800px; width: 100%;">
        
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.4em; color: rgba(255, 255, 255, 0.35); text-transform: uppercase; margin-bottom: 24px;">
            #1 Classified Marketplace
        </div>
        
        <h1 style="font-size: clamp(44px, 10vw, 76px); font-weight: 900; color: #ffffff; letter-spacing: -0.05em; line-height: 1.2; margin: 0 0 28px 0;">
            Looking to <span style="color: #ffffff; text-shadow: 0 0 20px rgba(255,255,255,0.2);">Buy</span> 
            <span style="color: rgba(255, 255, 255, 0.2); font-weight: 300; font-style: italic; margin: 0 10px; letter-spacing: 0;">or</span> 
            <span style="color: #ffffff; text-shadow: 0 0 20px rgba(255,255,255,0.2);">Sell</span>?
        </h1>
        
        <p style="font-size: clamp(17px, 4vw, 21px); color: rgba(255, 255, 255, 0.55); line-height: 1.6; font-weight: 400; letter-spacing: -0.01em; max-width: 580px; margin: 0 auto 35px auto;">
            Connect with people in your area and find 
            <span style="color: #ffffff; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 2px;">amazing deals!</span>
        </p>
        
        <div style="height: 1px; width: 50px; background: rgba(255, 255, 255, 0.2); margin: 0 auto; border-radius: 2px;"></div>
        
    </div>
</section>
 <div>
    <a href="post-ad.php" class="btn-post">Post Free Ad</a>
    <a href="browse.php" class="btn-outline"> Browse Categories </a>
  </div>




  

  <!-- ✅ Search Form -->
  <div class="search-box">
    <div class="search-wrapper">
      <form id="searchForm" action="" method="get">
        <i id="searchIcon" class="fas fa-search search-icon"></i>
        <input type="text" id="searchInput" name="q" class="search-input" placeholder="Search classifieds...">
        <button type="button" id="voiceBtn" class="voice-btn"><i class="fas fa-microphone"></i></button>
      </form>
    </div>
  </div>

  <!-- ✅ Popup for "No Ads Found" -->
  <div class="popup" id="noResultPopup">
    <div class="popup-content">
      <h2>😔 No Ads Found</h2>
      <p>Sorry, we couldn’t find any results for your search.</p>
    </div>
  </div>

  <!-- ✅ Popup for Listening -->
  <div class="popup" id="listenPopup">
    <div class="popup-content">
      <h2>🎤 Listening...</h2>
      <div class="listening"></div>
    </div>
  </div>

<script>
    const voiceBtn = document.getElementById("voiceBtn");
    const searchInput = document.getElementById("searchInput");
    const form = document.getElementById("searchForm");
    const listenPopup = document.getElementById("listenPopup");
    const searchIcon = document.getElementById("searchIcon");

    // ✅ Search icon click submit
    searchIcon.addEventListener("click", ()=>{
      if(searchInput.value.trim() !== ""){
        form.submit();
      }
    });

    if('webkitSpeechRecognition' in window){
      const recognition = new webkitSpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;

      voiceBtn.addEventListener("click", ()=>{
        listenPopup.style.display="flex";
        recognition.start();
      });

      recognition.onresult = function(event){
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        listenPopup.style.display="none";
        form.submit(); 
      };

      recognition.onend = ()=>{ listenPopup.style.display="none"; };
    } else { voiceBtn.style.display = "none"; }



    // Add class for search focus animation
searchInput.addEventListener("focus", ()=>{
  searchInput.style.transform="scale(1.02)";
});
searchInput.addEventListener("blur", ()=>{
  searchInput.style.transform="scale(1)";
});

// Chat messages animation on send
function sendMessage() {
  let msg = chatInput.value.trim();
  if(msg!==""){
    let p = document.createElement("p");
    p.className = "text-sm bg-green-100 text-gray-800 px-3 py-2 rounded-lg mb-2 ml-auto max-w-[75%]";
    p.style.opacity = 0;
    p.textContent = msg;
    chatMessages.appendChild(p);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Animate
    setTimeout(()=>{ p.style.opacity = 1; p.style.transform="translateY(0)"; }, 50);

    chatInput.value = "";

    // Fake reply animation
    setTimeout(()=>{
      let reply = document.createElement("p");
      reply.className = "text-sm bg-gray-200 text-gray-800 px-3 py-2 rounded-lg mb-2 mr-auto max-w-[75%]";
      reply.style.opacity = 0;
      reply.textContent = "Thanks for your message!";
      chatMessages.appendChild(reply);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      setTimeout(()=>{ reply.style.opacity=1; reply.style.transform="translateY(0)"; }, 50);
    }, 800);
  }
}

 </script>

  <script>
  // ✅ Share button function (with fallback)
  function shareAd(id, title){
    const url = "view-ads.php?id=" + id;
    if (navigator.share) {
      navigator.share({
        title: title,
        text: "Check out this ad: " + title,
        url: url
      }).catch(err => console.log("Share cancelled:", err));
    } else {
      // Fallback → Copy link to clipboard
      navigator.clipboard.writeText(window.location.origin + "/" + url).then(() => {
        alert("Ad link copied to clipboard ✅");
      });
    }
  }
</script>

  <!-- ✅ PHP Search Results -->
<div class="results">
<?php
if(isset($_GET['q'])){
    $q = $_GET['q'];
    include "db.php";

    $stmt = $conn->prepare("SELECT * FROM ads WHERE title LIKE ? OR description LIKE ?");
    $search = "%".$q."%";
    $stmt->bind_param("ss", $search, $search);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows > 0){
        while($row = $result->fetch_assoc()){
            $adId = $row['id'];

            // ✅ Image Path Fix
            $imagePath = "uploads/default.jpg";
            if(!empty($row['image'])) {
                $checkPath = "uploads/" . $row['image'];
                if(file_exists($checkPath)) {
                    $imagePath = $checkPath;
                }
            }

            echo "<a href='profile.php?id=$adId' class='ad-box'>";
            echo "<img src='".$imagePath."' class='ad-img' alt='Profile'>";
            echo "<div class='ad-content'>";
            echo "<h3>".$row['title']."</h3>";
            echo "<p>".$row['description']."</p>";
            echo "</div></a>";
        }
    } else {
        // ✅ Unique Popup for "No Results Found"
        echo "
        <div id='noResultPopup' class='no-result'>
            <div class='popup-content'>
                <i class='fas fa-search-minus'></i>
                <h2>No Results Found</h2>
                <p>Sorry, we couldn’t find anything for <b>".htmlspecialchars($q)."</b></p>
                <a href='index.php' class='retry-btn'>🔄 Search Again</a>
            </div>
        </div>

        <style>
            .no-result {
                display:flex;
                justify-content:center;
                align-items:center;
                height:300px;
                margin-top:20px;
            }
            .popup-content {
                background: rgba(255,255,255,0.08);
                backdrop-filter: blur(12px);
                padding: 35px;
                border-radius: 18px;
                text-align: center;
                color: #fff;
                box-shadow: 0 8px 30px rgba(0,0,0,0.3);
                animation: fadeIn 0.6s ease-in-out;
            }
            .popup-content i {
                font-size: 42px;
                margin-bottom: 15px;
                color: #ff4d4d;
                animation: pulse 1.5s infinite;
            }
            .popup-content h2 {
                margin: 0;
                font-size: 24px;
                color: #f87171;
            }
            .popup-content p {
                margin-top: 8px;
                font-size: 16px;
                color: #f3f4f6;
            }
            .retry-btn {
                display:inline-block;
                margin-top:15px;
                padding:10px 20px;
                background:#2563eb;
                color:#fff;
                text-decoration:none;
                border-radius:50px;
                transition:0.3s;
            }
            .retry-btn:hover {
                background:#1e40af;
                transform:scale(1.05);
            }
            @keyframes fadeIn {
                from {opacity:0; transform:scale(0.9);}
                to {opacity:1; transform:scale(1);}
            }
            @keyframes pulse {
                0% { transform: scale(1); opacity:1; }
                50% { transform: scale(1.2); opacity:0.7; }
                100% { transform: scale(1); opacity:1; }
            }
        </style>
        ";
    }
}
?>
</div>


   
</section>


<!-- --- CATEGORIES --- -->
<section class="py-16 bg-white text-center">
<div style="text-align: center; max-width: 900px; margin: 20px auto 40px auto; padding: 0 20px; font-family: 'Poppins', sans-serif;">
    
    <h2 style="font-size: clamp(32px, 8vw, 52px); font-weight: 800; color: #111827; letter-spacing: -0.05em; line-height: 1.1; margin: 0;">
        Browse by <span style="color: #2563eb;">Category</span>
    </h2>

    <p style="font-size: clamp(14px, 4vw, 16px); color: #6b7280; font-weight: 400; margin-top: 12px; letter-spacing: -0.01em;">
        Find everything you need in one place
    </p>

    <div style="height: 1px; width: 40px; background: #e5e7eb; margin: 25px auto 0 auto;"></div>

</div>


  
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 px-4 max-w-7xl mx-auto">

    <?php
    // Categories array (Database text, Slug)
    $categories = [
        ["Jobs","fa-user-tie","Jobs"],
        ["Real Estate","fa-home","Real Estate"],
        ["Vehicles","fa-car","Vehicles"],
        ["Services","fa-tools","Services"],
        ["Electronics","fa-mobile-alt","Electronics"],
        ["Community","fa-users","Community"]
    ];

    foreach($categories as $c){
        // URL encode slug to avoid issues
        $catUrl = urlencode($c[2]);
        // Active class
        $activeClass = (isset($_GET['cat']) && $_GET['cat'] == $c[2]) ? "border-4 border-blue-600" : "";
        echo '<a href="index.php?cat='.$catUrl.'" class="card bg-gray-100 p-6 rounded-2xl flex flex-col items-center hover:shadow-lg transition-all '.$activeClass.'">';
        echo '<div class="text-4xl text-blue-600 mb-2"><i class="fas '.$c[1].'"></i></div>';
        echo '<h3 class="font-semibold">'.$c[0].'</h3>';
        echo '</a>';
    }
    ?>
  </div>
</section>



<!-- Optional CSS for smooth hover effect -->
<style>
.card {
    transition: all 0.3s ease;
    text-decoration: none; /* remove underline */
    color: inherit; /* keep text color */
}
.card:hover {
    transform: translateY(-6px) scale(1.05);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}
</style>


<!-- --- LATEST ADS --- -->
<section class="py-16 bg-gradient-to-br from-gray-50 to-gray-100 px-4 relative">
  <div style="text-align: center; max-width: 900px; margin: 20px auto 40px auto; padding: 0 20px; font-family: 'Poppins', sans-serif;">
    
    <h2 style="font-size: clamp(32px, 8vw, 52px); font-weight: 800; color: #111827; letter-spacing: -0.05em; line-height: 1.1; margin: 0 0 16px 0;">
        Discover Latest <span style="color: #2563eb; position: relative; display: inline-block;">
            Ads
            <span style="position: absolute; bottom: 8px; left: 0; width: 100%; height: 8px; background: rgba(37, 99, 235, 0.1); z-index: -1;"></span>
        </span>
    </h2>

    <p style="font-size: 16px; color: #6b7280; font-weight: 400; letter-spacing: -0.01em; max-width: 500px; margin: 0 auto;">
        Check out the most <span style="color: #111827; font-weight: 600;">recent listings</span> and trending deals in your area.
    </p>

    <div style="height: 1px; width: 50px; background: #e5e7eb; margin: 30px auto 0 auto;"></div>

</div>

  <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">


    <?php
    if($ads->num_rows > 0){
      while($row = $ads->fetch_assoc()){
        $image = !empty($row['image']) ? 'uploads/'.htmlspecialchars($row['image']) : 'assets/no-image.jpg';

        echo '<div class="card bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.01] border border-gray-200 relative">';

        // --- Image Section ---
        echo '<div class="overflow-hidden rounded-t-2xl relative h-44">';
        echo '<img src="'.$image.'" alt="'.htmlspecialchars($row['title']).'" class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700 ease-out">';
        echo '<span class="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs px-3 py-1 rounded-full shadow-md animate-pulse">New</span>';
        echo '</div>';

        // --- Content Box (Title + Description compact) ---
        echo '<div class="p-6 flex flex-col h-56">';
        echo '<h3 class="font-bold text-base text-gray-900 leading-snug mb-2">'.htmlspecialchars(mb_strimwidth($row['title'],0,55,"...")).'</h3>';
        echo '<p class="text-gray-600 text-sm flex-grow leading-relaxed">'.htmlspecialchars(mb_strimwidth($row['description'],0,95,"...")).'</p>';

        // --- Location + Website (inline info bar) ---
        echo '<div class="mt-3 text-xs text-gray-500 flex flex-wrap gap-3">';
        echo '<span class="flex items-center gap-1"><i class="fas fa-map-marker-alt text-blue-600"></i>'.htmlspecialchars(mb_strimwidth($row['location'],0,25,"...")).'</span>';
        if(!empty($row['website'])){
          echo '<a href="'.htmlspecialchars($row['website']).'" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1"><i class="fas fa-globe"></i> Website</a>';
        }
        echo '</div>';

  // ✅ Button
echo '<div class="flex justify-center mt-5">';
echo '<a href="/ad/'.htmlspecialchars($row['slug']).'" aria-label="View details for '.htmlspecialchars($row['title']).'" class="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-2 rounded-xl hover:from-blue-800 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-xl inline-flex items-center gap-2">';
echo '<i class="fas fa-info-circle"></i> View Details';
echo '</a>';
echo '</div>';

echo '</div>';

        // --- Floating Buttons ---
        echo '<div class="absolute bottom-4 left-4 flex gap-3">';
        echo '<button onclick="shareAd('.$row['id'].', \''.htmlspecialchars($row['title']).'\')" class="bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-full shadow-md transition transform hover:scale-110">';
        echo '<i class="fas fa-share-alt text-lg"></i>';
        echo '</button>';
        echo '</div>';

        echo '<button onclick="openChat('.$row['id'].', \''.htmlspecialchars($row['title']).'\')" aria-label="Chat about '.htmlspecialchars($row['title']).'" class="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition transform hover:scale-110 flex items-center justify-center">';
        echo '<i class="fas fa-comment-dots text-lg"></i>';
        echo '</button>';

        echo '</div>';
      }
    } else {
      echo '<p class="col-span-4 text-center text-gray-600 font-medium">No ads found.</p>';
    }
    ?>
  </div>
</section>

<!-- ✅ Chat Popup Box -->
<div id="chatPopupBox" class="hidden fixed bottom-80 right-6 bg-white rounded-2xl shadow-2xl w-96 max-w-[90%] border border-gray-200 z-50 overflow-hidden animate-slideUp">
  <!-- Header -->
  <div class="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 font-bold flex justify-between items-center shadow-md">
    <span id="chatAdTitle" class="flex items-center gap-2">
      <i class="fas fa-comments text-xl"></i> Live Chat
    </span>
    <button onclick="toggleChatBox()" aria-label="Close chat" class="text-white hover:text-gray-200 transition transform hover:rotate-90">✖</button>
  </div>

  <!-- Messages -->
  <div class="p-4 h-72 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100" id="chatMessages">
    <p class="text-gray-500 text-sm text-center">Start conversation...</p>
  </div>

  <!-- Input -->
  <div class="flex border-t bg-white shadow-inner">
    <input type="text" id="chatInput" placeholder="Type a message..."
      class="flex-grow px-3 py-2 text-sm outline-none bg-transparent placeholder-gray-400">
    <button onclick="sendMessage()" aria-label="Send message"
      class="bg-green-500 hover:bg-green-600 text-white px-5 flex items-center justify-center transition">
      <i class="fas fa-paper-plane"></i>
    </button>
  </div>
</div>

<!--fiell with about section-->




<style>
    /* Desktop default behavior */
    .story-container {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 80px;
        max-width: 1200px;
        margin: 0 auto;
    }

    /* Mobile (768px and below) */
    @media (max-width: 768px) {
        #story-section {
            padding: 40px 20px !important;
        }
        
        .story-container {
            flex-direction: column !important;
            gap: 40px !important;
            text-align: center !important; /* Center text on mobile */
        }

        .story-reveal.left {
            width: 100% !important;
            order: 2; /* Image niche chali jayegi text ke (optional) */
        }

        .story-content {
            width: 100% !important;
            order: 1; /* Text upar dikhega mobile par */
        }

        .check-item {
            justify-content: center !important; /* Checkmarks center align */
        }

        .stats-badge {
            right: 20px !important;
            bottom: 20px !important;
        }

        h2 {
            line-height: 1.2 !important;
        }
    }
</style>

<section id="story-section" style="padding: 80px 10px; background: #ffffff; font-family: 'Poppins', sans-serif; overflow: hidden;">
    <div class="story-container">
        
        <div class="story-reveal left" style="flex: 1; min-width: 320px; position: relative;">
            <div style="width: 100%; height: 400px; background: #f1f5f9; border-radius: 60px 20px 60px 20px; overflow: hidden; position: relative; box-shadow: 0 40px 80px rgba(0,0,0,0.1);">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Our Team" style="width: 100%; height: 100%; object-fit: cover;">
                
                <div class="stats-badge" style="position: absolute; bottom: 40px; right: -20px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); padding: 25px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.3);">
                    <div style="color: #2563eb; font-weight: 900; font-size: 28px; line-height: 1;">50k+</div>
                    <div style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;">Active Deals</div>
                </div>
            </div>
        </div>

        <div class="story-content" style="flex: 1.2; min-width: 320px;">
            <div class="story-reveal right">
                <span style="color: #2563eb; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 4px; display: block; margin-bottom: 20px;">The Journey</span>
                
                <h2 style="font-size: clamp(34px, 5vw, 54px); font-weight: 900; color: #0f172a; letter-spacing: 0px; line-height: 1.1; margin-bottom: 30px;">
                    Crafting a Better <br> <span style="color: #2563eb;">Marketplace.</span>
                </h2>

                <p style="color: #475569; font-size: 18px; line-height: 1.8; margin-bottom: 25px;">
                    It all started with a simple observation: <strong>Buying and selling locally should be as easy as sending a text.</strong>
                </p>

                <p style="color: #475569; font-size: 18px; line-height: 1.8; margin-bottom: 35px;">
                    Our mission was to strip away the noise. We built a platform where <strong>Simplicity meets Security.</strong>
                </p>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 45px;">
                    <div class="check-item" style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 32px; height: 32px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <span style="font-weight: 700; color: #1e293b; font-size: 15px;">Zero Hidden Fees</span>
                    </div>
                    <div class="check-item" style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 32px; height: 32px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <span style="font-weight: 700; color: #1e293b; font-size: 15px;">Smart Verification</span>
                    </div>
                </div>

                <div class="story-reveal right">
                    <a href="#" style="text-decoration: none; padding: 18px 40px; background: #0f172a; color: white; border-radius: 20px; font-weight: 700; font-size: 16px; transition: all 0.4s ease; display: inline-block; box-shadow: 0 15px 30px rgba(15, 23, 42, 0.2);" 
                       onmouseover="this.style.background='#2563eb'; this.style.transform='translateY(-5px)';" 
                       onmouseout="this.style.background='#0f172a'; this.style.transform='translateY(0)';" >
                        Get Started Now
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>

<style>
    /* Custom Scroll Animation CSS */
    .story-reveal {
        opacity: 0;
        transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Slides from left */
    .story-reveal.left {
        transform: translateX(-100px);
    }

    /* Slides from right */
    .story-reveal.right {
        transform: translateX(100px);
    }

    /* Trigger State */
    .story-reveal.active {
        opacity: 1 !important;
        transform: translateX(0) !important;
    }


   
      
    
</style>

<script>
    // Intersection Observer for the Story Section
    const storyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.2 });

    // Target all reveal elements
    document.querySelectorAll('.story-reveal').forEach(el => {
        storyObserver.observe(el);
    });
</script>
<style>
    /* Desktop & General Styles */
    .about-box {
        opacity: 1 !important; /* Force visibility agar JS nahi hai */
        transform: translateY(0) !important;
        transition: all 0.4s ease;
    }

    .about-box:hover {
        transform: translateY(-10px) !important;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    /* Mobile (768px and below) */
    @media (max-width: 768px) {
        #premium-about {
            padding: 40px 15px !important;
        }

        .reveal-up {
            margin-bottom: 40px !important;
        }

        /* Grid ko 1 column mein convert karna */
        .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
        }

        .about-box {
            padding: 40px 25px !important;
            text-align: center !important; /* Mobile par text center */
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
        }
        
        h2 {
            font-size: 32px !important; /* Mobile friendly heading size */
        }
    }
</style>

<section id="premium-about" style="padding: 80px 20px; background: #ffffff; font-family: 'Poppins', sans-serif; overflow: hidden;">
    
    <div class="reveal-up" style="text-align: center; max-width: 800px; margin: 0 auto 60px auto;">
        <span style="color: #2563eb; font-weight: 800; font-size: 13px; text-transform: uppercase; display: block; margin-bottom: 15px; letter-spacing: 2px;">Why Choose Us</span>
        <h2 style="font-size: clamp(28px, 7vw, 52px); font-weight: 900; color: #0f172a; letter-spacing: -1px; line-height: 1.2;">
            We're building the most <br> <span style="color: #2563eb;">Trusted</span> Marketplace
        </h2>
    </div>

    <div class="stats-grid" style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
        
        <div class="about-box" style="background: #ffffff; padding: 50px 40px; border-radius: 40px; border: 1px solid #f1f5f9;">
            <div style="width: 60px; height: 60px; background: #eff6ff; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 25px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div style="font-size: 48px; font-weight: 900; color: #0f172a; letter-spacing: -2px;"><span class="count-me" data-target="15000">15000</span>+</div>
            <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 10px 0;">Verified Ads</h3>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6;">Every listing is verified to ensure a safe trading experience for you.</p>
        </div>

        <div class="about-box" style="background: #0f172a; padding: 50px 40px; border-radius: 40px;">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 25px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 12l-4 4-4-4M12 8v7"/></svg>
            </div>
            <div style="font-size: 48px; font-weight: 900; color: #2563eb; letter-spacing: -2px;"><span class="count-me" data-target="99">99</span>%</div>
            <h3 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 10px 0;">Success Rate</h3>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">The trust of our users is our biggest achievement.</p>
        </div>

        <div class="about-box" style="background: #ffffff; padding: 50px 40px; border-radius: 40px; border: 1px solid #f1f5f9;">
            <div style="width: 60px; height: 60px; background: #eff6ff; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 25px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div style="font-size: 48px; font-weight: 900; color: #0f172a; letter-spacing: -2px;"><span class="count-me" data-target="500">500</span>k</div>
            <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 10px 0;">Happy Clients</h3>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6;">Every day, thousands of users place their trust in our platform.</p>
        </div>

    </div>
</section>

<style>
    /* Hover Effects */
    .about-box:hover {
        transform: translateY(-15px) scale(1.02) !important;
        box-shadow: 0 40px 80px rgba(0,0,0,0.08);
        border-color: #2563eb !important;
    }
    /* Class for JS Animation */
    .about-box.active {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
</style>

<script>
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Staggered delay (ek ke baad ek box aayega)
                setTimeout(() => {
                    entry.target.classList.add('active');
                    // Start counter in this box
                    const counter = entry.target.querySelector('.count-me');
                    if(counter) runCounter(counter);
                }, index * 200); 
                aboutObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.about-box').forEach(box => {
        aboutObserver.observe(box);
    });

    function runCounter(el) {
        const target = +el.getAttribute('data-target');
        let current = 0;
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); 

        const update = () => {
            current += step;
            if (current < target) {
                el.innerText = Math.ceil(current);
                requestAnimationFrame(update);
            } else {
                el.innerText = target;
            }
        };
        update();
    }
</script>

<section style="padding: 10px 20px; background: #ffffff; font-family: 'Poppins', sans-serif;">
    <div style="max-width: 1200px; margin: 0 auto;">
        
        <div style="text-align: center; margin-bottom: 60px;">
            <h2 style="font-size: clamp(32px, 5vw, 48px); font-weight: 900; color: #0f172a; ">How It <span style="color: #2563eb;">Works For You</span></h2>
            <p style="color: #64748b; margin-top: 10px;">Your journey from struggle to success, with us.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; align-items: stretch;">
            
            <div style="display: flex; flex-direction: column; gap: 30px;">
                <div class="step-card" style="background: #f8fafc; padding: 40px; border-radius: 30px; border: 1px solid #f1f5f9; flex: 1;">
                    <span style="font-size: 12px; font-weight: 800; color: #2563eb; background: #eff6ff; padding: 5px 12px; border-radius: 50px;">STEP 01</span>
                    <h3 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 15px 0 10px;">Searching for Deals?</h3>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Tired of fake ads and fraud? We bring you verified local listings, just for you.</p>
                </div>
                <div class="step-card" style="background: #f8fafc; padding: 40px; border-radius: 30px; border: 1px solid #f1f5f9; flex: 1;">
                    <span style="font-size: 12px; font-weight: 800; color: #2563eb; background: #eff6ff; padding: 5px 12px; border-radius: 50px;">STEP 02</span>
                    <h3 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 15px 0 10px;">Direct Chat</h3>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">No third parties involved—chat directly with the seller and close your deal in minutes.</p>
                </div>
            </div>

            <div style="min-width: 320px; display: flex; align-items: center; justify-content: center; position: relative;">
                <div style="width: 100%; height: 100%; min-height: 400px; background: #0f172a; border-radius: 40px; overflow: hidden; position: relative; box-shadow: 0 30px 60px rgba(37, 99, 235, 0.2);">
                    <video autoplay muted loop style="width: 100%; height: 100%; object-fit: cover; opacity: 0.7;">
                        <source src="your-video-file.mp4" type="video/mp4">
                    </video>
                    <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; color: white;">
                        <div style="width: 70px; height: 70px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; cursor: pointer;">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                        <h4 style="font-weight: 800; font-size: 20px;">Watch How It Works</h4>
                    </div>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 30px;">
                <div class="step-card" style="background: #f8fafc; padding: 40px; border-radius: 30px; border: 1px solid #f1f5f9; flex: 1;">
                    <span style="font-size: 12px; font-weight: 800; color: #2563eb; background: #eff6ff; padding: 5px 12px; border-radius: 50px;">STEP 03</span>
                    <h3 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 15px 0 10px;">Safe Payments</h3>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Our system guides you through safe transactions to ensure your money is always protected.</p>
                </div>
                <div class="step-card" style="background: #2563eb; padding: 40px; border-radius: 30px; flex: 1; color: #ffffff;">
                    <span style="font-size: 12px; font-weight: 800; color: #ffffff; background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 50px;">STEP 04</span>
                    <h3 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 15px 0 10px;">Grow Together</h3>
                    <p style="color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6;">More than just trading, we are building a community. Join us today and buy or sell with ease.</p>
                </div>
            </div>

        </div>
    </div>
</section>

<style>
    .step-card { transition: all 0.4s ease; }
    .step-card:hover { 
        transform: translateY(-10px); 
        box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        border-color: #2563eb;
    }
</style> -->


<style>
    /* Trigger for active state */
    .faq-tag.open { border-color: #2563eb; background: #ffffff; box-shadow: 0 15px 30px rgba(0,0,0,0.05); }
    .faq-tag.open .plus-icon { transform: rotate(45deg); color: #0f172a; }
    .faq-tag.visible { opacity: 1 !important; transform: translateY(0) !important; }
</style>

<script>
    // 1. Toggle Functionality (Fixed)
    document.querySelectorAll('.faq-head').forEach(header => {
        header.addEventListener('click', () => {
            const parent = header.parentElement;
            const body = header.nextElementSibling;
            
            // Close others
            document.querySelectorAll('.faq-tag').forEach(item => {
                if(item !== parent) {
                    item.classList.remove('open');
                    item.querySelector('.faq-body').style.height = "0";
                }
            });

            // Toggle current
            parent.classList.toggle('open');
            if(parent.classList.contains('open')) {
                body.style.height = body.scrollHeight + "px";
            } else {
                body.style.height = "0";
            }
        });
    });

    // 2. Scroll Animation (Smooth Reveal)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 150);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.faq-tag, .faq-reveal').forEach(el => observer.observe(el));
</script>


<!-- 🌐 Floating WhatsApp Button (Global) -->
<a href="https://wa.me/917001711745?text=Hi, I’m interested in your ads" 
   target="_blank" aria-label="Chat on WhatsApp"
   id="chatButton" 
   class="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl cursor-pointer animate-bounce z-50">
  <i class="fab fa-whatsapp text-2xl"></i>
</a>

<script>
  const chatPopupBox = document.getElementById("chatPopupBox");
  const chatMessages = document.getElementById("chatMessages");
  const chatAdTitle = document.getElementById("chatAdTitle");
  const chatInput = document.getElementById("chatInput");

  function openChat(adId, title) {
    chatAdTitle.innerHTML = '<i class="fas fa-comments text-xl"></i> ' + title;
    chatPopupBox.classList.remove("hidden");
    chatPopupBox.classList.add("animate-slideUp");
    document.body.classList.add("blurred");
  }

  function toggleChatBox() {
    chatPopupBox.classList.add("hidden");
    document.body.classList.remove("blurred");
  }

  function sendMessage() {
    let msg = chatInput.value.trim();
    if(msg !== "") {
      // User message
      let p = document.createElement("p");
      p.className = "text-sm bg-green-100 text-gray-800 px-3 py-2 rounded-lg mb-2 ml-auto max-w-[75%]";
      p.textContent = msg;
      chatMessages.appendChild(p);

      chatInput.value = "";
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Fake reply (demo)
      setTimeout(() => {
        let reply = document.createElement("p");
        reply.className = "text-sm bg-gray-200 text-gray-800 px-3 py-2 rounded-lg mb-2 mr-auto max-w-[75%]";
        reply.textContent = "Thanks for your message!";
        chatMessages.appendChild(reply);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 800);
    }
  }
</script>

<style>
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .animate-slideUp { animation: slideUp 0.4s ease-out; }

  .blurred::before {
    content: "";
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    backdrop-filter: blur(6px);
    background: rgba(0,0,0,0.25);
    z-index: 40;
  }
  /* Container grid responsive tweaks */
.container {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(1, 1fr);
}

@media(min-width: 640px) {
  .container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media(min-width: 1024px) {
  .container {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Card image responsive height */
.card img {
  width: 100%;
  height: auto; /* automatic height for better scaling */
  max-height: 220px;
  object-fit: cover;
  transition: transform 0.7s ease-out;
}

/* Card padding & spacing on small screens */
.card .p-6 {
  padding: 1rem;
}

@media(max-width: 640px) {
  .card .p-6 {
    padding: 0.75rem;
  }
  .card h3 {
    font-size: 1.1rem;
  }
  .card p {
    font-size: 0.875rem;
  }
  .card a {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  .card button {
    padding: 0.5rem;
    bottom: 0.5rem;
    right: 0.5rem;
  }
  .card img {
    max-height: 180px;
  }
}

/* Chat popup & WhatsApp button scaling */
#chatPopupBox {
  width: 90%;
  max-width: 20rem; /* smaller width for mobile */
  bottom: 9rem;
}

#chatButton {
  bottom: 4rem;
  right: 1rem;
  padding: 0.75rem;
}

</style>
   



<!-- --- FOOTER --- -->

 <?php include_once "footer.php"; ?>








<script>


<?php $conn->close(); ?>
</body>
</html>