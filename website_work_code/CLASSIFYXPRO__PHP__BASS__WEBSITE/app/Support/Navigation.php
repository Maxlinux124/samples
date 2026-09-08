<?php

/**
 * Builds the dynamic values consumed by the shared site header.
 *
 * The query and upload URL remain intentionally unchanged so existing header
 * markup and public image paths continue to work without modification.
 *
 * @param mysqli $connection
 * @return array{userImage: string, username: string}
 */
function app_navigation_context($connection)
{
    $userImage = '';
    $username = '';

    if (!isset($_SESSION['user_id'])) {
        return compact('userImage', 'username');
    }

    $userId = $_SESSION['user_id'];
    $statement = $connection->prepare('SELECT username, image FROM users WHERE id = ?');
    $statement->bind_param('i', $userId);
    $statement->execute();
    $result = $statement->get_result();

    if ($row = $result->fetch_assoc()) {
        $username = $row['username'];

        if (!empty($row['image']) && file_exists(APP_ROOT . '/uploads/' . $row['image'])) {
            $userImage = 'uploads/' . $row['image'];
        }
    }

    $statement->close();

    return compact('userImage', 'username');
}

