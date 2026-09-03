<?php
session_start();
include_once "db.php";
$conn = getDBConnection();

$slug = isset($_GET['s']) ? urldecode($_GET['s']) : '';

if(empty($slug)){
    die("Ad not found.");
}

$stmt = $conn->prepare("SELECT * FROM ads WHERE slug = ? LIMIT 1");
$stmt->bind_param("s", $slug);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    die("Ad not found.");
}

$row = $result->fetch_assoc();
$stmt->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title><?= htmlspecialchars($row['title']); ?> - Ad Details</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
</head>
<body class="bg-gray-100 font-sans">

<div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg mt-10 p-6 relative">

   <!-- 🌟 Edit Button (Owner Only - Top Right, Always Visible) -->
<?php if(isset($_SESSION['user_id']) && $_SESSION['user_id'] == $row['user_id']): ?>
<form action="edit_post.php" method="get" 
      class="fixed bottom-5 right-5 md:absolute md:top-4 md:right-4 z-50">
    <input type="hidden" name="id" value="<?= $row['id'] ?>">
    <button type="submit" 
        class="bg-yellow-500 hover:bg-yellow-600 text-white p-4 md:p-3 rounded-full shadow-lg transition transform hover:scale-110 flex items-center justify-center"
        title="Edit Post">
        <i class="fas fa-edit text-xl"></i>
    </button>
</form>
<?php endif; ?>

    <!-- Title -->
    <h1 class="text-3xl font-bold text-blue-700 mb-4"><?= htmlspecialchars($row['title']); ?></h1>
    
    <!-- Image -->
    <?php if(!empty($row['image'])): ?>
    <img src="/uploads/<?= htmlspecialchars($row['image']); ?>" 
         alt="Ad Image" 
         class="w-full max-h-96 object-cover rounded-xl mb-6 shadow-md">
    <?php endif; ?>
    
    <!-- Details -->
    <div class="space-y-3 text-gray-700">
        <p><strong>Category:</strong> <?= htmlspecialchars($row['category']); ?></p>
        <p><strong>Location:</strong> <?= htmlspecialchars($row['location']); ?></p>
        <p><strong>Contact:</strong> <?= htmlspecialchars($row['phone']); ?> | <?= htmlspecialchars($row['name']); ?></p>
        
        <!-- 🌐 Website -->
        <?php if(!empty($row['website'])): ?>
        <p><strong>Website:</strong> 
            <a href="<?= htmlspecialchars($row['website']); ?>" target="_blank" 
               class="text-blue-600 underline hover:text-blue-800 transition">
               <?= htmlspecialchars($row['website']); ?>
            </a>
        </p>
        <?php endif; ?>
        
        <p><strong>Description:</strong><br><?= nl2br(htmlspecialchars($row['description'])); ?></p>
        <p><strong>Tags:</strong> <?= htmlspecialchars($row['tags']); ?></p>
        <p class="text-sm text-gray-500">Posted on: <?= htmlspecialchars($row['created_at']); ?></p>
    </div>
    
 <!-- Back Button -->
<a href="/" 
   class="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition transform hover:scale-105">
   ← Back to Home
</a>

</div>

</body>
</html>
<?php $conn->close(); ?>