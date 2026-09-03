<?php
// profile.php - Single-file public + owner-editable profile (include db.php for DB connection)
// Requirements:
//  - Place this file alongside your existing db.php which must provide getDBConnection() OR a mysqli $conn variable.
//  - 'uploads/' must be writable (script will try to create it).
//  - PHP sessions + GD extension enabled.
//  - tables: users, profiles, ads (profiles include website, facebook, instagram, twitter, linkedin columns).
//
// Usage:
//  - Public profile: /profile.php?user=username
//  - Logged-in user profile (edit): /profile.php  (must be logged in, session contains user_id and username)
//
// Note: This file expects db.php to define a function getDBConnection() that returns mysqli connection
//       OR to define $conn variable directly. If your db.php provides a function with a different name,
//       adjust the include accordingly.

session_start();

// ---------------- CONFIG ----------------
$uploadsDir = __DIR__ . '/uploads/';
$uploadsUrlPath = 'uploads/';

$maxFileSize = 2 * 1024 * 1024; // 2 MB
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

$profileMaxW = 400; $profileMaxH = 400;
$coverMaxW = 1400; $coverMaxH = 450;

$adsPerPage = 8;

// create uploads folder if missing
if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0755, true);
}

// include DB connection (user requested db.php include)
if (file_exists(__DIR__ . '/db.php')) {
    include_once __DIR__ . '/db.php';
    // accept either $conn or getDBConnection()
    if (!isset($conn) && function_exists('getDBConnection')) {
        $conn = getDBConnection();
    }
} else {
    die("Missing db.php. Please add your DB connection file named db.php in the same directory.");
}

if (!($conn instanceof mysqli)) {
    die("Database connection not found or invalid. Make sure db.php provides \$conn (mysqli) or getDBConnection() returns mysqli.");
}
$conn->set_charset('utf8mb4');

// ---------- HELPERS ----------
function h($s){ return htmlspecialchars($s ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

function generate_csrf() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(24));
    }
    return $_SESSION['csrf_token'];
}
function verify_csrf($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function is_valid_phone($p) {
    return preg_match('/^[0-9+\-\s\(\)]{7,20}$/', $p);
}
function is_valid_url_or_empty($url) {
    if (trim($url) === '') return true;
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

function detect_mime($tmpPath) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $tmpPath);
    finfo_close($finfo);
    return $mime;
}

function resize_image_gd($srcPath, $destPath, $maxW, $maxH, $quality = 85) {
    if (!file_exists($srcPath)) return false;
    $info = getimagesize($srcPath);
    if ($info === false) return false;
    [$width, $height, $type] = $info;
    $ratio = min($maxW / $width, $maxH / $height, 1);
    $newW = (int)round($width * $ratio);
    $newH = (int)round($height * $ratio);

    $dst = imagecreatetruecolor($newW, $newH);

    if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_WEBP || $type == IMAGETYPE_GIF) {
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
        imagefilledrectangle($dst, 0, 0, $newW, $newH, $transparent);
    }

    switch ($type) {
        case IMAGETYPE_JPEG:
            $srcImg = imagecreatefromjpeg($srcPath);
            break;
        case IMAGETYPE_PNG:
            $srcImg = imagecreatefrompng($srcPath);
            break;
        case IMAGETYPE_GIF:
            $srcImg = imagecreatefromgif($srcPath);
            break;
        case IMAGETYPE_WEBP:
            if (function_exists('imagecreatefromwebp')) {
                $srcImg = imagecreatefromwebp($srcPath);
            } else {
                return false;
            }
            break;
        default:
            return false;
    }

    imagecopyresampled($dst, $srcImg, 0,0,0,0, $newW, $newH, $width, $height);

    $saved = false;
    switch ($type) {
        case IMAGETYPE_JPEG:
            $saved = imagejpeg($dst, $destPath, $quality);
            break;
        case IMAGETYPE_PNG:
            $pngQuality = (int) round((100 - $quality) / 10);
            $saved = imagepng($dst, $destPath, $pngQuality);
            break;
        case IMAGETYPE_GIF:
            $saved = imagegif($dst, $destPath);
            break;
        case IMAGETYPE_WEBP:
            $saved = imagewebp($dst, $destPath, $quality);
            break;
    }

    imagedestroy($dst);
    imagedestroy($srcImg);
    return $saved;
}

function try_upload_image($fileKey, $uploadsDir, $allowedMimes, $maxFileSize, $resizeW, $resizeH) {
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== 0) return null;
    $f = $_FILES[$fileKey];
    if ($f['size'] > $maxFileSize) return ['error' => 'File too large (max ' . ($maxFileSize/1024/1024) . 'MB).'];
    $mime = detect_mime($f['tmp_name']);
    if (!in_array($mime, $allowedMimes)) return ['error' => 'Invalid file type.'];
    $extMap = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','image/gif'=>'gif'];
    $ext = $extMap[$mime] ?? pathinfo($f['name'], PATHINFO_EXTENSION);
    $fname = time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
    $tmpPath = $f['tmp_name'];
    $dest = $uploadsDir . $fname;
    if (!move_uploaded_file($tmpPath, $dest . '.tmp')) {
        if (!move_uploaded_file($tmpPath, $dest)) {
            return ['error' => 'Failed to move uploaded file.'];
        } else {
            return ['file' => basename($dest)];
        }
    } else {
        $movedTmp = $dest . '.tmp';
        $resized = resize_image_gd($movedTmp, $dest, $resizeW, $resizeH, 85);
        @unlink($movedTmp);
        if ($resized) return ['file' => basename($dest)];
        if (file_exists($movedTmp) && rename($movedTmp, $dest)) return ['file' => basename($dest)];
        return ['error' => 'Failed to process image.'];
    }
}

// ---------------- DETERMINE CONTEXT ----------------
// If ?user=username present => public view allowed (no login required).
// If no ?user => require login and show/edit current user's profile.
$viewUsername = isset($_GET['user']) ? trim($_GET['user']) : null;
$requireLogin = $viewUsername === null;

// If login required but not logged in -> redirect to login
if ($requireLogin && (!isset($_SESSION['user_id'], $_SESSION['username']))) {
    header("Location: login.php");
    exit();
}

// viewer identity
$viewer_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : null;
$viewer_username = isset($_SESSION['username']) ? $_SESSION['username'] : null;

// fetch the profile user (by username or by session user_id)
if ($viewUsername !== null) {
    // sanitize username simple (DB prepared will secure)
    $sqlFetch = "SELECT u.id AS uid, u.username, u.email, u.created_at AS user_created_at,
                        p.full_name, p.phone, p.address, p.bio, p.profile_pic, p.cover_pic,
                        p.website, p.facebook, p.instagram, p.twitter, p.linkedin
                 FROM users u
                 LEFT JOIN profiles p ON u.id = p.user_id
                 WHERE u.username = ? LIMIT 1";
    $stmt = $conn->prepare($sqlFetch);
    $stmt->bind_param("s", $viewUsername);
} else {
    $sqlFetch = "SELECT u.id AS uid, u.username, u.email, u.created_at AS user_created_at,
                        p.full_name, p.phone, p.address, p.bio, p.profile_pic, p.cover_pic,
                        p.website, p.facebook, p.instagram, p.twitter, p.linkedin
                 FROM users u
                 LEFT JOIN profiles p ON u.id = p.user_id
                 WHERE u.id = ? LIMIT 1";
    $stmt = $conn->prepare($sqlFetch);
    $stmt->bind_param("i", $viewer_id);
}
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user) {
    // if no user found show 404-ish message
    http_response_code(404);
    echo "<!doctype html><html><head><meta charset='utf-8'><title>Profile not found</title></head><body style='font-family:Inter,Arial,sans-serif;padding:30px'><h2>Profile not found</h2><p>Requested profile does not exist.</p></body></html>";
    exit();
}

// is the viewer the owner?
$is_owner = ($viewer_id && intval($user['uid']) === $viewer_id);

// initialize defaults
$user = array_merge([
    'full_name'=>'',
    'phone'=>'',
    'address'=>'',
    'bio'=>'',
    'profile_pic'=>null,
    'cover_pic'=>null,
    'website'=>'',
    'facebook'=>'',
    'instagram'=>'',
    'twitter'=>'',
    'linkedin'=>''
], $user);

// ---------------- HANDLE PROFILE UPDATE (owners only) ----------------
$action = $_GET['action'] ?? '';
$messages = ['success'=>[], 'errors'=>[]];

if ($action === 'edit' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$is_owner) {
        $messages['errors'][] = "Access denied: you are not the profile owner.";
    } else {
        $posted_csrf = $_POST['csrf_token'] ?? '';
        if (!verify_csrf($posted_csrf)) {
            $messages['errors'][] = "Invalid CSRF token. Try reloading the page.";
        } else {
            $full_name = trim($_POST['full_name'] ?? '');
            $phone     = trim($_POST['phone'] ?? '');
            $address   = trim($_POST['address'] ?? '');
            $bio       = trim($_POST['bio'] ?? '');
            $website   = trim($_POST['website'] ?? '');
            $facebook  = trim($_POST['facebook'] ?? '');
            $instagram = trim($_POST['instagram'] ?? '');
            $twitter   = trim($_POST['twitter'] ?? '');
            $linkedin  = trim($_POST['linkedin'] ?? '');

            if ($phone !== '' && !is_valid_phone($phone)) {
                $messages['errors'][] = "Phone number looks invalid.";
            }
            if (!is_valid_url_or_empty($website) || !is_valid_url_or_empty($facebook) || !is_valid_url_or_empty($instagram) || !is_valid_url_or_empty($twitter) || !is_valid_url_or_empty($linkedin)) {
                $messages['errors'][] = "One of the URLs looks invalid. Please include full URL (https://...).";
            }

            $newProfilePic = null;
            $newCoverPic = null;

            if (isset($_FILES['profile_pic']) && $_FILES['profile_pic']['error'] !== 4) {
                $res = try_upload_image('profile_pic', $uploadsDir, $allowedMimes, $maxFileSize, $profileMaxW, $profileMaxH);
                if (!empty($res['error'])) {
                    $messages['errors'][] = "Profile picture: " . $res['error'];
                } elseif (!empty($res['file'])) {
                    $newProfilePic = $res['file'];
                }
            }
            if (isset($_FILES['cover_pic']) && $_FILES['cover_pic']['error'] !== 4) {
                $res = try_upload_image('cover_pic', $uploadsDir, $allowedMimes, $maxFileSize, $coverMaxW, $coverMaxH);
                if (!empty($res['error'])) {
                    $messages['errors'][] = "Cover picture: " . $res['error'];
                } elseif (!empty($res['file'])) {
                    $newCoverPic = $res['file'];
                }
            }

            if (empty($messages['errors'])) {
                $check = $conn->prepare("SELECT id, profile_pic, cover_pic FROM profiles WHERE user_id = ? LIMIT 1");
                $uid = intval($user['uid']);
                $check->bind_param("i", $uid);
                $check->execute();
                $existing = $check->get_result()->fetch_assoc();
                $exists = !empty($existing);
                $check->close();

                $storeProfilePic = $existing['profile_pic'] ?? $user['profile_pic'] ?? null;
                $storeCoverPic = $existing['cover_pic'] ?? $user['cover_pic'] ?? null;

                if ($newProfilePic) {
                    if (!empty($storeProfilePic) && file_exists($uploadsDir . $storeProfilePic)) {
                        @unlink($uploadsDir . $storeProfilePic);
                    }
                    $storeProfilePic = $newProfilePic;
                }
                if ($newCoverPic) {
                    if (!empty($storeCoverPic) && file_exists($uploadsDir . $storeCoverPic)) {
                        @unlink($uploadsDir . $storeCoverPic);
                    }
                    $storeCoverPic = $newCoverPic;
                }

                if ($exists) {
                    $upd = $conn->prepare("UPDATE profiles SET full_name=?, phone=?, address=?, bio=?, profile_pic=?, cover_pic=?, website=?, facebook=?, instagram=?, twitter=?, linkedin=?, updated_at=NOW() WHERE user_id=?");
                    $upd->bind_param("sssssssssssi", $full_name, $phone, $address, $bio, $storeProfilePic, $storeCoverPic, $website, $facebook, $instagram, $twitter, $linkedin, $uid);
                    $ok = $upd->execute();
                    $upd->close();
                } else {
                    $ins = $conn->prepare("INSERT INTO profiles (user_id, full_name, phone, address, bio, profile_pic, cover_pic, website, facebook, instagram, twitter, linkedin, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())");
                    $ins->bind_param("isssssssssss", $uid, $full_name, $phone, $address, $bio, $storeProfilePic, $storeCoverPic, $website, $facebook, $instagram, $twitter, $linkedin);
                    $ok = $ins->execute();
                    $ins->close();
                }

                if ($ok) {
                    $messages['success'][] = "Profile updated successfully.";
                    // refresh user data
                    if ($viewUsername !== null) {
                        $stmt = $conn->prepare($sqlFetch);
                        $stmt->bind_param("s", $viewUsername);
                    } else {
                        $stmt = $conn->prepare($sqlFetch);
                        $stmt->bind_param("i", $viewer_id);
                    }
                    $stmt->execute();
                    $user = $stmt->get_result()->fetch_assoc();
                    $stmt->close();
                    $_SESSION['csrf_token'] = bin2hex(random_bytes(24));
                } else {
                    $messages['errors'][] = "Failed to save profile. Try again.";
                }
            }
        }
    }
}

// ---------------- ADS PAGINATION (display user's ads) ----------------
$page = max(1, intval($_GET['page'] ?? 1));
$offset = ($page - 1) * $adsPerPage;

// Ads belong to the displayed user (uid)
$display_user_id = intval($user['uid']);
$adsStmt = $conn->prepare("SELECT id, title, description, image, created_at FROM ads WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?");
$adsStmt->bind_param("iii", $display_user_id, $adsPerPage, $offset);
$adsStmt->execute();
$adsRes = $adsStmt->get_result();
$ads = $adsRes->fetch_all(MYSQLI_ASSOC);
$adsStmt->close();

$countStmt = $conn->prepare("SELECT COUNT(*) AS cnt FROM ads WHERE user_id = ?");
$countStmt->bind_param("i", $display_user_id);
$countStmt->execute();
$totalAds = $countStmt->get_result()->fetch_assoc()['cnt'] ?? 0;
$countStmt->close();
$totalPages = max(1, (int)ceil($totalAds / $adsPerPage));

// CSRF token for form
$csrf_token = generate_csrf();

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title><?php echo h($user['full_name'] ?: $user['username']); ?> — Profile</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#f3f4f6;
  --card:#fff;
  --accent:#1877f2;
  --muted:#6b7280;
  --success:#16a34a;
  --danger:#ef4444;
  --radius:14px;
  --glass: rgba(255,255,255,0.7);
}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;background:var(--bg);color:#0f172a;line-height:1.4}

/* COVER */
.cover {
  width:100%; height:240px; position:relative; overflow:hidden; background:linear-gradient(90deg,#cfe2ff,#eef2ff);
}
.cover img{width:100%;height:100%;object-fit:cover; display:block; transition:transform .8s cubic-bezier(.2,.8,.2,1)}
.cover .edit-cover {
  position:absolute; top:14px; right:18px; background:rgba(0,0,0,0.6); color:#fff;
  padding:8px 12px; border-radius:10px; text-decoration:none; font-weight:700; font-size:13px;
  box-shadow: 0 6px 18px rgba(2,6,23,0.2);
}
.cover:hover img{ transform:scale(1.03) }

/* Wrapper */
.container{max-width:980px;margin:0 auto;padding:0 16px}
.profile-card {
  background:var(--card); border-radius:var(--radius); padding:22px; margin-top:-70px;
  box-shadow:0 10px 30px rgba(2,6,23,0.08); position:relative; overflow:visible;
  display:flex; gap:18px; align-items:flex-start;
}
.profile-pic {
  width:130px;height:130px;border-radius:50%;border:6px solid var(--card);overflow:hidden;
  box-shadow:0 8px 24px rgba(2,6,23,0.12);
  flex:0 0 130px; background:linear-gradient(180deg,#fff,#f8fafc);
}
.profile-pic img{width:100%;height:100%;object-fit:cover;display:block}
.profile-info{flex:1}
.profile-info h1{margin:0;font-size:20px}
.meta{color:var(--muted);margin-top:8px;font-size:14px}
.actions{display:flex;gap:12px;margin-top:14px;flex-wrap:wrap}

/* Outline buttons that animate */
.btn {
  display:inline-flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;
  border:2px solid var(--accent); color:var(--accent); text-decoration:none; font-weight:700;
  background:transparent; cursor:pointer; transition:all .18s cubic-bezier(.2,.8,.2,1);
}
.btn:hover{ transform:translateY(-4px); box-shadow:0 8px 20px rgba(24,119,242,0.14); color:#fff; background:var(--accent) }
.btn.secondary { border-color:#e6e9ef; color:#111; background:#fff }
.btn.ghost { border-color:transparent; color:var(--accent) }
.btn:active{ transform:translateY(-1px) }

/* Social icons */
.social-row{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}
.social-row a{display:inline-flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;border:1px solid #eef2ff;text-decoration:none;color:#0f172a;font-weight:600;font-size:13px;background:#fff}
.social-row svg{width:18px;height:18px;flex:0 0 18px}

/* bio */
.bio{margin-top:12px;color:#0b1724;padding-top:6px}

/* Ads */
.ads-area{margin-top:20px}
.ads-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.ad-card{background:var(--card);border-radius:12px;padding:12px;box-shadow:0 8px 24px rgba(2,6,23,0.04);transition:transform .15s ease}
.ad-card:hover{transform:translateY(-6px)}
.ad-card img{width:100%;height:140px;object-fit:cover;border-radius:8px}
.ad-title{font-weight:700;margin:8px 0 4px}
.ad-desc{color:var(--muted);font-size:14px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}

/* Pagination */
.pagination{display:flex;gap:8px;align-items:center;margin-top:14px}
.page-btn{padding:8px 12px;border-radius:10px;border:1px solid #e6e9ef;background:#fff;cursor:pointer}
.page-btn.active{background:var(--accent);color:#fff;border-color:var(--accent)}

/* Modal bottom slide-up with blur backdrop */
.modal-backdrop {
  position:fixed;inset:0;display:none;align-items:flex-end;justify-content:center;z-index:1200;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.modal-backdrop.show{display:flex}
.modal-sheet {
  width:100%;max-width:980px;background:var(--card);border-radius:16px 16px 0 0;padding:18px;box-shadow:0 -20px 60px rgba(2,6,23,0.18);
  transform:translateY(100%);transition:transform .35s cubic-bezier(.2,.9,.3,1);
}
.modal-backdrop.show .modal-sheet{ transform:translateY(0) }

/* Toast */
.toast { position:fixed; right:18px; bottom:20px; z-index:1400; min-width:260px; border-radius:12px; padding:12px 14px; display:none; box-shadow:0 8px 30px rgba(2,6,23,0.18); color:#fff; font-weight:700 }
.toast.show{ display:block; animation:fadeSlide .5s ease }
.toast.success{ background:var(--success) }
.toast.error{ background:var(--danger) }
@keyframes fadeSlide { from {opacity:0; transform:translateY(6px)} to {opacity:1; transform:none} }

/* responsive */
@media (max-width:800px){
  .profile-card{flex-direction:column;align-items:center;text-align:center}
  .profile-pic{margin-top:-60px}
  .profile-info{width:100%}
  .actions{justify-content:center}
  .modal-sheet{border-radius:12px}
}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <?php if (!empty($user['cover_pic']) && file_exists($uploadsDir . $user['cover_pic'])): ?>
    <img src="<?php echo h($uploadsUrlPath . $user['cover_pic']); ?>" alt="Cover image" loading="lazy">
  <?php else: ?>
    <img src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1600&auto=format&fit=crop" alt="cover placeholder" loading="lazy">
  <?php endif; ?>

  <?php if ($is_owner): ?>
    <button class="edit-cover btn" id="openModalBtn">Edit Profile</button>
  <?php endif; ?>
</div>

<!-- MAIN -->
<div class="container">
  <div class="profile-card" role="region" aria-label="Profile card">
    <div class="profile-pic" aria-hidden="true">
      <?php if (!empty($user['profile_pic']) && file_exists($uploadsDir . $user['profile_pic'])): ?>
        <img src="<?php echo h($uploadsUrlPath . $user['profile_pic']); ?>" alt="Profile picture" loading="lazy">
      <?php else: ?>
        <img src="https://via.placeholder.com/400x400?text=Profile" alt="Default profile" loading="lazy">
      <?php endif; ?>
    </div>

    <div class="profile-info">
      <h1><?php echo h($user['full_name'] ?: $user['username']); ?></h1>
      <div class="meta">
        <div><strong>Username:</strong> <?php echo h($user['username']); ?></div>
        <?php if ($is_owner): ?>
          <div><strong>Email:</strong> <?php echo h($user['email']); ?></div>
        <?php endif; ?>
        <div><strong>Phone:</strong> <?php echo h($user['phone'] ?: 'Not set'); ?></div>
        <div><strong>Address:</strong> <?php echo h($user['address'] ?: 'Not set'); ?></div>
        <div><strong>Joined:</strong> <?php echo h(date('d M Y', strtotime($user['user_created_at'] ?? date('Y-m-d')))); ?></div>
      </div>

      <div class="actions">
        <a class="btn" href="index.php">🏠 Home</a>

        <?php if ($is_owner): ?>
          <button class="btn" id="openModalBtn2">✏️ Edit Profile</button>
        <?php endif; ?>

        <button class="btn secondary" onclick="copyProfileLink()">🔗 Share</button>
      </div>

      <div class="social-row">
        <?php if (!empty($user['website'])): ?>
          <a href="<?php echo h($user['website']); ?>" target="_blank" rel="noopener">🔗 Website</a>
        <?php endif; ?>
        <?php if (!empty($user['facebook'])): ?>
          <a href="<?php echo h($user['facebook']); ?>" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12A10 10 0 1 0 2 12a10 10 0 0 0 20 0zM14 12h-2v8h-3v-8H7V9h2V7.5C9 5 10 4 12.5 4H15v3h-1.5c-.7 0-1 .3-1 1V9H15l-1 3z"/></svg> Facebook
          </a>
        <?php endif; ?>
        <?php if (!empty($user['instagram'])): ?>
          <a href="<?php echo h($user['instagram']); ?>" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.5A4.5 4.5 0 1 0 16.5 13 4.5 4.5 0 0 0 12 8.5zM18 7.2a1.08 1.08 0 1 1 1.08-1.08A1.08 1.08 0 0 1 18 7.2z"/></svg> Instagram
          </a>
        <?php endif; ?>
        <?php if (!empty($user['twitter'])): ?>
          <a href="<?php echo h($user['twitter']); ?>" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 5.9c-.6.3-1.2.5-1.9.6a3.3 3.3 0 0 0-5.6 3v.3A9.3 9.3 0 0 1 3 5.2a3.3 3.3 0 0 0 1 4.4c-.5 0-1-.2-1.5-.4 0 1.6 1 3 2.5 3.3-.5.1-1 .1-1.5 0 .5 1.6 2 2.8 3.7 2.9A6.6 6.6 0 0 1 2 17.6 9.4 9.4 0 0 0 7.8 19c6 0 9.3-5 9.3-9.3v-.4c.6-.4 1-1 1.3-1.7-.6.3-1.3.5-2 .6z"/></svg> Twitter
          </a>
        <?php endif; ?>
        <?php if (!empty($user['linkedin'])): ?>
          <a href="<?php echo h($user['linkedin']); ?>" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 .02 0zM3 8.5h4v12H3zM9 8.5h3.8v1.7h.1c.5-.9 1.7-1.7 3.4-1.7 3.6 0 4.3 2.3 4.3 5.3v6.7h-4v-5.9c0-1.4 0-3.2-2-3.2-2 0-2.3 1.6-2.3 3.1v6z"/></svg> LinkedIn
          </a>
        <?php endif; ?>
      </div>

      <div class="bio">
        <?php echo nl2br(h($user['bio'] ?: 'No bio added yet.')); ?>
      </div>
    </div>
  </div>

  <!-- ADS -->
  <div class="ads-area">
    <h3 style="margin:14px 6px 8px 6px;font-size:18px;"><?php echo $is_owner ? 'Your Posts' : 'Posts by ' . h($user['username']); ?></h3>

    <?php if (!empty($ads)): ?>
      <div class="ads-grid">
        <?php foreach ($ads as $ad): ?>
          <div class="ad-card">
            <?php if (!empty($ad['image']) && file_exists($uploadsDir . $ad['image'])): ?>
              <img src="<?php echo h($uploadsUrlPath . $ad['image']); ?>" alt="<?php echo h($ad['title']); ?>" loading="lazy">
            <?php else: ?>
              <img src="https://via.placeholder.com/600x400?text=No+Image" alt="No image" loading="lazy">
            <?php endif; ?>
            <div class="ad-title"><?php echo h($ad['title']); ?></div>
            <div class="ad-desc"><?php echo h(mb_substr($ad['description'],0,180)); ?></div>
            <div style="margin-top:8px;">
              <a class="btn secondary" href="view-ads.php?id=<?php echo intval($ad['id']); ?>">View Details</a>
            </div>
          </div>
        <?php endforeach; ?>
      </div>

      <!-- pagination -->
      <div class="pagination" aria-label="Pagination">
        <?php if ($page > 1): ?>
          <a class="page-btn" href="?<?php echo $viewUsername ? 'user='.urlencode($viewUsername).'&' : ''; ?>page=<?php echo $page-1 ?>">← Prev</a>
        <?php endif; ?>
        <?php
        $start = max(1, $page - 2);
        $end = min($totalPages, $start + 4);
        for ($p = $start; $p <= $end; $p++): ?>
          <a class="page-btn <?php if ($p==$page) echo 'active'; ?>" href="?<?php echo $viewUsername ? 'user='.urlencode($viewUsername).'&' : ''; ?>page=<?php echo $p ?>"><?php echo $p ?></a>
        <?php endfor; ?>
        <?php if ($page < $totalPages): ?>
          <a class="page-btn" href="?<?php echo $viewUsername ? 'user='.urlencode($viewUsername).'&' : ''; ?>page=<?php echo $page+1 ?>">Next →</a>
        <?php endif; ?>
      </div>

    <?php else: ?>
      <div style="padding:16px;background:#fff;border-radius:12px;box-shadow:0 6px 18px rgba(16,24,40,0.04)"><?php echo $is_owner ? 'No ads posted yet.' : 'No posts yet.'; ?></div>
    <?php endif; ?>
  </div>
</div>

<!-- Modal backdrop (owners only) -->
<?php if ($is_owner): ?>
<div class="modal-backdrop" id="modalBackdrop" aria-hidden="true">
  <div class="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="editProfileTitle">
    <h2 id="editProfileTitle" style="margin:0 0 10px;font-size:20px">✏️ Edit Profile</h2>

    <!-- messages -->
    <?php if (!empty($messages['errors'])): ?>
      <div style="background:#fff4f4;border:1px solid #fecaca;padding:10px;border-radius:10px;margin-bottom:12px;color:#991b1b">
        <?php foreach ($messages['errors'] as $e) echo h($e) . "<br>"; ?>
      </div>
    <?php endif; ?>
    <?php if (!empty($messages['success'])): ?>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:10px;border-radius:10px;margin-bottom:12px;color:#065f46">
        <?php foreach ($messages['success'] as $s) echo h($s) . "<br>"; ?>
      </div>
    <?php endif; ?>

    <form method="post" enctype="multipart/form-data" action="profile.php?action=edit" style="display:flex;flex-direction:column;gap:12px">
      <input type="hidden" name="csrf_token" value="<?php echo h($csrf_token); ?>">

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:700">Full name</label>
          <input name="full_name" value="<?php echo h($user['full_name']); ?>" style="width:100%;padding:10px;border-radius:10px;border:1px solid #e6eef9">
        </div>
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:700">Phone</label>
          <input name="phone" value="<?php echo h($user['phone']); ?>" style="width:100%;padding:10px;border-radius:10px;border:1px solid #e6eef9">
        </div>
      </div>

      <div>
        <label style="display:block;margin-bottom:6px;font-weight:700">Address</label>
        <input name="address" value="<?php echo h($user['address']); ?>" style="width:100%;padding:10px;border-radius:10px;border:1px solid #e6eef9">
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:700">Website</label>
          <input name="website" value="<?php echo h($user['website']); ?>" placeholder="https://yourwebsite.com" style="width:100%;padding:10px;border-radius:10px;border:1px solid #e6eef9">
        </div>
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:700">LinkedIn</label>
          <input name="linkedin" value="<?php echo h($user['linkedin']); ?>" placeholder="https://linkedin.com/in/..." style="width:100%;padding:10px;border-radius:10px;border:1px solid #e6eef9">
        </div>
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:700">Facebook</label>
          <input name="facebook" value="<?php echo h($user['facebook']); ?>" placeholder="https://facebook.com/..." style="width:100%;padding:10px;border-radius:10px;border:1px solid #e6eef9">
        </div>
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:700">Instagram</label>
          <input name="instagram" value="<?php echo h($user['instagram']); ?>" placeholder="https://instagram.com/..." style="width:100%;padding:10px;border-radius:10px;border:1px solid #e6eef9">
        </div>
        <div>
          <label style="display:block;margin-bottom:6px;font-weight:700">Twitter</label>
          <input name="twitter" value="<?php echo h($user['twitter']); ?>" placeholder="https://twitter.com/..." style="width:100%;padding:10px;border-radius:10px;border:1px solid #e6eef9">
        </div>
      </div>

      <div>
        <label style="display:block;margin-bottom:6px;font-weight:700">Bio</label>
        <textarea name="bio" rows="4" style="width:100%;padding:10px;border-radius:10px;border:1px solid #e6eef9"><?php echo h($user['bio']); ?></textarea>
      </div>

      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div style="flex:1">
          <label style="display:block;margin-bottom:6px;font-weight:700">Profile picture</label>
          <input type="file" name="profile_pic" accept="image/*">
        </div>
        <div style="flex:1">
          <label style="display:block;margin-bottom:6px;font-weight:700">Cover picture</label>
          <input type="file" name="cover_pic" accept="image/*">
        </div>
      </div>

      <div style="display:flex;gap:12px;justify-content:flex-end">
        <button type="submit" class="btn">✅ Save changes</button>
        <button type="button" class="btn secondary" id="closeModalBtn">Cancel</button>
      </div>
    </form>

  </div>
</div>
<?php endif; ?>

<!-- Toasts -->
<div id="toast" class="toast"></div>

<script>
// modal open/close (only if owner)
<?php if ($is_owner): ?>
const backdrop = document.getElementById('modalBackdrop');
const openBtns = [document.getElementById('openModalBtn'), document.getElementById('openModalBtn2')];
const closeBtn = document.getElementById('closeModalBtn');
openBtns.forEach(b => { if (b) b.addEventListener('click', openModal); });
if (closeBtn) closeBtn.addEventListener('click', closeModal);

function openModal(e){
  backdrop.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  backdrop.classList.remove('show');
  document.body.style.overflow = '';
}
backdrop.addEventListener('click', function(e){
  if (e.target === backdrop) closeModal();
});
<?php endif; ?>

// messages from server
const serverSuccess = <?php echo json_encode($messages['success']); ?>;
const serverErrors = <?php echo json_encode($messages['errors']); ?>;
function showToast(text, type='success'){
  const t = document.getElementById('toast');
  t.className = 'toast show ' + (type === 'success' ? 'success' : 'error');
  t.textContent = text;
  setTimeout(()=>{ t.className = 'toast'; }, 4200);
}
if (serverSuccess && serverSuccess.length) {
  showToast(serverSuccess.join(' '), 'success');
  // close modal automatically on success (if owner)
  <?php if ($is_owner): ?> closeModal(); <?php endif; ?>
}
if (serverErrors && serverErrors.length) {
  showToast(serverErrors.join(' '), 'error');
  <?php if ($is_owner): ?> openModal(); <?php endif; ?>
}

// copy profile link
function copyProfileLink(){
  const url = window.location.origin + window.location.pathname + "?<?php echo $viewUsername ? 'user=' . rawurlencode($viewUsername) : ''; ?>";
  navigator.clipboard.writeText(url).then(()=>{
    showToast("Profile link copied to clipboard!", "success");
  }).catch(()=>{
    // fallback
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    try { document.execCommand('copy'); showToast("Profile link copied!", "success"); } catch (e) { showToast("Copy failed. Please copy manually: " + url, "error"); }
    input.remove();
  });
}
</script>

</body>
</html>

<?php
// close DB
$conn->close();
?>
