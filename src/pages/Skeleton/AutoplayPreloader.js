import React, { useState, useEffect } from "react";

import "../Autoplay/index.scss";
import Spiner from "../../ui/Spiner/Spiner";

const AutoplayPreloader = () => {
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    window.addEventListener("resize", () => setHeight(window.innerHeight));

    return () => {
      setHeight(null);
      window.removeEventListener("resize", () => setHeight(window.innerHeight));
    };
  }, []);

  return (
    <div style={{ height: height }}>
      <Spiner className={"spin-xs autoplay-skeleton"} />
    </div>
  );
};

export default AutoplayPreloader;
