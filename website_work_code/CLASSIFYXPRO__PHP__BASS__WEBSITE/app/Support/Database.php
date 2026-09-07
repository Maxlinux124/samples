<?php

/**
 * Loads the existing, deployment-provided database adapter on demand.
 *
 * db.php remains outside source control by design; no credentials or database
 * behavior are moved as part of this refactor.
 *
 * @return mysqli
 */
function app_database_connection()
{
    $databaseFile = APP_ROOT . DIRECTORY_SEPARATOR . 'db.php';

    if (!is_file($databaseFile)) {
        throw new RuntimeException('Database configuration file is unavailable.');
    }

    require_once $databaseFile;

    if (!function_exists('getDBConnection')) {
        throw new RuntimeException('Database configuration must provide getDBConnection().');
    }

    return getDBConnection();
}

