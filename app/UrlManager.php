<?php

namespace app;

/**
 * Class UrlParser
 * @package app
 */
class UrlManager
{
    /** @var string */
    public static $requestUrl;

    /** @var string */
    protected $requestUri;

    /** @var string */
    protected $currentUrl;

    /**
     * UrlParser constructor.
     */
    public function __construct()
    {
        $this->requestUri = $_SERVER['REQUEST_URI'];
        $this::$requestUrl = $this->buildCurrentFullUrl();
    }

    /**
     * @return string|null
     */
    public function getRequestRoute(): ?string
    {
        return trim(parse_url($this->requestUri, PHP_URL_PATH), '/') ?: null;
    }

    /**
     * @param string $url
     * @param string $paramName
     * @return string|null
     */
    public function removeParamFromUrl(string $url, string $paramName): ?string
    {
        $parsedUrl = parse_url($url);
        if (empty($parsedUrl)) {
            return null;
        }
        $paramQuery = $parsedUrl['query'];
        $params = [];
        parse_str($paramQuery, $params);
        if (isset($params[$paramName])) {
            unset($params[$paramName]);
        } else {
            return $url;
        }
        $cleanParamsQuery = http_build_query($params);
        $uri = $parsedUrl['path'] . '?' . $cleanParamsQuery;
        return $this->buildUrl($parsedUrl['scheme'], $parsedUrl['host'], $uri);
    }

    /**
     * @return string|null
     */
    public function getCurrentFullUrl(): ?string
    {
        return $this->currentUrl ?? $this->currentUrl = $this->buildCurrentFullUrl();
    }

    /**
     * @return string|null
     */
    protected function buildCurrentFullUrl(): ?string
    {
        $serverData = Application::$serverData;
        if (empty($serverData['HTTP_HOST'])) {
            return null;
        }
        return $this->buildUrl($serverData['REQUEST_SCHEME'], $serverData['HTTP_HOST'], $serverData['REQUEST_URI']);
    }

    /**
     * @param string $scheme
     * @param string $host
     * @param string|null $uri
     * @return string
     */
    protected function buildUrl(string $scheme, string $host, string $uri = null): string
    {
        $url = "{$scheme}://{$host}";
        if (isset($uri)) {
            $url .= $uri;
        }
        return $url;
    }
}
