<?php
session_start();

if(!isset($_SESSION['user_id'])){
    $redirect = $_SERVER['REQUEST_URI'];
    header("Location: login.php?redirect=$redirect");
    exit();
}

require_once "db.php";
$conn = getDBConnection();

$message = ""; // ✅ FIX (important)

if($_SERVER['REQUEST_METHOD'] === 'POST'){

    $user_id   = $_SESSION['user_id']; 
    $company   = htmlspecialchars($_POST['company']);
    $category  = htmlspecialchars($_POST['category']);
    $title     = htmlspecialchars($_POST['title']);
    $description = htmlspecialchars($_POST['description']);
    $location  = htmlspecialchars($_POST['location']);
    $phone     = htmlspecialchars($_POST['phone']);
    $tags      = htmlspecialchars($_POST['tags'] ?? "");
    $website   = htmlspecialchars($_POST['website'] ?? "");

    // IMAGE UPLOAD
    $imageNameDB = "";

    if(isset($_FILES['image']) && $_FILES['image']['error'] == 0){

        $targetDir = "uploads/";

        if(!is_dir($targetDir)){
            mkdir($targetDir,0755,true);
        }

        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg','jpeg','png','gif'];

        if(!in_array($ext,$allowed)){
            $message = "❌ Only JPG, JPEG, PNG, GIF allowed";
        }

        elseif($_FILES['image']['size'] > 2*1024*1024){
            $message = "❌ Image must be under 2MB";
        }

        else{

            $imageName = time()."_".uniqid().".".$ext;
            $imagePath = $targetDir.$imageName;

            if(move_uploaded_file($_FILES['image']['tmp_name'],$imagePath)){
                $imageNameDB = $imageName;
            }
            else{
                $message = "❌ Upload failed";
            }

        }

    }

// INSERT DATABASE
if($message == ""){

    // ✅ SEO FRIENDLY SLUG FIX
    $clean = strtolower($title);
    $clean = preg_replace('/[^a-z0-9\s-]/', '', $clean);
    $clean = preg_replace('/[\s-]+/', '-', $clean);
    $slug = trim($clean, '-') . "-" . time();

    $stmt = $conn->prepare("INSERT INTO ads 
    (user_id,company,category,title,description,location,phone,image,tags,website,slug,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW())");

    $stmt->bind_param("issssssssss",
        $user_id,
        $company,
        $category,
        $title,
        $description,
        $location,
        $phone,
        $imageNameDB,
        $tags,
        $website,
        $slug
    );

    if($stmt->execute()){

        header("Location: index.php");
        exit();

    }else{

        $message = "❌ Database Error : ".$stmt->error;

    }

    $stmt->close();

}

}

?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Post New Ad</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #f0f4f8, #d9e2ec);
    margin: 0; padding: 0;
}
h1 { text-align: center; font-size:2.2rem; font-weight:600; margin:40px 0 20px; color:#1a73e8; }
form {
    max-width:700px;
    margin: 0 auto 50px;
    background:#fff;
    padding:40px;
    border-radius:20px;
    box-shadow:0 15px 35px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}
form:hover { transform: translateY(-5px); }
label { font-weight:500;color:#333; display:block; margin-bottom:8px; }
input, textarea, select { width:100%; padding:14px 16px; margin-bottom:20px; border-radius:12px; border:1px solid #ccc; font-size:1rem; transition:all 0.3s ease; }
input:focus, textarea:focus, select:focus { border-color:#1a73e8; box-shadow:0 0 12px rgba(26,115,232,0.3); outline:none; }
button {
    width:100%; padding:14px; 
    background:linear-gradient(90deg,#1a73e8,#4285f4); 
    color:#fff; font-weight:600; font-size:1rem; 
    border:none; border-radius:30px; cursor:pointer; 
    transition:all 0.3s ease, box-shadow 0.2s ease;
}
button:hover {
    transform:scale(1.05); 
    background:linear-gradient(90deg,#155ab6,#1a4fc1);
    box-shadow:0 8px 20px rgba(0,0,0,0.2);
}
button:active {
    transform:scale(0.98);
    box-shadow:0 4px 10px rgba(0,0,0,0.2);
}
.message { text-align:center; font-weight:600; margin-bottom:20px; font-size:1rem; color: <?= (isset($message) && strpos($message,"✅")!==false) ? "green" : "red" ?>; }

/* Drag & Drop */
#drop-area { border:2px dashed #1a73e8; padding:30px; text-align:center; border-radius:15px; background:#f9fbfd; cursor:pointer; transition:0.3s; }
#drop-area:hover { background:#e3f0ff; border-color:#1a73e8; }
#drop-area p { margin:0; font-size:1rem; color:#333; }
#drop-area .browse-btn { color:#1a73e8; font-weight:600; cursor:pointer; text-decoration:underline; }
#preview { display:none; max-width:100%; margin-top:15px; border-radius:12px; }

/* ✅ Location Autocomplete */
.autocomplete-container { position: relative; width:100%; }
.suggestions {
    position: absolute;
    top: 100%; left: 0; right: 0;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 999;
}
.suggestions div { padding: 10px; cursor: pointer; }
.suggestions div:hover { background: #f0f0f0; }
</style>
</head>
<body>

<h1>Post Your Ad</h1>
<?php if(isset($message) && $message) echo "<div class='message'>$message</div>"; ?>

<form action="" method="POST" enctype="multipart/form-data">
    <label>Company / Name</label>
    <input type="text" name="company" placeholder="Your name or business" required>

    <label>Category</label>
    <select name="category" required>
        <option value="">Select Category</option>
        <option value="Jobs">Jobs</option>
        <option value="Real Estate">Real Estate</option>
        <option value="Vehicles">Vehicles</option>
        <option value="Services">Services</option>
        <option value="Electronics">Electronics</option>
        <option value="Community">Community</option>
    </select>

    <label>Title</label>
    <input type="text" name="title" placeholder="Ad title" required>

    <label>Description</label>
    <textarea name="description" rows="5" placeholder="Write description..." required></textarea>

    <label>Phone</label>
    <input type="text" name="phone" placeholder="Your contact number" required>

    <label>Tags (Optional)</label>
    <input type="text" name="tags" placeholder="Comma separated tags">

    <label>Website / Link (Optional)</label>
    <input type="text" name="website" placeholder="Website URL">

    <!-- ✅ Location Autocomplete -->
    <label>Select Location</label>
    <div class="autocomplete-container">
        <input type="text" id="locationInput" name="location" placeholder="Type a location..." required>
        <div id="suggestions" class="suggestions"></div>
    </div>

    <label>Upload Image</label>
    <div id="drop-area">
        <p>Drag & Drop your image here or <span class="browse-btn">Browse</span></p>
        <input type="file" name="image" id="fileInput" accept="image/*" hidden required>
        <img id="preview" src="" alt="Preview">
    </div>

    <button type="submit">Post Ad</button>
</form>

<script>
// ✅ File Upload Preview
const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");

dropArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0]; 
    if(file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => { preview.src=reader.result; preview.style.display="block"; };
        reader.readAsDataURL(file);
    }
});

dropArea.addEventListener("dragover",(e)=>{e.preventDefault(); dropArea.style.background="#d6e6ff";});
dropArea.addEventListener("dragleave",()=>{dropArea.style.background="#f9fbfd";});
dropArea.addEventListener("drop",(e)=>{
    e.preventDefault(); 
    dropArea.style.background="#f9fbfd"; 
    fileInput.files=e.dataTransfer.files; 
    const file=e.dataTransfer.files[0]; 
    if(file) { 
        const reader=new FileReader(); 
        reader.onload=()=>{preview.src=reader.result; preview.style.display="block";}; 
        reader.readAsDataURL(file); 
    }
});

// ✅ Location Autocomplete (Nominatim API)
const input = document.getElementById("locationInput");
const suggestions = document.getElementById("suggestions");

input.addEventListener("input", function() {
  const query = input.value.trim();
  if (query.length < 3) {
    suggestions.innerHTML = "";
    return;
  }

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
    .then(res => res.json())
    .then(data => {
      suggestions.innerHTML = "";
      data.forEach(place => {
        const div = document.createElement("div");
        div.textContent = place.display_name;
        div.addEventListener("click", () => {
          input.value = place.display_name;
          suggestions.innerHTML = "";
        });
        suggestions.appendChild(div);
      });
    });
});
</script>

</body>
</html>

<?php $conn->close(); ?>
