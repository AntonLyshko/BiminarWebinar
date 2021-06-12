import React, { useState, useEffect, useContext } from "react";

import Button from "antd/es/button";
import Modal from "antd/es/modal";

import HandIcon from "../../assets/icons/HandIcon";
import Chat from "../../components/Chat/Chat";
import Conferee from "../../components/Conferee/Conferee";
import HandUpPlayer from "../../components/HandUpPlayer";
import { useWindowSize, useClassName } from "../../hooks";

import "../../assets/image/hand.svg";
import "../../assets/image/chat.svg";

import "./index.scss";

import ChatProvider from "../../providers/Chat/ChatProvider";
import { ConfereeContext } from "../../providers/Conferee/ConfereeProvider";
import { ControlContext } from "../../providers/Control";
import FlashphonerProvider from "../../providers/FlashphonerProvider";
import { SyncContext } from "../../providers/SyncProvider";
import { generateHandUpStreamName } from "../../utils/streamName";

const ControlPage = ({ isLogged }) => {
  const { conferees } = useContext(ConfereeContext);
  const { controlIndexAction } = useContext(ControlContext);
  const { connectToSocket, updateSyncAction, syncObject, created } = useContext(
    SyncContext
  );

  const windowSize = useWindowSize();
  const { isMobile, isTablet, isDesktop, isVertical } = windowSize;

  const currentUrl = new URL(window.location.href);
  const roomUid = currentUrl.searchParams.get("room");

  // hand up stream
  const [handUpStreamName, setHandUpStreamName] = useState(null);

  // EFFECTS

  useEffect(() => {
    if (!isLogged) {
      console.log("Ошибка регистрации");
      Modal.warning({
        title: "Ошибка:",
        content:
          "Недостаточно прав для входа на страницу! Для правильного входа необходимо использовать короткую ссылку, выданную Вашим чат-ботом.",
        closable: false,
        okButtonProps: { style: { display: "none" } },
      });
    }
    controlIndexAction(roomUid);
    connectToSocket(roomUid, "_c");
  }, [isLogged]);

  useEffect(() => {
    if (created) {
      controlIndexAction(roomUid);
    }
  }, [created]);

  // handle users changes
  useEffect(() => {
    if (!syncObject.streams.broadcasting) {
      resetHands();
    }
  }, [syncObject?.streams?.broadcasting]);

  // handle users changes
  useEffect(() => {
    if (syncObject?.users) {
      const liveUser = Object.entries(syncObject.users).find(
        ([key, value]) => value.is_live
      );
      if (liveUser && liveUser[0]) {
        setHandUpStreamName(generateHandUpStreamName(roomUid, liveUser[0]));
      } else {
        setHandUpStreamName(null);
      }
    }
  }, [syncObject]);

  // handle close room, do we need it?
  // useEffect(() => {
  //   if (terminate) {
  //     Modal.info({
  //       content: 'Комната закрыта.',
  //       okText: 'Закрыть',
  //       width: 'fit-content',
  //     });
  //   }
  // }, [terminate]);

  // HANDLERS

  const resetHands = () => {
    console.log("Reset Hands !!");
    const newUsersStates = {};
    Object.entries(syncObject.users).forEach(([userUid, userConfig]) => {
      if (userConfig.hand_up || userConfig.is_live) {
        newUsersStates[userUid] = { hand_up: false, is_live: false };
      }
    });
    updateSyncAction(roomUid, { users: newUsersStates });
  };

  const manageHandUpAccess = () => {
    if (syncObject?.states?.hand_up) {
      resetHands();
    }
    updateSyncAction(roomUid, {
      states: { hand_up: !syncObject.states.hand_up },
    });
  };

  const manageChatAccess = () => {
    updateSyncAction(roomUid, { states: { chat: !syncObject.states.chat } });
  };

  const silence = () => {
    if (!syncObject.states.chat && !syncObject.states.hand_up) {
      updateSyncAction(roomUid, { states: { hand_up: true, chat: true } });
    } else {
      updateSyncAction(roomUid, { states: { hand_up: false, chat: false } });
    }
  };

  // RENDERERS

  const { cn } = useClassName("control");

  const renderChat = () => (
    <div
      className={cn("chat", { isMobile, isTablet, isDesktop, isVertical })}
      style={{ height: "100%" }}
    >
      <ChatProvider>
        <Chat roomId={syncObject?.states?.chat_id} inputEnabled />
      </ChatProvider>
    </div>
  );

  return (
    <div className={cn()}>
      <div className={cn("wrapView", { isVertical })}>
        <div
          className={cn("wrap", { isMobile, isTablet, isDesktop, isVertical })}
        >
          <div
            className={cn(
              "wrap__users",
              { isMobile, isTablet, isDesktop, isVertical },
              ["video-wrap video-wrap-16x9"]
            )}
          >
            <div className="video-wrap-proportion"></div>
            {Object.keys(conferees).length > 0 && (
              // @ts-ignore
              <Conferee type="cards" list={conferees} roomUid={roomUid} />
            )}
          </div>

          <div
            className={cn("wrap__buttons", {
              isMobile,
              isTablet,
              isDesktop,
              isVertical,
            })}
          >
            <Button
              className={cn("wrap__button", {
                active: syncObject?.states?.hand_up,
              })}
              type="primary"
              onClick={manageHandUpAccess}
            >
              <HandIcon />
              Можно поднимать руку
            </Button>

            <Button
              className={cn("wrap__button", {
                active: syncObject?.states?.chat,
              })}
              type="primary"
              onClick={manageChatAccess}
            >
              {/*<Icon className={cn('wrap__button__icon')} name="chat" />*/}
              Чат разрешен
            </Button>

            <Button
              className={cn("wrap__silence", {
                active:
                  !syncObject?.states?.hand_up && !syncObject?.states?.chat,
              })}
              type="primary"
              onClick={silence}
              disabled={
                !syncObject?.states?.hand_up && !syncObject?.states?.chat
              }
            >
              Тишина
            </Button>
          </div>
        </div>

        <div
          className={cn("wrapAdvancedStream", {
            isMobile,
            isTablet,
            isDesktop,
            isVertical,
          })}
        >
          {!!handUpStreamName && (
            <div className={cn("stream", { active: true })}>
              <HandUpPlayer streamName={handUpStreamName} roomUid={roomUid} />
            </div>
          )}
          {renderChat()}
        </div>
      </div>
    </div>
  );
};

export default ControlPage;
