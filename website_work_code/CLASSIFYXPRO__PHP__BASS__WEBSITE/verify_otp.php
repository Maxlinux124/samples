<?php
session_start();
require_once "db.php";
$conn = getDBConnection();

$error = "";

// ✅ Ensure user came from forgot password page
if(!isset($_SESSION['reset_email'])){
    header("Location: forgot_password.php");
    exit;
}

$email = $_SESSION['reset_email'];

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $otp_input = trim($_POST['otp']);

    if(empty($otp_input)){
        $error = "❌ Please enter OTP!";
    } else {
        // Check OTP and expiry
        $stmt = $conn->prepare("SELECT id, otp_expiry FROM users WHERE email=? AND otp=? LIMIT 1");
        $stmt->bind_param("ss", $email, $otp_input);
        $stmt->execute();
        $stmt->store_result();

        if($stmt->num_rows == 0){
            $error = "❌ Invalid OTP!";
        } else {
            $stmt->bind_result($user_id, $expiry);
            $stmt->fetch();
            $stmt->close();

            if(strtotime($expiry) < time()){
                $error = "❌ OTP expired! Please request a new one.";
            } else {
                // OTP valid → set session for reset password
                $_SESSION['reset_user_id'] = $user_id;

                // Optional: clear OTP from DB to prevent reuse
                $stmt = $conn->prepare("UPDATE users SET otp=NULL, otp_expiry=NULL WHERE id=?");
                $stmt->bind_param("i", $user_id);
                $stmt->execute();
                $stmt->close();

                header("Location: reset_password.php");
                exit;
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verify OTP</title>
<link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

body{
  font-family:'Poppins',sans-serif;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display:flex;
  justify-content:center;
  align-items:center;
  height:100vh;
  margin:0;
}

.container{
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(15px);
  padding:40px 30px;
  border-radius:20px;
  box-shadow:0 15px 35px rgba(0,0,0,0.2);
  width:350px;
  text-align:center;
  color:#fff;
  animation: fadeIn 0.8s ease-in-out;
}

.container h2{
  margin-bottom:25px;
  font-size:24px;
  font-weight:600;
}

.input-box{
  position:relative;
  margin-bottom:25px;
}

.input-box input{
  width:60%;
  padding:12px 15px 12px 40px;  /* left padding for icon */
  border-radius:12px;
  border:none;
  outline:none;
  font-size:16px;
  transition:0.3s;
  background:rgba(255,255,255,0.2);
  color:#fff;
}

.input-box input::placeholder{
  color:#eee;
}

.input-box input:focus{
  box-shadow:0 0 8px rgba(255,255,255,0.6);
  transform:scale(1.02);
}

.input-box i{
  position:absolute;
  left:12px;
  top:50%;
  transform:translateY(-50%);
  font-size:20px;
  color:#fff;
  pointer-events:none;
}

.btn{
  width:100%;
  padding:14px;
  background:linear-gradient(135deg, #ff758c, #ff7eb3);
  color:#fff;
  border:none;
  border-radius:12px;
  cursor:pointer;
  transition:0.3s;
  font-size:16px;
  font-weight:600;
}

.btn:hover{
  background:linear-gradient(135deg, #ff7eb3, #ff758c);
  transform:translateY(-2px) scale(1.03);
  box-shadow:0 8px 15px rgba(0,0,0,0.3);
}

.message{
  margin-bottom:15px;
  font-size:14px;
  padding:8px;
  border-radius:8px;
}

.error{
  background:rgba(255,0,0,0.1);
  color:#ff4d4d;
}

.success{
  background:rgba(0,255,0,0.1);
  color:#4dff4d;
}

@keyframes fadeIn{
  from{opacity:0;transform:translateY(-20px);}
  to{opacity:1;transform:translateY(0);}
}

@media screen and (max-width:400px){
  .container{width:90%;padding:30px 20px;}
}
</style>
</head>
<body>
<div class="container">
  <h2>🔐 Verify OTP</h2>
  <div class="message error" style="display:none;">Invalid OTP!</div>
  <form method="POST">
      <div class="input-box">
          <i class='bx bx-key'></i>
          <input type="text" name="otp" placeholder="Enter OTP" required>
      </div>
      <button type="submit" class="btn">Verify OTP</button>
  </form>
</div>
</body>
</html>
