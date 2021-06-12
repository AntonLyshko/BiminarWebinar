import React, { useState, useContext } from "react";

import Button from "antd/es/button";
import Input from "antd/es/input";
import dayjs from "dayjs";

import PapperPlaneIcon from "../../../assets/icons/PapperPlaneIcon";
import { useClassName } from "../../../hooks";
import { ChatContext } from "../../../providers/Chat/ChatProvider";
import { FirebaseContext } from "../../../providers/Firebase/Firebase";
import { UserContext } from "../../../providers/UserProvider";

import "./InputChat.scss";

const InputChat = () => {
  const { cn } = useClassName("input-chat");
  const { firebase } = useContext(FirebaseContext);
  const { roomUid, setTriggerSend } = useContext(ChatContext);
  const { profile } = useContext(UserContext);
  const [value, setValue] = useState("");
  // let toSend = [];

  const fireSend = async () => {
    setTriggerSend(true);

    if (value) {
      // let messageBody = {
      //   chatId: roomUid,
      //   cuid: profile.cuid,
      //   avatar: profile.avatar,
      //   username: profile.fullName,
      //   time: dayjs().valueOf(),
      //   content: content,
      // };
      // toSend = [...toSend, messageBody];
      const content = value;
      firebase.addMessage(
        roomUid,
        profile.fullName,
        profile.avatar,
        content,
        profile.cuid,
        dayjs().valueOf()
      );
      setValue("");
    }
  };

  const handleKeyPress = async (event) => {
    if (event.keyCode === 13) {
      fireSend();
    }
  };

  const handleOnChange = ({ target }) => {
    setValue(target.value);
  };

  return (
    <div id="chat-input" className={cn()}>
      <div className={cn("wrap")}>
        <Input
          value={value}
          onKeyDown={handleKeyPress}
          onChange={handleOnChange}
          className={cn("input")}
          placeholder="Напишите ваше сообщение..."
          autoComplete="off"
        />
      </div>
      <Button
        onClick={fireSend}
        type="primary"
        shape="circle"
        className={cn("button")}
      >
        <PapperPlaneIcon />
      </Button>
    </div>
  );
};

export default InputChat;
