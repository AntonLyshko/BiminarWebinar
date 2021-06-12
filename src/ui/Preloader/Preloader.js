import React from "react";

import { cn as useClassName } from "@bem-react/classname";
import "./Preloader.scss";

const Preloader = () => {
  const cn = useClassName("preloader");
  return (
    <div className={cn()}>
      <div className={cn("wrapper")}>
        <div className={cn("three-bounce")}>
          <div className={cn("child")} />
          <div className={cn("child")} />
          <div className={cn("child")} />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
