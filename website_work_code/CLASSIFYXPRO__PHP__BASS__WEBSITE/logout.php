
<?php
// Session start karo
session_start();

// Sabhi session variables clear karo
session_unset();

// Session destroy karo
session_destroy();

// Wapas login page ya homepage pe bhej do
header("Location: login.php");
exit();
?>
