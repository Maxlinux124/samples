<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ClassifyX Pro | Premium Marketplace 2025</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary: #0052cc;
            --primary-light: #e6efff;
            --dark: #091e42;
            --text-main: #172b4d;
            --text-sub: #6b778c;
            --bg-body: #f7f9fc;
            --white: #ffffff;
            --card-border: #edf2f7;
            --shadow: 0 10px 30px rgba(0,0,0,0.04);
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dark-mode {
            --bg-body: #0b1120;
            --white: #1e293b;
            --text-main: #f1f5f9;
            --text-sub: #94a3b8;
            --card-border: #334155;
            --shadow: 0 10px 30px rgba(0,0,0,0.25);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
        body { background: var(--bg-body); color: var(--text-main); transition: background 0.4s ease; overflow-x: hidden; line-height: 1.5; }

        /* ===== NAVBAR ===== */
        .navbar {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            padding: 12px 5%;
            display: flex; justify-content: space-between; align-items: center;
            box-shadow: 0 2px 15px rgba(0,0,0,0.03);
            position: sticky; top: 0; z-index: 1000;
            border-bottom: 1px solid var(--card-border);
        }
        .dark-mode .navbar { background: rgba(30, 41, 59, 0.8); border-bottom: 1px solid #334155; }

        .logo { font-size: 22px; font-weight: 800; color: var(--primary); text-decoration: none; display: flex; align-items: center; gap: 8px; }
        .logo span { color: var(--text-main); }

        .search-container {
            flex: 0 1 500px; background: #f1f2f4; border-radius: 14px;
            display: flex; align-items: center; padding: 10px 18px; border: 1.5px solid transparent; transition: var(--transition);
        }
        .dark-mode .search-container { background: #0f172a; }
        .search-container:focus-within { background: var(--white); border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); }
        .search-container input { border: none; background: transparent; width: 100%; outline: none; color: inherit; margin-left: 10px; font-size: 14px; }

        .nav-actions { display: flex; align-items: center; gap: 15px; }

        /* ===== MAIN LAYOUT ===== */
        .main-wrapper {
            max-width: 1400px; margin: 25px auto;
            display: grid; grid-template-columns: 280px 1fr; gap: 30px; padding: 0 20px;
        }

        /* ===== SIDEBAR ===== */
        .sidebar {
            background: var(--white); border-radius: 24px; padding: 22px;
            height: calc(100vh - 110px); position: sticky; top: 90px;
            box-shadow: var(--shadow); overflow-y: auto; border: 1px solid var(--card-border);
        }
        .sidebar::-webkit-scrollbar { width: 5px; }
        .sidebar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

        .sidebar-title { font-size: 11px; font-weight: 800; color: var(--text-sub); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px; }

        .cat-item {
            display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 14px;
            text-decoration: none; color: var(--text-main); margin-bottom: 4px; font-weight: 600; font-size: 14px; transition: var(--transition);
        }
        .cat-item i { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 14px; transition: 0.3s; }
        .cat-item:hover { background: var(--primary-light); color: var(--primary); transform: translateX(5px); }

        /* CATEGORY COLORS */
        .v i { color: #3b82f6; background: #eff6ff; } .p i { color: #10b981; background: #ecfdf5; }
        .m i { color: #8b5cf6; background: #f5f3ff; } .e i { color: #3730a3; background: #e0e7ff; }
        .fr i { color: #f59e0b; background: #fffbeb; } .j i { color: #f97316; background: #fff7ed; }
        .s i { color: #06b6d4; background: #ecfeff; } .ed i { color: #6366f1; background: #eef2ff; }
        .h i { color: #ec4899; background: #fdf2f8; } .pa i { color: #14b8a6; background: #f0fdfa; }
        .f i { color: #d946ef; background: #fdf4ff; } .sp i { color: #ef4444; background: #fef2f2; }
        .k i { color: #fbbf24; background: #fffbeb; } .ag i { color: #16a34a; background: #f0fdf4; }
        .ie i { color: #4b5563; background: #f3f4f6; } .ot i { color: #6b778c; background: #f1f2f4; }
        .fd i { color: #dc2626; background: #fef2f2; } .ev i { color: #f43f5e; background: #fff1f2; }

        /* ===== FILTER PILLS ===== */
        .filter-container { display: flex; gap: 10px; margin-bottom: 25px; overflow-x: auto; padding: 5px 0; scrollbar-width: none; }
        .pill { white-space: nowrap; padding: 8px 20px; background: var(--white); border: 1.5px solid var(--card-border); border-radius: 50px; font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .pill:hover, .pill.active { border-color: var(--primary); color: var(--primary); background: var(--primary-light); transform: translateY(-1px); }

        /* ===== FEATURED SLIDER (RESPONSIVE FIX) ===== */
        .featured-slider-section {
            background: var(--white); border-radius: 24px; padding: 25px; margin-bottom: 30px;
            box-shadow: var(--shadow); position: relative; border: 1px solid var(--card-border);
            overflow: hidden; /* Fix for mobile shake */
        }
        .slider-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .slider-header h2 { font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        .slider-controls { display: flex; gap: 10px; }
        .slider-controls button {
            background: var(--bg-body); color: var(--text-sub); border: none;
            width: 40px; height: 40px; border-radius: 12px; cursor: pointer; transition: var(--transition);
        }
        .slider-controls button:hover { background: var(--primary); color: white; transform: scale(1.1); }

        .slider-container { overflow: hidden; border-radius: 16px; }
        .slider-track { display: flex; transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
        .slider-item { flex: 0 0 100%; padding: 0 5px; }

        /* ===== CARDS GRID ===== */
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }
        .card { background: var(--white); border-radius: 24px; overflow: hidden; border: 1px solid var(--card-border); transition: var(--transition); position: relative; }
        .card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); border-color: var(--primary); }

        .img-area { position: relative; height: 200px; overflow: hidden; }
        .img-area img { width: 100%; height: 100%; object-fit: cover; transition: 0.8s cubic-bezier(0.2, 1, 0.3, 1); }
        .card:hover .img-area img { transform: scale(1.1); }

        .wishlist { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-sub); cursor: pointer; z-index: 5; }
        .wishlist:hover { color: #ff4d4d; transform: scale(1.1); }

        .badge { position: absolute; top: 12px; left: 12px; background: var(--primary); color: white; padding: 5px 12px; border-radius: 8px; font-size: 10px; font-weight: 800; z-index: 5; }

        .info { padding: 20px; }
        .price { font-size: 22px; font-weight: 800; color: var(--primary); }
        .title { font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 12px; }

        /* Paid Ad Styles */
        .card.featured-ad { border: 1.5px solid #ffab00; background: linear-gradient(180deg, rgba(255,171,0,0.03) 0%, var(--white) 100%); }
        .sponsored-label { font-size: 10px; font-weight: 800; color: #ffab00; display: flex; align-items: center; gap: 5px; margin-bottom: 8px; }

        /* Theme Toggle & Post Button */
        .theme-toggle { background: #f1f2f4; border: none; width: 42px; height: 42px; border-radius: 12px; cursor: pointer; }
        .post-ad-btn { background: var(--primary); color: white; padding: 12px 24px; border-radius: 14px; text-decoration: none; font-weight: 700; display: flex; align-items: center; gap: 8px; box-shadow: 0 8px 25px rgba(0, 82, 204, 0.3); transition: var(--transition); }
        .post-ad-btn:hover { transform: translateY(-3px); }

        /* ===== MOBILE RESPONSIVE (CRITICAL FIX) ===== */
        @media (max-width: 1024px) {
            .sidebar { display: none; }
            .main-wrapper { grid-template-columns: 1fr; margin-top: 15px; }
            .navbar { padding: 10px 4%; }
            .logo span { display: none; }
            .search-container { flex: 1; margin: 0 10px; }
            .nav-actions .post-ad-btn { display: none; }
            .bottom-nav { display: flex; }
            body { padding-bottom: 90px; }

            /* 2. Media Query (Isko humesha CSS ke bilkul niche rakhein) */
@media (max-width: 1024px) {
    .bottom-nav {
        display: flex !important; /* !important lagane se ye zaroor dikhega */
    }
    
    /* Content menu ke piche na chhup jaye isliye body me space */
    body {
        padding-bottom: 80px; 
    }
}
            
            /* Mobile Grid 2 Columns */
            .grid { grid-template-columns: 1fr 1fr; gap: 15px; }
            .img-area { height: 150px; }
            .info { padding: 15px; }
            .price { font-size: 18px; }
            .title { font-size: 13px; -webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
            .meta span:last-child { display: none; } /* Hide time on small mobile for space */
        }

        /* Bottom Nav */
        .bottom-nav { position: fixed; bottom: 0; left: 0; width: 100%; background: var(--white); display: none; justify-content: space-around; padding: 12px 0 25px; border-top: 1px solid var(--card-border); z-index: 2000; box-shadow: 0 -5px 15px rgba(0,0,0,0.03); }
        .dark-mode .bottom-nav { background: #1e293b; }
        .nav-btn { text-align: center; color: var(--text-sub); text-decoration: none; font-size: 11px; font-weight: 700; }
        .nav-btn i { font-size: 20px; display: block; margin-bottom: 4px; }
        .nav-btn.active { color: var(--primary); }



        /* Logo basic styling */
a img {
  width: 80px;          /* normal size */
  height: auto;          /* aspect ratio safe */
  object-fit: contain;
  border-radius: 6px;
  display: block;
}

/* Hover effect (optional but decent) */
a:hover img {
  opacity: 0.9;
}

/* Mobile responsive */
@media (max-width: 768px) {
  a img {
    width: 50px;
  }
}

        


    </style>
</head>
<body>

<header class="navbar">
     <a href="index.php">
      <img src="uploads/logo7.png" alt="Logo" class=" object-contain rounded-md">
    </a>
    <div class="search-container">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Search for anything...">
    </div>
    <div class="nav-actions">
        <button class="theme-toggle" onclick="toggleTheme()"><i class="fas fa-moon"></i></button>
        <a href="#" class="post-ad-btn"><i class="fas fa-plus"></i>Create new listing</a>
    </div>
</header>

<div class="main-wrapper">
    <aside class="sidebar">
        <div class="sidebar-title">Categories</div>
        <div class="cat-list">
            <a href="#" class="cat-item v"><i class="fas fa-car"></i> Vehicles</a>
            <a href="#" class="cat-item p"><i class="fas fa-home"></i> Property</a>
            <a href="#" class="cat-item m"><i class="fas fa-mobile-alt"></i> Mobiles</a>
            <a href="#" class="cat-item e"><i class="fas fa-laptop"></i> Electronics</a>
            <a href="#" class="cat-item fr"><i class="fas fa-couch"></i> Furniture</a>
            <a href="#" class="cat-item j"><i class="fas fa-briefcase"></i> Jobs</a>
            <a href="#" class="cat-item s"><i class="fas fa-tools"></i> Services</a>
            <a href="#" class="cat-item ed"><i class="fas fa-graduation-cap"></i> Education</a>
            <a href="#" class="cat-item h"><i class="fas fa-heartbeat"></i> Health</a>
            <a href="#" class="cat-item pa"><i class="fas fa-dog"></i> Pets</a>
            <a href="#" class="cat-item f"><i class="fas fa-tshirt"></i> Fashion</a>
            <a href="#" class="cat-item sp"><i class="fas fa-volleyball-ball"></i> Sports</a>
            <a href="#" class="cat-item k"><i class="fas fa-baby"></i> Kids</a>
            <a href="#" class="cat-item ag"><i class="fas fa-tractor"></i> Agriculture</a>
            <a href="#" class="cat-item ie"><i class="fas fa-industry"></i> Industrial</a>
            <a href="#" class="cat-item fd"><i class="fas fa-utensils"></i> Food</a>
            <a href="#" class="cat-item ev"><i class="fas fa-calendar-alt"></i> Events</a>
            <a href="#" class="cat-item ot"><i class="fas fa-ellipsis-h"></i> Others</a>
        </div>
    </aside>

    <main>
        <section class="featured-slider-section">
            <div class="slider-header">
                <h2>🔹 Premium Ads</h2>
                <div class="slider-controls">
                    <button onclick="moveSlider(-1)"><i class="fas fa-chevron-left"></i></button>
                    <button onclick="moveSlider(1)"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="slider-container">
                <div class="slider-track" id="featuredSliderTrack">
                    <div class="slider-item">
                        <div class="card featured-ad">
                            <div class="img-area">
                                <span class="badge" style="background: #ffab00;">⭐ TOP AD</span>
                                <button class="wishlist"><i class="far fa-heart"></i></button>
                                <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800" alt="">
                            </div>
                            <div class="info">
                                <div class="sponsored-label"><i class="fas fa-crown"></i> SPONSORED</div>
                                <div class="price">₹72,000</div>
                                <div class="title">Samsung Galaxy S23 Ultra - Sealed Pack</div>
                            </div>
                        </div>
                    </div>
                    <div class="slider-item">
                        <div class="card featured-ad">
                            <div class="img-area">
                                <span class="badge" style="background: #ef4444;">🔥 DEAL</span>
                                <button class="wishlist"><i class="far fa-heart"></i></button>
                                <img src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800" alt="">
                            </div>
                            <div class="info">
                                <div class="sponsored-label"><i class="fas fa-crown"></i> SPONSORED</div>
                                <div class="price">₹1.8 Cr</div>
                                <div class="title">Luxury 3BHK Apartment - Sea View</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="grid">
            <div class="card">
                <div class="img-area">
                    <button class="wishlist"><i class="far fa-heart"></i></button>
                    <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=500" alt="">
                </div>
                <div class="info">
                    <div class="price">₹54,999</div>
                    <div class="title">iPhone 14 Pro - Deep Purple</div>
                    <div class="meta"><span>New Delhi</span><span>1h ago</span></div>
                </div>
            </div>
            <div class="card">
                <div class="img-area">
                    <button class="wishlist"><i class="far fa-heart"></i></button>
                    <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500" alt="">
                </div>
                <div class="info">
                    <div class="price">₹12.4 Lakh</div>
                    <div class="title">Ford Mustang Vintage 1969</div>
                    <div class="meta"><span>Mumbai</span><span>2h ago</span></div>
                </div>

            </div>

            <div class="card">
                <div class="img-area">
                    <button class="wishlist"><i class="far fa-heart"></i></button>
                    <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500" alt="">
                </div>
                <div class="info">
                    <div class="price">₹12.4 Lakh</div>
                    <div class="title">Ford Mustang Vintage 1969</div>
                    <div class="meta"><span>Mumbai</span><span>2h ago</span></div>
                </div>

            </div>

            <div class="card">
                <div class="img-area">
                    <button class="wishlist"><i class="far fa-heart"></i></button>
                    <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500" alt="">
                </div>
                <div class="info">
                    <div class="price">₹12.4 Lakh</div>
                    <div class="title">Ford Mustang Vintage 1969</div>
                    <div class="meta"><span>Mumbai</span><span>2h ago</span></div>
                </div>

            </div>
            <div class="card">
                <div class="img-area">
                    <button class="wishlist"><i class="far fa-heart"></i></button>
                    <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500" alt="">
                </div>
                <div class="info">
                    <div class="price">₹12.4 Lakh</div>
                    <div class="title">Ford Mustang Vintage 1969</div>
                    <div class="meta"><span>Mumbai</span><span>2h ago</span></div>
                </div>

            </div>
            <div class="card">
                <div class="img-area">
                    <button class="wishlist"><i class="far fa-heart"></i></button>
                    <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500" alt="">
                </div>
                <div class="info">
                    <div class="price">₹12.4 Lakh</div>
                    <div class="title">Ford Mustang Vintage 1969</div>
                    <div class="meta"><span>Mumbai</span><span>2h ago</span></div>
                </div>

            </div>




            
        </div>
    </main>
</div>

<nav class="bottom-nav">
    <a href="#" class="nav-btn active"><i class="fas fa-home"></i>Home</a>
    <a href="#" class="nav-btn"><i class="fas fa-compass"></i>Explore</a>
    <a href="#" class="nav-btn" style="color:var(--primary)"><i class="fas fa-plus-circle" style="font-size:28px"></i>Sell</a>
    <a href="#" class="nav-btn"><i class="fas fa-comment-dots"></i>Chats</a>
    <a href="#" class="nav-btn"><i class="fas fa-user-circle"></i>Profile</a>
</nav>

<script>
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const icon = document.querySelector('.theme-toggle i');
        const isDark = document.body.classList.contains('dark-mode');
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }

    const sliderTrack = document.getElementById('featuredSliderTrack');
    let sliderPosition = 0;
    const slideCount = sliderTrack.children.length;

    function moveSlider(direction) {
        sliderPosition += direction;
        if (sliderPosition < 0) sliderPosition = slideCount - 1;
        else if (sliderPosition >= slideCount) sliderPosition = 0;
        sliderTrack.style.transform = `translateX(-${sliderPosition * 100}%)`;
    }

    setInterval(() => moveSlider(1), 5000);



</script>

</body>
</html>