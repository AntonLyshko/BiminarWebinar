import React from "react";

import { cn } from "@bem-react/classname";
import "./Icon.scss";

const Icon = ({ className, name, isSpin }) => {
  const cn_icon = cn("icon");
  return (
    <svg className={`${cn_icon({ "is-spin": isSpin })} ${className}`}>
      <use xlinkHref={`#${name}`} />
    </svg>
  );
};

export default Icon;
