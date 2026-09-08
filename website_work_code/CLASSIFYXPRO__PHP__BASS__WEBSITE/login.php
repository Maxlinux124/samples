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
  <link rel="stylesheet" href="assets/css/login.css">
</head>
<body>
<?php include __DIR__ . '/app/Views/partials/auth/auth-shell.php'; ?>

  <!-- Toggle Script -->
  <script src="assets/js/login.js"></script>
</body>
</html>
