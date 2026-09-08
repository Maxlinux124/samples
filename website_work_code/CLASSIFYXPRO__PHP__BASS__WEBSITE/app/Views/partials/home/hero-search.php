<!-- --- HERO SECTION --- -->
<section class="hero-bg">

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





  <?php include __DIR__ . '/search-results.php'; ?>
</section>


