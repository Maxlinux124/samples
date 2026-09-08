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

