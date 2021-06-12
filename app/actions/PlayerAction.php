<?php

namespace app\actions;

/**
 * Class PlayerAction
 * @package app\actions
 */
class PlayerAction extends FrontendAction
{
    /**
     * @inheritDoc
     */
    protected function run(): void
    {
        include 'biminar-player/build/index.html';
    }
}
