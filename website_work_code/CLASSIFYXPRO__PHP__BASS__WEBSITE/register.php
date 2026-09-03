<?php
session_start();
require_once "db.php";   // ✅ db.php include

$conn = getDBConnection(); // ✅ connection lo

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST["username"]);
    $email    = trim($_POST["email"]);
    $password = $_POST["password"];

    // ✅ Validate empty fields
    if (empty($username) || empty($email) || empty($password)) {
        echo "❌ All fields are required!";
        exit();
    }

    // ✅ Check if user exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE username=? OR email=? LIMIT 1");
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        echo "❌ Username or Email already exists!";
        exit();
    }
    $stmt->close();

    // ✅ Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // ✅ Insert user
    $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $hashedPassword);

    if ($stmt->execute()) {
        echo "✅ Registration successful! <a href='login.php'>Login Here</a>";
    } else {
        echo "❌ Error: " . $stmt->error;
    }

    $stmt->close();
}
?>


