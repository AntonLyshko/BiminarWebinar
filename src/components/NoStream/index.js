import React from "react";
import "./index.scss";

const NoStream = () => {
  return (
    <>
      <div className="video-wrap-proportion"></div>
      <p className={"nostream__context"}>Нет активных трансляций</p>
    </>
  );
};

export default NoStream;
