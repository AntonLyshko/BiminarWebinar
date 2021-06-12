import React from "react";

import AntButton from "antd/es/button";
import "./Button.scss";

const Button = (props) => {
  const { success, className, active, children, ...rest } = props;
  const classes = [className];
  if (success) {
    classes.push("ant-btn-success");
  }

  if (active) {
    classes.push("ant-btn-active");
  }

  return (
    <AntButton className={classes.join(" ")} {...rest}>
      {children}
    </AntButton>
  );
};

export default Button;
