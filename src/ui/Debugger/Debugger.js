import React from "react";

import { cn as useClassName } from "@bem-react/classname";

import { useWindowSize } from "../../hooks";
import "./Debugger.scss";

const Debugger = (props) => {
  const cn = useClassName("debugger");
  const size = useWindowSize();

  // $media-xs-less: 'only screen and (max-width: 575px)';
  // $media-md-less: 'only screen and (max-width: 767px)';
  // $media-sm-more: 'only screen and (min-width: 576px)';
  // $media-md-more: 'only screen and (min-width: 768px)';
  // $media-lg-more: 'only screen and (min-width: 992px)';
  // $media-xl-more: 'only screen and (min-width: 1200px)';

  const getStyleSize = () => {
    if (size.width < 576) {
      return "xs";
    }

    if (size.width < 768) {
      return "sm";
    }

    if (size.width < 992) {
      return "md";
    }

    if (size.width < 1200) {
      return "lg";
    }

    if (size.width >= 1200) {
      return "xl";
    }
    return "";
  };

  return <div className={cn()}>{getStyleSize()}</div>;
};

export default Debugger;
