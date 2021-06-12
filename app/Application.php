<?php

namespace app;

use app\actions\FrontendAction;
use app\actions\DefaultAction;

/**
 * Class Application
 * @package app
 */
class Application
{
    /** @var array */
    public static $postRequestData;

    /** @var array */
    public static $getRequestData;

    /** @var array */
    public static $serverData;

    /** @var UrlManager */
    public static $urlManager;

    /** @var string|null  */
    protected $currentRoute;

    /** @var array */
    protected $routes;

    /**
     * Application constructor.
     */
    public function __construct()
    {
        $this::$serverData = $_SERVER;
        $this->retrieveRequestData();
        $this::$urlManager = new UrlManager();
        $this->currentRoute = $this::$urlManager->getRequestRoute();
        $this->routes = require_once 'routes.php';
    }

    /**
     * @return void
     */
    public function run(): void
    {
        $this->processEncryptedSession();
        $frontendAction = $this->processRoute();
        $frontendAction->process();
    }

    /**
     * @return void
     */
    protected function retrieveRequestData(): void
    {
        $this::$getRequestData = $_GET;
        $this::$postRequestData = $_POST;
    }

    /**
     * @return FrontendAction
     */
    protected function processRoute(): FrontendAction
    {
        $routes = $this->routes;
        $actionClass = $routes[$this->currentRoute] ?? DefaultAction::class;
        return new $actionClass();
    }

    /**
     * @return void
     */
    protected function processEncryptedSession(): void
    {
        $urlManager = $this::$urlManager;
        $getRequestData = Application::$getRequestData;
        $encryptedSessionData = $getRequestData['encrypted_session_data'] ?? null;
        if (empty($encryptedSessionData)) {
            return;
        }
        $currentUrl = $urlManager->getCurrentFullUrl();
        if (!isset($currentUrl)) {
            return;
        }

        $parsedUrl = parse_url($currentUrl);
        $expires = time() + 3600;

        if (version_compare(PHP_VERSION, '7.3', '>=')) {
            setcookie('encrypted_session_data', $encryptedSessionData, [
                'expires' => $expires,
                'path' => '/',
                'domain' => $parsedUrl['host'],
                'secure' => true,
                'httponly' => false,
                'samesite' => 'None',
            ]);
        } else {
            setcookie(
                'encrypted_session_data',
                $encryptedSessionData,
                $expires,
                '/',
                $parsedUrl['host'],
                true,
                false
            );
        }

        $cleanUrl = $urlManager->removeParamFromUrl($currentUrl, 'encrypted_session_data');
        if (isset($cleanUrl)) {
            header("Location: {$cleanUrl}");
        }
    }
}
