<?php
session_start();
if(!isset($_SESSION['user_id'])){
    $redirect = $_SERVER['REQUEST_URI'];
    header("Location: login.php?redirect=$redirect");
    exit();
}

// ✅ Database connection
require_once "db.php";
$conn = getDBConnection();

// ✅ Get ad ID
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

// ✅ Fetch existing ad
$stmt = $conn->prepare("SELECT * FROM ads WHERE id=? LIMIT 1");
$stmt->bind_param("i",$id);
$stmt->execute();
$result = $stmt->get_result();
if($result->num_rows===0) die("Ad not found.");
$row = $result->fetch_assoc();
$stmt->close();

// ✅ Only owner can edit
if($_SESSION['user_id'] != $row['user_id']){
    die("You are not authorized to edit this post.");
}

// ✅ Handle form submission
$message = "";
if($_SERVER['REQUEST_METHOD']==='POST'){
    $company = htmlspecialchars($_POST['company']);
    $category = htmlspecialchars($_POST['category']);
    $title = htmlspecialchars($_POST['title']);
    $description = htmlspecialchars($_POST['description']);
    $location = htmlspecialchars($_POST['location']);
    $phone = htmlspecialchars($_POST['phone']);
    $tags = htmlspecialchars($_POST['tags'] ?? "");
    $website = htmlspecialchars($_POST['website'] ?? "");
    
    // Handle image
    $imageNameDB = $row['image']; // default old image
    if(isset($_FILES['image']) && $_FILES['image']['error']==0){
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg','jpeg','png','gif'];
        if(!in_array($ext,$allowed)){
            $message = "❌ Only JPG, JPEG, PNG, GIF allowed.";
        } elseif($_FILES['image']['size']>2*1024*1024){
            $message = "❌ Max size 2MB.";
        } else {
            $imageName = time().'_'.uniqid().'.'.$ext;
            $targetDir = "uploads/";
            if(!is_dir($targetDir)) mkdir($targetDir,0755,true);
            if(move_uploaded_file($_FILES['image']['tmp_name'],$targetDir.$imageName)){
                $imageNameDB = $imageName;
            } else {
                $message = "❌ Failed to upload image.";
            }
        }
    }

    if(empty($message)){
        $update = $conn->prepare("UPDATE ads SET company=?, category=?, title=?, description=?, location=?, phone=?, tags=?, website=?, image=? WHERE id=?");
        $update->bind_param("sssssssssi", $company,$category,$title,$description,$location,$phone,$tags,$website,$imageNameDB,$id);
        if($update->execute()){
            $update->close();
            header("Location: view-ads.php?id=".$id);
            exit();
        } else {
            $message = "❌ Error: ".$update->error;
            $update->close();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Edit Ad - <?= htmlspecialchars($row['title']); ?></title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
body { font-family:'Inter',sans-serif; background:linear-gradient(135deg,#f0f4f8,#d9e2ec); margin:0; padding:0; }
h1 { text-align:center; font-size:2.2rem; font-weight:600; margin:40px 0 20px; color:#1a73e8; }
form { max-width:700px; margin:0 auto 50px; background:#fff; padding:40px; border-radius:20px; box-shadow:0 15px 35px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
form:hover { transform:translateY(-5px); }
label { font-weight:500;color:#333; display:block; margin-bottom:8px; }
input, textarea, select { width:100%; padding:14px 16px; margin-bottom:20px; border-radius:12px; border:1px solid #ccc; font-size:1rem; transition:all 0.3s ease; }
input:focus, textarea:focus, select:focus { border-color:#1a73e8; box-shadow:0 0 12px rgba(26,115,232,0.3); outline:none; }
button { width:100%; padding:14px; background:linear-gradient(90deg,#1a73e8,#4285f4); color:#fff; font-weight:600; font-size:1rem; border:none; border-radius:30px; cursor:pointer; transition:all 0.3s ease, box-shadow 0.2s ease; }
button:hover { transform:scale(1.05); background:linear-gradient(90deg,#155ab6,#1a4fc1); box-shadow:0 8px 20px rgba(0,0,0,0.2); }
button:active { transform:scale(0.98); box-shadow:0 4px 10px rgba(0,0,0,0.2); }
.message { text-align:center; font-weight:600; margin-bottom:20px; font-size:1rem; color: <?= (isset($message) && strpos($message,"❌")!==false)?"red":"green"; ?>; }
#drop-area { border:2px dashed #1a73e8; padding:30px; text-align:center; border-radius:15px; background:#f9fbfd; cursor:pointer; transition:0.3s; }
#drop-area:hover { background:#e3f0ff; border-color:#1a73e8; }
#drop-area p { margin:0; font-size:1rem; color:#333; }
#drop-area .browse-btn { color:#1a73e8; font-weight:600; cursor:pointer; text-decoration:underline; }
#preview { display:block; max-width:100%; margin-top:15px; border-radius:12px; }

/* Autocomplete */
.autocomplete-suggestions {
    border:1px solid #ccc;
    max-height:200px;
    overflow-y:auto;
    border-radius:8px;
    background:#fff;
    position:absolute;
    z-index:9999;
    width:90%;
    box-shadow:0 4px 10px rgba(0,0,0,0.1);
}
.autocomplete-suggestions div {
    padding:10px;
    cursor:pointer;
}
.autocomplete-suggestions div:hover {
    background:#f0f0f0;
}
</style>
</head>
<body>

<h1>Edit Your Ad</h1>
<?php if($message) echo "<div class='message'>$message</div>"; ?>

<form action="" method="POST" enctype="multipart/form-data">
    <label>Company / Name</label>
    <input type="text" name="company" value="<?= htmlspecialchars($row['company']); ?>" required>

    <label>Category</label>
    <select name="category" required>
        <option value="">Select Category</option>
        <?php
        $categories = ["Jobs","Real Estate","Vehicles","Services","Electronics","Community"];
        foreach($categories as $cat){
            $sel = ($row['category']==$cat) ? "selected" : "";
            echo "<option value='$cat' $sel>$cat</option>";
        }
        ?>
    </select>

    <label>Title</label>
    <input type="text" name="title" value="<?= htmlspecialchars($row['title']); ?>" required>

    <label>Description</label>
    <textarea name="description" rows="5" required><?= htmlspecialchars($row['description']); ?></textarea>

    <label>Phone</label>
    <input type="text" name="phone" value="<?= htmlspecialchars($row['phone']); ?>" required>

    <label>Tags (Optional)</label>
    <input type="text" name="tags" value="<?= htmlspecialchars($row['tags']); ?>">

    <label>Website / Link (Optional)</label>
    <input type="text" name="website" value="<?= htmlspecialchars($row['website']); ?>">

    <label>Location</label>
    <input type="text" id="location" name="location" value="<?= htmlspecialchars($row['location']); ?>" required>
    <div id="suggestions" class="autocomplete-suggestions"></div>

    <label>Upload Image</label>
    <div id="drop-area">
        <p>Drag & Drop your image here or <span class="browse-btn">Browse</span></p>
        <input type="file" name="image" id="fileInput" accept="image/*" hidden>
        <img id="preview" src="uploads/<?= htmlspecialchars($row['image']); ?>" alt="Preview">
    </div>

    <button type="submit">Update Ad</button>
</form>

<script>
const dropArea=document.getElementById("drop-area");
const fileInput=document.getElementById("fileInput");
const preview=document.getElementById("preview");

// File preview
dropArea.addEventListener("click",()=>fileInput.click());
fileInput.addEventListener("change",()=>{const file=fileInput.files[0];if(file&&file.type.startsWith("image/")){const reader=new FileReader();reader.onload=()=>{preview.src=reader.result;preview.style.display="block";};reader.readAsDataURL(file);}});

// Drag & Drop
dropArea.addEventListener("dragover",(e)=>{e.preventDefault();dropArea.style.background="#d6e6ff";});
dropArea.addEventListener("dragleave",()=>{dropArea.style.background="#f9fbfd";});
dropArea.addEventListener("drop",(e)=>{e.preventDefault();dropArea.style.background="#f9fbfd";fileInput.files=e.dataTransfer.files;const file=e.dataTransfer.files[0];if(file){const reader=new FileReader();reader.onload=()=>{preview.src=reader.result;};reader.readAsDataURL(file);}});

// ✅ Location Autocomplete
const locationInput=document.getElementById("location");
const suggestionsBox=document.getElementById("suggestions");

locationInput.addEventListener("input",function(){
    let query=this.value.trim();
    if(query.length<3){suggestionsBox.innerHTML="";return;}
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
    .then(res=>res.json())
    .then(data=>{
        suggestionsBox.innerHTML="";
        data.forEach(place=>{
            let div=document.createElement("div");
            div.textContent=place.display_name;
            div.addEventListener("click",()=>{
                locationInput.value=place.display_name;
                suggestionsBox.innerHTML="";
            });
            suggestionsBox.appendChild(div);
        });
    });
});
</script>

</body>
</html>

<?php $conn->close(); ?> a code bhi raun  nhia ho rah he  

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Edit Ad - <?= htmlspecialchars($row['title']); ?></title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
body { font-family:'Inter',sans-serif; background:linear-gradient(135deg,#f0f4f8,#d9e2ec); margin:0; padding:0; }
h1 { text-align:center; font-size:2.2rem; font-weight:600; margin:40px 0 20px; color:#1a73e8; }
form { max-width:700px; margin:0 auto 50px; background:#fff; padding:40px; border-radius:20px; box-shadow:0 15px 35px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
form:hover { transform:translateY(-5px); }
label { font-weight:500;color:#333; display:block; margin-bottom:8px; }
input, textarea, select { width:100%; padding:14px 16px; margin-bottom:20px; border-radius:12px; border:1px solid #ccc; font-size:1rem; transition:all 0.3s ease; }
input:focus, textarea:focus, select:focus { border-color:#1a73e8; box-shadow:0 0 12px rgba(26,115,232,0.3); outline:none; }
button { width:100%; padding:14px; background:linear-gradient(90deg,#1a73e8,#4285f4); color:#fff; font-weight:600; font-size:1rem; border:none; border-radius:30px; cursor:pointer; transition:all 0.3s ease, box-shadow 0.2s ease; }
button:hover { transform:scale(1.05); background:linear-gradient(90deg,#155ab6,#1a4fc1); box-shadow:0 8px 20px rgba(0,0,0,0.2); }
button:active { transform:scale(0.98); box-shadow:0 4px 10px rgba(0,0,0,0.2); }
.message { text-align:center; font-weight:600; margin-bottom:20px; font-size:1rem; color: <?= (isset($message) && strpos($message,"❌")!==false)?"red":"green"; ?>; }
#drop-area { border:2px dashed #1a73e8; padding:30px; text-align:center; border-radius:15px; background:#f9fbfd; cursor:pointer; transition:0.3s; }
#drop-area:hover { background:#e3f0ff; border-color:#1a73e8; }
#drop-area p { margin:0; font-size:1rem; color:#333; }
#drop-area .browse-btn { color:#1a73e8; font-weight:600; cursor:pointer; text-decoration:underline; }
#preview { display:block; max-width:100%; margin-top:15px; border-radius:12px; }

/* Autocomplete */
.autocomplete-suggestions {
    border:1px solid #ccc;
    max-height:200px;
    overflow-y:auto;
    border-radius:8px;
    background:#fff;
    position:absolute;
    z-index:9999;
    width:90%;
    box-shadow:0 4px 10px rgba(0,0,0,0.1);
}
.autocomplete-suggestions div {
    padding:10px;
    cursor:pointer;
}
.autocomplete-suggestions div:hover {
    background:#f0f0f0;
}
</style>
</head>
<body>

<h1>Edit Your Ad</h1>
<?php if($message) echo "<div class='message'>$message</div>"; ?>

<form action="" method="POST" enctype="multipart/form-data">
    <label>Company / Name</label>
    <input type="text" name="company" value="<?= htmlspecialchars($row['company']); ?>" required>

    <label>Category</label>
    <select name="category" required>
        <option value="">Select Category</option>
        <?php
        $categories = ["Jobs","Real Estate","Vehicles","Services","Electronics","Community"];
        foreach($categories as $cat){
            $sel = ($row['category']==$cat) ? "selected" : "";
            echo "<option value='$cat' $sel>$cat</option>";
        }
        ?>
    </select>

    <label>Title</label>
    <input type="text" name="title" value="<?= htmlspecialchars($row['title']); ?>" required>

    <label>Description</label>
    <textarea name="description" rows="5" required><?= htmlspecialchars($row['description']); ?></textarea>

    <label>Phone</label>
    <input type="text" name="phone" value="<?= htmlspecialchars($row['phone']); ?>" required>

    <label>Tags (Optional)</label>
    <input type="text" name="tags" value="<?= htmlspecialchars($row['tags']); ?>">

    <label>Website / Link (Optional)</label>
    <input type="text" name="website" value="<?= htmlspecialchars($row['website']); ?>">

    <label>Location</label>
    <input type="text" id="location" name="location" value="<?= htmlspecialchars($row['location']); ?>" required>
    <div id="suggestions" class="autocomplete-suggestions"></div>

    <label>Upload Image</label>
    <div id="drop-area">
        <p>Drag & Drop your image here or <span class="browse-btn">Browse</span></p>
        <input type="file" name="image" id="fileInput" accept="image/*" hidden>
        <img id="preview" src="uploads/<?= htmlspecialchars($row['image']); ?>" alt="Preview">
    </div>

    <button type="submit">Update Ad</button>
</form>

<script>
const dropArea=document.getElementById("drop-area");
const fileInput=document.getElementById("fileInput");
const preview=document.getElementById("preview");

// File preview
dropArea.addEventListener("click",()=>fileInput.click());
fileInput.addEventListener("change",()=>{const file=fileInput.files[0];if(file&&file.type.startsWith("image/")){const reader=new FileReader();reader.onload=()=>{preview.src=reader.result;preview.style.display="block";};reader.readAsDataURL(file);}});

// Drag & Drop
dropArea.addEventListener("dragover",(e)=>{e.preventDefault();dropArea.style.background="#d6e6ff";});
dropArea.addEventListener("dragleave",()=>{dropArea.style.background="#f9fbfd";});
dropArea.addEventListener("drop",(e)=>{e.preventDefault();dropArea.style.background="#f9fbfd";fileInput.files=e.dataTransfer.files;const file=e.dataTransfer.files[0];if(file){const reader=new FileReader();reader.onload=()=>{preview.src=reader.result;};reader.readAsDataURL(file);}});

// ✅ Location Autocomplete
const locationInput=document.getElementById("location");
const suggestionsBox=document.getElementById("suggestions");

locationInput.addEventListener("input",function(){
    let query=this.value.trim();
    if(query.length<3){suggestionsBox.innerHTML="";return;}
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
    .then(res=>res.json())
    .then(data=>{
        suggestionsBox.innerHTML="";
        data.forEach(place=>{
            let div=document.createElement("div");
            div.textContent=place.display_name;
            div.addEventListener("click",()=>{
                locationInput.value=place.display_name;
                suggestionsBox.innerHTML="";
            });
            suggestionsBox.appendChild(div);
        });
    });
});
</script>

</body>
</html>

<?php $conn->close(); ?>
