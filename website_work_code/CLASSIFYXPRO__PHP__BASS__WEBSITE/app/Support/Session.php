<?php

/**
 * Starts a PHP session only when the current request has not started one.
 */
function app_start_session()
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

