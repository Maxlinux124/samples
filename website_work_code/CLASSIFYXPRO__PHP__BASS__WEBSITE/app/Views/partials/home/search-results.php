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


        ";
    }
}
?>
</div>



