import React from "react";

const Spiner = ({ className = "", style = null }) => {
  return (
    <div className={`${className}`}>
      <div className="loader" style={style}>
        {" "}
      </div>
    </div>
  );
};

export default Spiner;
