<?php
session_start();
if (!isset($_SESSION["username"])) {
    header("Location: login.php");
    exit();
}


include_once "db.php";
$conn = getDBConnection();

$result = $conn->query("SELECT * FROM ads ORDER BY created_at DESC");
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>All Ads</title>
<style>
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f2f4f8;
    margin: 0;
    padding: 0;
}
.container {
    max-width: 1200px;
    margin: 30px auto;
    padding: 0 15px;
}
h1 {
    text-align: center;
    color: #007bff;
    margin-bottom: 30px;
}
.ad {
    background: #fff;
    display: flex;
    flex-wrap: wrap;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    margin: 15px 0;
    overflow: hidden;
    transition: transform 0.3s ease;
}
.ad:hover {
    transform: translateY(-5px);
}
.ad img {
    flex: 0 0 200px;
    width: 200px;
    height: 200px;
    object-fit: cover;
}
.ad-details {
    flex: 1;
    padding: 20px;
}
.ad-details h2 {
    margin: 0 0 10px;
    font-size: 22px;
    color: #333;
}
.ad-details p {
    margin: 6px 0;
    color: #555;
    font-size: 15px;
}
.ad-details small {
    display: block;
    margin-top: 10px;
    color: #888;
}
.view-btn {
    display: inline-block;
    margin-top: 10px;
    padding: 8px 14px;
    border: 2px solid #007bff;
    background: transparent;
    color: #007bff;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
}
.view-btn:hover {
    background: #007bff;
    color: #fff;
}

/* Mobile Responsive */
@media (max-width: 600px) {
    .ad {
        flex-direction: column;
        align-items: center;
    }
    .ad img {
        width: 100%;
        height: auto;
    }
    .ad-details {
        padding: 15px;
    }
}
</style>
</head>
<body>
<div class="container">
<h1>All Ads</h1>
<?php while($row = $result->fetch_assoc()) { ?>
<div class="ad">
    <?php if (!empty($row['image'])) { ?>
        <img src="uploads/<?php echo htmlspecialchars($row['image']); ?>" alt="Ad Image">
    <?php } else { ?>
        <img src="https://via.placeholder.com/400x400?text=No+Image" alt="No Image">
    <?php } ?>
    <div class="ad-details">
        <h2><?php echo htmlspecialchars($row['title']); ?></h2>
        <p><strong>Category:</strong> <?php echo htmlspecialchars($row['category']); ?></p>
        <p><?php echo htmlspecialchars($row['description']); ?></p>
        <p><strong>Location:</strong> <?php echo htmlspecialchars($row['location']); ?></p>
        <p><strong>Contact:</strong> <?php echo htmlspecialchars($row['phone']); ?> | <?php echo htmlspecialchars($row['name']); ?></p>
        <p><strong>Tags:</strong> <?php echo htmlspecialchars($row['tags']); ?></p>
        <small>Posted on <?php echo htmlspecialchars($row['created_at']); ?></small>
        <a href="/ad/<?php echo urlencode($row['slug']); ?>" class="view-btn">View Details</a>
    </div>
</div>
<?php } ?>
</div>
</body>
</html>
