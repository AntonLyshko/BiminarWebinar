<?php

use app\Application;

require_once dirname(__FILE__, 1) . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
require_once 'app/Application.php';
require_once 'env_support.php';

$application = new Application();
$application->run();