<?php

/**
 * Escapes a value for safe HTML output using the application character set.
 */
function app_escape($value)
{
    return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

