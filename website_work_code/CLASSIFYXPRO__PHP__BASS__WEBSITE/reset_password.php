<?php
session_start();
require_once "db.php";
$conn = getDBConnection();

$error = "";
$success = "";

// ✅ Ensure user came via OTP verify page
if(!isset($_SESSION['reset_email'])){
    die("❌ Unauthorized access! Please go through OTP verification.");
}

$email = $_SESSION['reset_email'];

// Get user id from email
$stmt = $conn->prepare("SELECT id FROM users WHERE email=? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
if($stmt->num_rows == 0){
    die("❌ User not found!");
}
$stmt->bind_result($user_id);
$stmt->fetch();
$stmt->close();

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $password = trim($_POST['password']);
    $confirm = trim($_POST['confirm_password']);

    if($password !== $confirm){
        $error = "❌ Passwords do not match!";
    } else {
        $hash = password_hash($password, PASSWORD_BCRYPT);

        // Update password and clear OTP
        $stmt = $conn->prepare("UPDATE users SET password=?, otp=NULL, otp_expiry=NULL WHERE id=?");
        $stmt->bind_param("si", $hash, $user_id);
        $stmt->execute();
        $stmt->close();

        // Destroy session after password reset
        session_destroy();
        $success = "✅ Password updated successfully! You can now <a href='login.php'>login</a>.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Password</title>
<link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Poppins',sans-serif;}
body{background:linear-gradient(135deg,#c9d6ff,#e2e2e2);display:flex;justify-content:center;align-items:center;min-height:100vh;}
.container{background:#fff;padding:40px 30px;border-radius:20px;box-shadow:0 10px 25px rgba(0,0,0,0.2);width:350px;text-align:center;}
.container h2{margin-bottom:25px;color:#333;}
.input-box{position:relative;margin-bottom:25px;}
.input-box input{width:100%;padding:12px 20px;border-radius:8px;border:1px solid #ccc;outline:none;font-size:16px;transition:0.3s;}
.input-box input:focus{border-color:#7494ec;box-shadow:0 0 5px rgba(116,148,236,0.5);}
.btn{width:100%;padding:12px;background:#7494ec;border:none;border-radius:8px;color:#fff;font-size:16px;font-weight:600;cursor:pointer;transition:0.3s;}
.btn:hover{background:#5b7ae7;transform:scale(1.03);}
.message{margin-bottom:15px;font-size:14px;color:red;}
.success{color:green;}
@media screen and (max-width:400px){.container{width:90%;padding:30px 20px;}}
</style>
</head>
<body>
<div class="container">
<h2>Reset Password</h2>
<?php if($error) echo "<div class='message'>$error</div>"; ?>
<?php if($success) echo "<div class='message success'>$success</div>"; ?>

<form method="POST">
    <div class="input-box">
        <input type="password" name="password" placeholder="New Password" required>
    </div>
    <div class="input-box">
        <input type="password" name="confirm_password" placeholder="Confirm Password" required>
    </div>
    <button type="submit" class="btn">Reset Password</button>
</form>
</div>
</body>
</html>
