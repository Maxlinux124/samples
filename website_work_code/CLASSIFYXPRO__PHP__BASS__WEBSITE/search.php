<?php
include_once "db.php";
$conn = getDBConnection();

// Input parameters (safe)
$keyword  = isset($_GET['q']) ? trim($conn->real_escape_string($_GET['q'])) : '';
$city     = isset($_GET['city']) ? trim($conn->real_escape_string($_GET['city'])) : '';

// Base query
$sql = "SELECT ads.*, users.username 
        FROM ads
        LEFT JOIN users ON ads.user_id = users.id
        WHERE 1=1";

if (!empty($keyword)) {
    $sql .= " AND (ads.title LIKE '%$keyword%' OR ads.description LIKE '%$keyword%')";
}
if (!empty($city)) {
    $sql .= " AND ads.city LIKE '%$city%'";
}

$sql .= " ORDER BY ads.created_at DESC LIMIT 30";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Search Ads - ClassifyX</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
body { font-family: 'Segoe UI', sans-serif; margin:0; background:#f3f4f6; }

header { position: sticky; top: 0; z-index: 50; background: #fff; padding: 16px; 
         box-shadow: 0 4px 8px rgba(0,0,0,0.08); transition: all 0.3s ease; }
header.scrolled { background:#2563eb; color:#fff; }

.search-bar { display: flex; gap: 10px; max-width: 950px; margin: auto; }
.search-bar input {
  padding: 12px 14px; border: 1px solid #ddd; border-radius: 10px; 
  font-size: 15px; flex:1; transition: all 0.3s;
}
.search-bar input:focus {
  outline:none; border-color:#2563eb; box-shadow: 0 0 8px rgba(37,99,235,0.3);
}
.search-bar button { 
  padding: 12px 20px; border:none; border-radius: 10px; 
  background: linear-gradient(135deg,#2563eb,#1d4ed8); color: #fff; 
  font-weight:bold; cursor:pointer; transition: all 0.3s ease;
}
.search-bar button:hover { transform: scale(1.08); box-shadow: 0 6px 12px rgba(0,0,0,0.2); }

.container { max-width: 1150px; margin: 30px auto; padding: 0 20px; }
.container h2 { font-size:24px; font-weight:bold; margin-bottom:20px; color:#111827; }

.results { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 20px; }
.card { background:#fff; border-radius:14px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
        overflow:hidden; position:relative; transition: all 0.4s ease; cursor:pointer; }
.card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
.card img { width:100%; height:190px; object-fit:cover; transition: transform 0.4s ease; }
.card:hover img { transform: scale(1.1); }

.card-body { padding: 16px; }
.card-body h3 { margin:0; font-size: 18px; font-weight:bold; color:#111827; }
.card-body p { margin:6px 0; color:#6b7280; font-size:14px; line-height:1.4; }
.price { font-size:16px; font-weight:bold; color:#10b981; margin-top: 10px; }

.card { opacity:0; transform: translateY(20px); }
.card.show { opacity:1; transform: translateY(0); transition: all 0.6s ease; }

/* Button inside card */
.card-btn {
  display:inline-block;
  padding:10px 22px;
  background: linear-gradient(135deg,#2563eb,#1d4ed8);
  color:#fff;
  font-weight:bold;
  border-radius:12px;
  text-decoration:none;
  transition: all 0.3s ease;
}
.card-btn:hover { transform: scale(1.05); box-shadow:0 6px 12px rgba(0,0,0,0.2); }
.card-btn:active { transform: scale(0.95); }

@media(max-width:650px){
  .search-bar { flex-direction: column; }
  .search-bar input, .search-bar button { width:100%; }
}
</style>
</head>
<body>

<header id="header">
  <form class="search-bar" action="search.php" method="get" id="searchForm">
    <input type="text" name="q" placeholder="Search ads..." value="<?= htmlspecialchars($keyword) ?>" id="searchInput">
    <input type="text" name="city" placeholder="Enter city..." value="<?= htmlspecialchars($city) ?>">
    <button type="submit">🔍 Search</button>
    <button type="button" id="voiceBtn"><i class="fas fa-microphone"></i></button>
  </form>
</header>

<div class="container">
  <h2>🔎 Search Results</h2>
  <div class="results">
    <?php if ($result->num_rows > 0): ?>
      <?php while($ad = $result->fetch_assoc()): ?>
        <div class="card">
          <img src="uploads/<?= htmlspecialchars($ad['image'] ?? 'no-image.jpg') ?>" alt="Ad Image">
          <div class="card-body">
            <h3><?= htmlspecialchars($ad['title']) ?></h3>
            <p><?= htmlspecialchars(strlen($ad['description'])>80 ? substr($ad['description'],0,80).'...' : $ad['description']) ?></p>
            <p><strong>📍 City:</strong> <?= htmlspecialchars($ad['city'] ?? 'N/A') ?></p>
            <p class="price">₹<?= htmlspecialchars($ad['price'] ?? 'N/A') ?></p>
            <p>Posted by: <?= htmlspecialchars($ad['username']) ?></p>
            
            <!-- Centered View Details Button -->
            <div style="text-align:center; margin-top:12px;">
              <a href="view-ads.php?id=<?= $ad['id'] ?>" class="card-btn">View Details</a>
            </div>
          </div>
        </div>
      <?php endwhile; ?>
    <?php else: ?>
      <div style="text-align:center; margin-top:50px; color:#6b7280;">
        <h3>😔 No Ads Found</h3>
        <p>Sorry, no results for <b><?= htmlspecialchars($keyword) ?></b></p>
      </div>
    <?php endif; ?>
  </div>
</div>
<style>
    /* Footer main style */
footer {
    font-family: 'Segoe UI', sans-serif;
    background: linear-gradient(to right, #111827, #1e3a8a, #111827);
    color: #d1d5db;
    padding: 3rem 1rem;
    text-align: center;
}

/* Footer headings */
footer h2, footer h3 {
    color: #fff;
    margin-bottom: 0.75rem;
}

/* Footer paragraph text */
footer p {
    color: #9ca3af;
    font-size: 0.875rem;
    line-height: 1.6;
}

/* Footer links */
footer a {
    color: #d1d5db;
    text-decoration: none;
    transition: color 0.3s ease;
}
footer a:hover {
    color: #fff;
}

/* Footer grid layout */
footer .grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}
@media(min-width: 640px) {
    footer .grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
@media(min-width: 1024px) {
    footer .grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* Social icons container */
footer .flex.justify-center {
    justify-content: center; /* center icons horizontally */
    gap: 1rem;
    margin-top: 0.5rem;
}
footer .flex.justify-center a i {
    font-size: 1.5rem;
    transition: transform 0.3s ease, color 0.3s ease;
}
footer .flex.justify-center a:hover i {
    transform: scale(1.2);
    color: #2563eb;
}

/* Bottom bar */
footer .border-t {
    border-top: 1px solid #374151;
    margin-top: 2.5rem;
    padding-top: 1.5rem;
    font-size: 0.875rem;
    color: #9ca3af;
}
footer .border-t span {
    color: #fff;
    font-weight: 600;
}

</style>

<!-- --- FOOTER --- -->
 <?php include_once "footer.php"; ?>

<script>
document.querySelector(".search-bar").addEventListener("submit", function(){
  setTimeout(()=> { window.scrollTo({top: document.querySelector(".container").offsetTop - 60, behavior:"smooth"}); }, 150);
});

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card, i) => { setTimeout(()=> card.classList.add("show"), i * 120); });
});

window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  if(window.scrollY > 30){ header.classList.add("scrolled"); }
  else { header.classList.remove("scrolled"); }
});

// Voice search (optional)
if('webkitSpeechRecognition' in window){
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  const voiceBtn = document.getElementById("voiceBtn");
  const searchInput = document.getElementById("searchInput");
  const searchForm = document.getElementById("searchForm");

  voiceBtn.addEventListener("click", ()=> recognition.start());
  recognition.onresult = function(event){
    searchInput.value = event.results[0][0].transcript;
    searchForm.submit();
  };
}
</script>

</body>
</html>
