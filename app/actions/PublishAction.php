<?php

namespace app\actions;

/**
 * Class PublishAction
 * @package app\actions
 */
class PublishAction extends FrontendAction
{
    /**
     * @inheritDoc
     */
    protected function run(): void
    {
        include 'biminar-publish/build/index.html';
    }
}
