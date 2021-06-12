import React from "react";

import { cn as useClassName } from "@bem-react/classname";

import "./MessageList.scss";
import Message from "./Message";

const MessageList = (props) => {
  const { errorMessages } = props;
  const cn = useClassName("message-list");

  if (
    Object.entries(errorMessages).every(
      ([key, value]) => !value || value === "EMPTY"
    )
  ) {
    return null;
  }

  return (
    <div className={cn()}>
      <Message>
        {Object.entries(errorMessages).map(([key, value]) => {
          if (!value || value === "EMPTY") {
            return null;
          }
          return <div key={key}>{value}</div>;
        })}
      </Message>
    </div>
  );
};

export default MessageList;
