<?php

namespace app\actions;

/**
 * Class DefaultAction
 * @package application\actions
 */
class DefaultAction extends FrontendAction
{
    /**
     * @inheritDoc
     */
    protected function run(): void
    {
        include 'build/index.html';
    }
}
