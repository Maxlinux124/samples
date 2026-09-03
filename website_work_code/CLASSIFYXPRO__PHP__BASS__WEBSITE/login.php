<?php
session_start();
require_once "db.php";  // ✅ db.php include

$conn = getDBConnection(); // ✅ function call karke connection lo

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = mysqli_real_escape_string($conn, $_POST["username"]);
    $password = $_POST["password"];

    // ✅ Prepared Statement for security
    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username=? LIMIT 1");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();

        if (password_verify($password, $row["password"])) {
            $_SESSION["user_id"] = $row["id"];          
            $_SESSION["username"] = $row["username"];

            // ✅ Redirect with optional redirect param
            $redirect = $_GET['redirect'] ?? 'index.php';
            header("Location: $redirect");
            exit();
        } else {
            echo "❌ Invalid password!";
        }
    } else {
        echo "❌ User not found!";
    }

    $stmt->close();
}
?>






<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Clsfy Login Page</title>
  <script src="darkmode.js" defer></script>


  <!-- Boxicons CDN for Icons -->
  <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />

  <!-- Google Font -->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Poppins', sans-serif;
    }

    body {
      background: linear-gradient(90deg, #e2e2e2, #c9d6ff);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .container {
      position: relative;
      width: 850px;
      height: 550px;
      background: #fff;
      border-radius: 30px;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
      margin: 20px;
      overflow: hidden;
    }

    .form-box {
      position: absolute;
      right: 0;
      width: 50%;
      height: 100%;
      background: #fff;
      display: flex;
      align-items: center;
      color: #333;
      text-align: center;
      padding: 40px;
      z-index: 1;
      transition: 0.6s ease-in-out 1.2s, visibility 0s 1s;
    }

    .container.active .form-box {
      right: 50%;
    }

    .form-box.register {
      visibility: hidden;
    }

    .container.active .form-box.register {
      visibility: visible;
    }

    form {
      width: 100%;
    }

    .container h1 {
      font-size: 36px;
      margin: -10px 0;
    }

    .input-box {
      position: relative;
      margin: 30px 0;
    }

    .input-box input {
      width: 100%;
      padding: 13px 50px 13px 20px;
      background: #eee;
      border-radius: 8px;
      border: none;
      outline: none;
      font-size: 16px;
      color: #333;
      font-weight: 500;
    }

    .input-box input::placeholder {
      color: #888;
      font-weight: 400;
    }

    .input-box i {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 20px;
      color: #888;
    }

    .forgot-link {
      margin: -15px 0 15px;
    }

    .forgot-link a {
      font-size: 14.5px;
      color: #333;
      text-decoration: none;
    }

    .btn {
      width: 100%;
      height: 48px;
      background: #7494ec;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 16px;
      color: #fff;
      font-weight: 600;
      transition: 0.3s ease;
    }

    .btn:hover {
      transform: scale(1.03);
      background: #5b7ae7;
    }

    .container p {
      font-size: 14px;
      margin: 15px 0;
    }

    .social-icons {
      display: flex;
      justify-content: center;
    }

    .social-icons a {
      display: inline-flex;
      padding: 10px;
      border: 2px solid #ccc;
      font-size: 24px;
      color: #333;
      text-decoration: none;
      margin: 0 8px;
      border-radius: 50%;
      transition: 0.3s ease;
    }

    .social-icons a:hover {
      background: #f0f0f0;
    }

    .toggle-box {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .toggle-box::before {
      content: '';
      position: absolute;
      left: -250%;
      width: 300%;
      height: 100%;
      border-radius: 150px;
      background: #7494ec;
      z-index: 2;
      transition: 1.8s ease-in-out;
    }

    .container.active .toggle-box::before {
      left: 50%;
    }

    .toggle-panel {
      position: absolute;
      width: 50%;
      height: 100%;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 2;
      transition: 0.6s ease-in-out;
    }

    .toggle-left {
      left: 0;
      transition-delay: 1.2s;
    }

    .toggle-right {
      right: -50%;
      transition-delay: 0.6s;
    }

    .container.active .toggle-panel.toggle-left {
      left: -50%;
      transition-delay: 0.6s;
    }

    .container.active .toggle-panel.toggle-right {
      right: 0;
      transition-delay: 1.2s;
    }

    .toggle-panel p {
      margin-bottom: 20px;
    }

    .toggle-panel .btn {
      width: 160px;
      height: 46px;
      background: transparent;
      border: 2px solid #fff;
      box-shadow: none;
    }

  @media screen and (max-width: 650px) {
  .container {
    height: calc(100vh - 40px); /* ✅ "cals" ki jagah "calc" hoga */
  }

  .form-box {
    bottom: 0;
    width: 100%;
    height: 70%;
  }

  .container.active .form-box {
    right: 0;
    bottom: 30%;   /* ✅ right:0 ki zarurat nahi thi */
  }

  /* 🔵 Toggle background circle effect */
  .toggle-box::before {
    top: -270%;
    left: 0;       /* ✅ -0% ki jagah 0 rakha */
    width: 100%;
    height: 300%;
    border-radius:20vw;
  }

  .container.active .toggle-box::before { /* ✅ yaha "contaainer" spelling mistake thi */
    left: 0;
    top: 70%;
  }

  /* Toggle panels (upar aur niche me) */
  .toggle-panel {
    width: 100%;
    height: 30%;
  }

  /* Left toggle (Hello, Welcome!) */
  .toggle-panel.toggle-left {
    top: 0;
  }
  
  /* Active hone par transition */
  .container.active .toggle-panel.toggle-left {
    top: -30%;  /* ✅ left:0 ki zarurat nahi thi */
  }

  /* Right toggle (Welcome Back!) */
  .toggle-panel.toggle-right {
    bottom: -30%;  /* ✅ right:0 hata diya, zaruri nahi tha */
  }  

  .container.active .toggle-panel.toggle-right {
    bottom: 0;
  }
}







  </style>
</head>
<body>
  <div class="container">
    
    <!-- Login Form -->
    <div class="form-box">
      <form action="login.php" method="POST">
        <h1>Login</h1>
        <div class="input-box">
          <input type="text" name="username" placeholder="Username" required />
          <i class='bx bxs-user'></i>
        </div>
        <div class="input-box">
          <input type="password" name="password" placeholder="Password" required />
          <i class='bx bxs-lock-alt'></i>
        </div>
        <div class="forgot-link">
          <a href="forgot_password.php">Forgot password?</a>
        </div>
        <button type="submit" class="btn">Login</button>
        <p>Login with social platform</p>
        <div class="social-icons">
          <a href="#"><i class='bx bxl-google'></i></a>
          <a href="#"><i class='bx bxl-facebook-circle'></i></a>
          <a href="#"><i class='bx bxl-linkedin'></i></a>
          <a href="#"><i class='bx bxl-github'></i></a>
        </div>
      </form>
    </div>

    <!-- Register Form -->
    <div class="form-box register">
      <form  action="register.php" method="POST">
        <h1>Registration</h1>
        <div class="input-box">
          <input type="text" name="username" placeholder="Username" required />
          <i class='bx bxs-user'></i>
        </div>
        <div class="input-box">
          <input type="email" name="email" placeholder="Email" required />
          <i class='bx bx-envelope'></i>
        </div>
        <div class="input-box">
          <input type="password" name="password" placeholder="Password" required />
          <i class='bx bxs-lock-alt'></i>
        </div>
        <button type="submit" class="btn">Register</button>
        <p>Register with social platform</p>
        <div class="social-icons">
          <a href="#"><i class='bx bxl-google'></i></a>
          <a href="#"><i class='bx bxl-facebook-circle'></i></a>
          <a href="#"><i class='bx bxl-linkedin'></i></a>
          <a href="#"><i class='bx bxl-github'></i></a>
        </div>
      </form>
    </div>

    <!-- Toggle Panels -->
    <div class="toggle-box">
      <div class="toggle-panel toggle-left">
        <h1>Hello, Welcome!</h1>
        <p>Don't have an account?</p>
        <button class="btn register-btn">Register</button>
      </div>
      <div class="toggle-panel toggle-right">
        <h1>Welcome Back!</h1>
        <p>Already have an account?</p>
        <button class="btn login-btn">Login</button>
      </div>
    </div>
  </div>

  <!-- Toggle Script -->
  <script>
    const container = document.querySelector('.container');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');

    registerBtn.addEventListener('click', () => {
      container.classList.add('active');
    });

    loginBtn.addEventListener('click', () => {
      container.classList.remove('active');
    });
  </script>
</body>
</html>
