<?php

namespace app\actions;

/**
 * Class ControlAction
 * @package app\actions
 */
class ControlAction extends FrontendAction
{
    /**
     * @inheritDoc
     */
    protected function run(): void
    {
        include 'biminar-control/build/index.html';
    }
}
