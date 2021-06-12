import React, { useEffect, useContext } from "react";

import HistoryChat from "../../components/Chat/History/HistoryChat";
import HistoryChatLoading from "../../components/Chat/History/HistoryChatLoading";
import InputChat from "../../components/Chat/Input/InputChat";
import { useClassName } from "../../hooks";
import { UserContext } from "../../providers/UserProvider";
import "./Chat.scss";

import ChatProvider, { ChatContext } from "../../providers/Chat/ChatProvider";
import { SyncContext } from "../../providers/SyncProvider";

const Chat = ({ roomId, inputEnabled, type, style }) => {
  const { cn } = useClassName("chat");
  const { joinToRoom } = useContext(ChatContext);
  const { profile } = useContext(UserContext);
  const { syncObject } = useContext(SyncContext);

  useEffect(() => {
    if (roomId) {
      joinToRoom(roomId);
    }
  }, [roomId]);

  if (profile.cuid) {
    if (type === "history") {
      return <HistoryChat className='bg-color minh-200' />;
    } else if (type === "input") {
      return <>{inputEnabled && syncObject?.streams?.broadcasting && <InputChat />}</>;
    } else {
      return (
        <div className={cn()}>
          <HistoryChat style={style} />
          {inputEnabled && syncObject?.streams?.broadcasting && <InputChat />}
        </div>
      );
    }
  } else {
    if (type === "history") {
      return <HistoryChatLoading />;
    }
    if (type === "input") {
      return <>{inputEnabled && syncObject?.streams?.broadcasting && <InputChat />}</>;
    }
  }
  return null;
};

export default Chat;
