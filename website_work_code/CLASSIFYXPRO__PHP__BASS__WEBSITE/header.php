<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
include_once "db.php";
$conn = getDBConnection();

$userImage = "";
$username = "";

// Agar user login hai to profile image aur username fetch karo
if (isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT username, image FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $username = $row['username'];
        if (!empty($row['image']) && file_exists(__DIR__ . "/uploads/" . $row['image'])) {
            $userImage = "uploads/" . $row['image'];
        }
    }
    $stmt->close();
}

// ✅ Active page detect karne ke liye
$current_page = basename($_SERVER['PHP_SELF']);
?>

<!-- HEADER -->
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-B77MT3JDH8"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-B77MT3JDH8');
</script>

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8973475809909904"
     crossorigin="anonymous"></script>
     
<header class="bg-white shadow-md px-4 py-3 flex items-center justify-between sticky top-0 z-50">
  <div class="logo flex items-center">
    <a href="index.php">
      <img src="uploads/logo7.png" alt="Logo" class="w-16 h-auto object-contain rounded-md">
    </a>
  </div>

  <!-- Mobile Menu Button -->
  <button id="menu-btn" class="md:hidden text-3xl z-50">&#9776;</button>

  <!-- Desktop Nav -->
  <nav class="hidden md:flex items-center space-x-6 font-medium">
    <a href="index.php" class="<?= ($current_page=='index.php')?'text-blue-600 font-semibold':'hover:text-blue-600' ?> transition">Home</a>
    <a href="all-ads.php" class="<?= ($current_page=='all-ads.php')?'text-blue-600 font-semibold':'hover:text-blue-600' ?> transition">Browse Ads</a>
    <a href="post-ad.php" class="<?= ($current_page=='post-ad.php')?'text-blue-600 font-semibold':'hover:text-blue-600' ?> transition">Post Ad</a>
    <a href="allprofiles.php" class="<?= ($current_page=='allprofiles.php')?'text-blue-600 font-semibold':'hover:text-blue-600' ?> transition">All Profiles</a>
    <a href="blog.php" class="<?= ($current_page=='blog.php')?'text-blue-600 font-semibold':'hover:text-blue-600' ?> transition">Blog</a>
    <a href="contact.php" class="<?= ($current_page=='contact.php')?'text-blue-600 font-semibold':'hover:text-blue-600' ?> transition">Contact</a>

    <?php if (!isset($_SESSION['user_id'])): ?>
      <a href="login.php" class="signup bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition">Sign Up</a>
    <?php endif; ?>

    <!-- User Profile Dropdown -->
    <div class="relative group">
      <?php if (isset($_SESSION['user_id']) && !empty($userImage)): ?>
        <img src="<?php echo $userImage; ?>" alt="Profile" class="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-200 hover:border-blue-600 transition">
      <?php else: ?>
        <div class="w-10 h-10 flex items-center justify-center rounded-full cursor-pointer border-2 border-gray-200 hover:border-blue-600 transition bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      <?php endif; ?>

      <?php if (isset($_SESSION['user_id'])): ?>
        <div class="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100 invisible group-hover:visible">
          <a href="profile.php?user=<?php echo urlencode($username); ?>" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-t-xl">Profile</a>
          <a href="logout.php" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-b-xl">Logout</a>
        </div>
      <?php endif; ?>
    </div>
  </nav>
</header>

<!-- Mobile Fullscreen Menu Overlay -->
<div id="mobile-menu" class="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center space-y-6 text-2xl -translate-y-full transition-transform duration-300 ease-in-out md:hidden">
  <a href="index.php" class="hover:text-blue-600 transition">Home</a>
  <a href="all-ads.php" class="hover:text-blue-600 transition">Browse Ads</a>
  <a href="post-ad.php" class="hover:text-blue-600 transition">Post Ad</a>
  <a href="allprofiles.php" class="hover:text-blue-600 transition">All Profiles</a>
  <a href="blog.php" class="hover:text-blue-600 transition">Blog</a>
  <a href="contact.php" class="hover:text-blue-600 transition">Contact</a>

  <?php if (!isset($_SESSION['user_id'])): ?>
    <a href="login.php" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Sign Up</a>
  <?php endif; ?>

  <?php if (isset($_SESSION['user_id'])): ?>
    <a href="profile.php?user=<?php echo urlencode($username); ?>" class="hover:text-blue-600 transition">Profile</a>
    <a href="logout.php" class="hover:text-blue-600 transition">Logout</a>
  <?php endif; ?>
</div>

<script>
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('-translate-y-full');
});
</script>
