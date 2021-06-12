import React from "react";

import { cn as useClassName } from "@bem-react/classname";

import "./Message.scss";

const Message = (props) => {
  const { children } = props;
  const cn = useClassName("message");

  return <div className={`${cn()} m-b-20`}>{children}</div>;
};

export default Message;
