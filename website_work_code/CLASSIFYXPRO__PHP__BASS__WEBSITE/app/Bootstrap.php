<?php

/**
 * Application bootstrap for progressively refactored pages.
 *
 * This file intentionally performs no I/O on load. Pages opt in to session,
 * database, and other services through the helpers below.
 */
if (!defined('APP_ROOT')) {
    define('APP_ROOT', dirname(__DIR__));
}

require_once __DIR__ . '/Support/Database.php';
require_once __DIR__ . '/Support/Html.php';
require_once __DIR__ . '/Support/Navigation.php';
require_once __DIR__ . '/Support/Session.php';
