<?php

namespace app\actions;

use app\Application;
use prodamus\secure\EncryptHelper;

/**
 * Class FrontendAction
 * @package app\actions
 */
abstract class FrontendAction
{
    /**
     * @return void
     */
    public function process(): void
    {
        $this->beforeAction();
        $this->run();
        $this->afterAction();
    }

    /**
     * @return void
     */
    abstract protected function run(): void;

    /**
     * @return void
     */
    protected function beforeAction(): void { }

    /**
     * @return void
     */
    protected function afterAction(): void { }
}
