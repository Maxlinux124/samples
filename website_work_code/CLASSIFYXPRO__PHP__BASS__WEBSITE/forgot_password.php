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
<link rel="stylesheet" href="assets/css/forgot-password.css">
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
