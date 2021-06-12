import React from "react";

import Button from "antd/es/button";

import HandIcon from "../../assets/icons/HandIcon";
import { useClassName, useWindowSize } from "../../hooks";

import "../Control/index.scss";

const ControlPreloader = () => {
  const windowSize = useWindowSize();
  const { isMobile, isTablet, isDesktop, isVertical } = windowSize;

  const { cn } = useClassName("control");

  return (
    <div className={cn()}>
      <div className={cn("wrapView", { isVertical })}>
        <div
          className={cn("wrap", { isMobile, isTablet, isDesktop, isVertical })}
        >
          <div
            className={cn(
              "wrap__users",
              { isMobile, isTablet, isDesktop, isVertical },
              ["video-wrap video-wrap-16x9"]
            )}
          >
            <div className="video-wrap-proportion"></div>
          </div>

          <div
            className={cn("wrap__buttons", {
              isMobile,
              isTablet,
              isDesktop,
              isVertical,
            })}
          >
            <Button className={cn("wrap__button")} type="primary">
              <HandIcon />
              Можно поднимать руку
            </Button>

            <Button className={cn("wrap__button")} type="primary">
              Чат разрешен
            </Button>

            <Button className={cn("wrap__silence")} type="primary" disabled>
              Тишина
            </Button>
          </div>
        </div>

        <div
          className={cn("wrapAdvancedStream", {
            isMobile,
            isTablet,
            isDesktop,
            isVertical,
          })}
        >
          <div className={cn("stream")}></div>
        </div>
      </div>
    </div>
  );
};

export default ControlPreloader;
