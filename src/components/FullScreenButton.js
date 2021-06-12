import "./FullScreenButton.scss";
import React, { useEffect, useState } from "react";

import { Button } from "antd";

const FullScreenButton = ({ isActive }) => {
  const [iconClass, setIconClass] = useState("fa fa-expand");

  const onFullScreenChange = (e) => {
    var fullscreenElement =
      document.fullscreenElement ||
      document.mozFullscreenElement ||
      document.webkitFullscreenElement;

    var root = document.getElementsByTagName("html")[0];

    if (fullscreenElement) {
      root.classList.add("fullscreen");
      setIconClass("fa fa-compress");
    } else {
      root.classList.remove("fullscreen");
      setIconClass("fa fa-expand");
    }
  };

  const handleOnClickFullScreen = () => {
    if (
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement
    ) {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    } else {
      var _element = document.documentElement;

      if (_element.requestFullscreen) {
        _element.requestFullscreen();
      } else if (_element.mozRequestFullScreen) {
        _element.mozRequestFullScreen();
      } else if (_element.webkitRequestFullscreen) {
        _element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", onFullScreenChange);
    document.addEventListener("webkitfullscreenchange", onFullScreenChange);
    document.addEventListener("mozfullscreenchange", onFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullScreenChange
      );
      document.removeEventListener("mozfullscreenchange", onFullScreenChange);
    };
  }, [onFullScreenChange, onFullScreenChange, onFullScreenChange]);

  return (
    <Button
      type="primary"
      disabled={isActive}
      onClick={handleOnClickFullScreen}
      className="ant-btn ant-btn-primary control-fullscreen"
    >
      <i className={iconClass}></i>
    </Button>
  );
};

export default FullScreenButton;
