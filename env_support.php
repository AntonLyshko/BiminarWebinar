<?php

use Dotenv\Dotenv;

$envLoader = new Dotenv(__DIR__);
$envLoader->load();

if (!function_exists('env')) {

    /**
     * @param string $key
     * @param mixed $default
     * @return string|false
     */
    function env(string $key, $default = null)
    {
        return getenv($key);
    }
}
