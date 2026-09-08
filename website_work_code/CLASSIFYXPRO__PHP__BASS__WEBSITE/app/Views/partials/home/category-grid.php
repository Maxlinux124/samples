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



