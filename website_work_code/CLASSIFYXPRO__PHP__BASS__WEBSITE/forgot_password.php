<?php
session_start();
require_once "db.php";
$conn = getDBConnection();

$error = "";
$success = "";

if($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);

    if(empty($email)){
        $error = "❌ Enter your registered email!";
    } else {
        // Check if user exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email=? LIMIT 1");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if($stmt->num_rows == 0){
            $error = "❌ Email not found!";
        } else {
            $stmt->bind_result($user_id);
            $stmt->fetch();
            $stmt->close();

            // Generate OTP
            $otp = rand(100000, 999999);
            $expiry = date("Y-m-d H:i:s", strtotime('+15 minutes'));

            // Save OTP in DB
            $stmt = $conn->prepare("UPDATE users SET otp=?, otp_expiry=? WHERE id=?");
            $stmt->bind_param("ssi", $otp, $expiry, $user_id);
            $stmt->execute();
            $stmt->close();

            // Send Email via PHPMailer
            require 'PHPMailer/src/PHPMailer.php';
            require 'PHPMailer/src/SMTP.php';
            require 'PHPMailer/src/Exception.php';

            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host       = "smtp.gmail.com";
                $mail->SMTPAuth   = true;
                $mail->Username   = "ficheksardar@gmail.com"; // apna Gmail
                $mail->Password   = "mxhs oflz kfth iqdc";   // Gmail App Password
                $mail->SMTPSecure = 'tls';
                $mail->Port       = 587;

                $mail->setFrom("ficheksardar@gmail.com","ClassifyXPro");
                $mail->addAddress($email);
                $mail->isHTML(true);
                $mail->Subject = "Your OTP for Password Reset";
                $mail->Body = "Your OTP is <b>$otp</b>. It expires in 15 minutes.";

                $mail->send();

                // ✅ Success: redirect to OTP verify page
                $_SESSION['reset_email'] = $email;
                header("Location: verify_otp.php");
                exit;

            } catch (Exception $e) {
                $error = "❌ Mail error: ".$mail->ErrorInfo;
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
<title>Forgot Password</title>
<link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box;font-family:'Poppins',sans-serif;}
body{background:linear-gradient(135deg,#c9d6ff,#e2e2e2);display:flex;justify-content:center;align-items:center;min-height:100vh;}
.container{background:#fff;padding:40px 30px;border-radius:20px;box-shadow:0 10px 25px rgba(0,0,0,0.2);width:350px;text-align:center;}
.container h2{margin-bottom:25px;color:#333;}
.input-box{position:relative;margin-bottom:25px;}
.input-box input{width:100%;padding:12px 45px 12px 20px;border-radius:8px;border:1px solid #ccc;outline:none;font-size:16px;transition:0.3s;}
.input-box input:focus{border-color:#7494ec;box-shadow:0 0 5px rgba(116,148,236,0.5);}
.input-box i{position:absolute;right:15px;top:50%;transform:translateY(-50%);color:#888;font-size:20px;}
.btn{width:100%;padding:12px;background:#7494ec;border:none;border-radius:8px;color:#fff;font-size:16px;font-weight:600;cursor:pointer;transition:0.3s;}
.btn:hover{background:#5b7ae7;transform:scale(1.03);}
.message{margin-bottom:15px;font-size:14px;color:red;}
.success{color:green;}
@media screen and (max-width:400px){.container{width:90%;padding:30px 20px;}}
</style>
</head>
<body>
<div class="container">
<h2>Forgot Password</h2>
<?php if($error) echo "<div class='message'>$error</div>"; ?>
<?php if($success) echo "<div class='message success'>$success</div>"; ?>
<form method="POST">
    <div class="input-box">
        <input type="email" name="email" placeholder="Enter your registered email" required>
        <i class='bx bx-envelope'></i>
    </div>
    <button type="submit" class="btn">Send OTP</button>
</form>
</div>
</body>
</html>
