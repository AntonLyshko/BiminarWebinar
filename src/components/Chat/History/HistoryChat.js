import React, { useContext, useEffect, useRef, useState, Fragment, useCallback } from "react";

import { DownOutlined, ApiTwoTone, LoadingOutlined, CompassTwoTone } from "@ant-design/icons";
import { Divider } from "antd";
import { debounce } from "lodash";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList as List } from "react-window";

import MessageChat from "../../../components/Chat/Message/MessageChat";
import { useClassName } from "../../../hooks";
import { ChatContext } from "../../../providers/Chat/ChatProvider";
import { ChatStateContext } from "../../../providers/Chat/ChatStateProvider";
import { FirebaseContext } from "../../../providers/Firebase/Firebase";

import "./HistoryChat.scss";

import { SecondaryVideoContext } from "../../../providers/SecondaryVideoProvider";
import { SyncContext } from "../../../providers/SyncProvider";

const HistoryChat = ({ className, ...props }) => {
  const { firebase } = useContext(FirebaseContext);
  const {
    roomUid,
    fireMessages,
    isBottom,
    setIsBottom,
    setPrevMessages,
    fireMessages_firstPool,
    firebaseUpdateMessages_firstPool,
    updateFireMessages,
    initialScroll,
    setInitialScroll,
    triggerSend,
    setTriggerSend,
    toggleUnreadDivider,
  } = useContext(ChatContext);
  const { statusNextHistory } = useContext(ChatStateContext);
  const { isSecVideoActive } = useContext(SecondaryVideoContext);

  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [lastSeenMessage, setLastSeenMessage] = useState({});
  const [isLoadPrev, setIsLoadPrev] = useState(false);
  const [nextHave, setNextHave] = useState(true);
  const [triggerClearTimer, setTriggerClearTimer] = useState(false);
  const [triggeredMoment, setTriggeredMoment] = useState();
  const [criticalError, setCriticalError] = useState(null);

  const { syncObject } = useContext(SyncContext);

  const historyDivRef = useRef();
  const [chatList, setChatRef] = useState(null);

  const onRefChange = useCallback((node) => {
    setChatRef(node);
  }, []);

  useEffect(() => {
    firebase
      .messages(roomUid)
      .limitToLast(25)
      .on("value", (snapshot) => {
        firebaseUpdateMessages_firstPool(snapshot.val());
      });
  }, [roomUid]);

  useEffect(() => {
    // ОШибка КРЫМА
    if (localStorage.getItem("error")) {
      const error = localStorage.getItem("error");
      if (error === "VPN") {
        setCriticalError({
          type: "VPN",
          title: "Воспользуйтесь VPN",
          description: () => (
            <>
              <p>
                Чат Биминара использует технологию компании Google "Firebase". Google ограничил возможность использовать
                их сервисы на территории Крыма.
              </p>
              <p>Мы приносим свои извинения и просим воспользоваться сервисами VPN для доступа к чату.</p>
            </>
          ),
        });
      } else {
        setCriticalError({
          type: "unknow",
          title: "Неизвестная ошибка",
          description: `...`,
        });
      }
      localStorage.removeItem("error");
    }
  }, []);

  useEffect(() => {
    if (syncObject?.streams?.broadcasting) scrollBottom();
  }, [syncObject?.streams?.broadcasting]);

  useEffect(() => {
    if (isBottom) {
      if (lastSeenMessage.id) setTriggerClearTimer(!triggerClearTimer);
    } else if (!initialScroll && !triggerSend) {
      setNewMessagesCount(newMessagesCount + 1);
      if (!lastSeenMessage.id && fireMessages.length) {
        setUnreadDivider(fireMessages[fireMessages.length - 1]);
        setLastSeenMessage(fireMessages[fireMessages.length - 1]);
      }
    }
    updateFireMessages(fireMessages_firstPool);
  }, [fireMessages_firstPool]);

  useEffect(() => {
    if (isBottom) scrollBottom();
    if (initialScroll) scrollBottom();
    if (isLoadPrev) {
      let loadedLast = fireMessages.length - triggeredMoment.messageCount;
      if (loadedLast > 1) {
        if (loadedLast < 23) setNextHave(false);
        let scrollTo = fireMessages.length - triggeredMoment.messageCount + triggeredMoment.messageIndex;
        chatList.scrollToItem(scrollTo, "start");
        // const chatlist = document.getElementById("chatlist");
        // chatlist.classList.add("overflow-hidden");
        // chatlist.classList.remove("overflow-hidden");
      } else {
        setNextHave(false);
      }
      setTimeout(() => {
        setIsLoadPrev(false);
      }, 200);
    }
  }, [fireMessages]);

  useEffect(() => {
    if (lastSeenMessage.id && newMessagesCount == 0) setTriggerClearTimer(!triggerClearTimer);
  }, [newMessagesCount]);

  useEffect(() => {
    // Remove unread divider
    let timer = setTimeout(() => {
      if (isBottom && lastSeenMessage.id) {
        setUnreadDivider(lastSeenMessage);
        setLastSeenMessage({});
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [triggerClearTimer, isBottom]);

  useEffect(() => {
    if (initialScroll) scrollBottom();
    if (isSecVideoActive) scrollBottom();
    if (initialScroll && chatList) scrollBottom();
    if (triggerSend) scrollBottom();
  }, [initialScroll, isSecVideoActive, chatList, triggerSend]);

  const setUnreadDivider = (lastSeenMessage) => {
    let messageIndex = fireMessages.findIndex((m) => m.id === lastSeenMessage.id);
    toggleUnreadDivider(messageIndex);
    chatList.resetAfterIndex(messageIndex);
  };

  const loadPrevMessages = async () => {
    let topMessage = fireMessages[0];
    let prevMessages = await firebase.getPrevMessages(roomUid, topMessage.time, 25);
    setPrevMessages(prevMessages, topMessage);
  };

  const increaseLimit = debounce(
    async (visiableTop) => {
      if (!isLoadPrev) {
        // Анимация загрузки скроллом
        let messageHeight = 68;
        const SCROLLHEIGHT_willbe = (fireMessages.length + 24) * messageHeight;
        const VIEWPORT_from_SCROLLHEIGHT = ((fireMessages.length * messageHeight) / SCROLLHEIGHT_willbe) * 100;
        const PREV_from_CURRENT = (((visiableTop + 24) * messageHeight) / SCROLLHEIGHT_willbe) * 100;
        const chatlist = document.getElementById("chatlist");
        chatlist.style.setProperty("--loadScaleEnd", PREV_from_CURRENT + "%");
        chatlist.style.setProperty("--scrollBarHeight", VIEWPORT_from_SCROLLHEIGHT + "%");
        //

        setTriggeredMoment({
          messageIndex: visiableTop,
          messageCount: fireMessages.length,
        });
        setIsLoadPrev(true);
        await loadPrevMessages();
      }
    },
    3550,
    { leading: true, trailing: false }
  );

  const scrollBottom = () => {
    if (chatList && fireMessages.length) {
      chatList.scrollToItem(9999, "auto");
      setTriggerSend(false);
      setNewMessagesCount(0);
      setTimeout(() => setInitialScroll(false), 1000);
    }
  };

  const ItemsRenderedHandler = (props) => {
    const visiableTop = props.visibleStartIndex;
    const visiableBottom = props.visibleStopIndex;
    const fromBottom = fireMessages.length - visiableBottom - 1;

    if (fromBottom < newMessagesCount) {
      setNewMessagesCount(newMessagesCount - fromBottom);
    }

    if (visiableTop <= 5 && initialScroll && isSecVideoActive && chatList) {
      scrollBottom();
    }

    if (visiableBottom + 3 >= fireMessages.length) {
      if (newMessagesCount > 0) setNewMessagesCount(0);
      if (!isBottom) setIsBottom(true);
    } else {
      if (isBottom) setIsBottom(false);
    }

    if (visiableTop <= 5 && !initialScroll) {
      increaseLimit(visiableTop);
    }
  };

  const renderMessage = ({ index, isScrolling, style }) => {
    const message = fireMessages[index];
    const customStyle = {
      paddingRight: "10px",
    };

    return (
      <div style={{ ...style, ...customStyle }} key={message.id}>
        {isScrolling ? (
          <Fragment></Fragment>
        ) : (
          <Fragment>
            <MessageChat
              mine={message.isMine}
              user={{
                avatarURL: message.avatar,
                username: message.user,
                cuid: message.cuid,
              }}
              content={message.content}
              time={message.time}
            />
            {index !== fireMessages.length - 1 && message.id === lastSeenMessage.id ? (
              <Divider className='new-message-divider'>Непрочитанные сообщения</Divider>
            ) : null}
          </Fragment>
        )}
      </div>
    );
  };

  const resizeHandle = debounce(
    async () => {
      if (chatList) {
        chatList.resetAfterIndex(0);
        scrollBottom();
      }
    },
    500,
    { leading: false, trailing: true }
  );

  const onResize = () => {
    resizeHandle();
  };

  const getItemSize = (index) => {
    let messageHeight = 60;
    let spaceFromBorder = 45;
    let symbolWidth = 7.2;
    let maxMessageWidth = 0.65;
    let symbolHeight = 20;
    let paddingBottomTop = 20;
    let marginTop = 10;
    let upperTextHeight = 18;
    let timeWidth = 57.61 + symbolWidth;

    const message = fireMessages[index];

    const userLen = message.user.length;
    const contentLen = message.content.length;

    const chatWidth = historyDivRef.current.offsetWidth;
    const MaxStringMessageWidth = chatWidth * maxMessageWidth - spaceFromBorder;

    const stringWidthMsg = contentLen * symbolWidth;
    const stringWidthUser = userLen * symbolWidth + timeWidth;

    const stringCountUser = Math.ceil(stringWidthUser / MaxStringMessageWidth);
    const stringCountMsg = Math.ceil(stringWidthMsg / MaxStringMessageWidth);
    const stringCount = stringCountUser + stringCountMsg;

    messageHeight = stringCount * symbolHeight + paddingBottomTop + marginTop + upperTextHeight;

    if (message["unreadDivider"]) messageHeight += 50;

    return messageHeight;
  };

  const { cn } = useClassName("history-chat");

  return (
    <>
      {!criticalError ? (
        <div style={props.style} className={cn("", [className])} id='chatlist' ref={historyDivRef}>
          {syncObject?.streams?.broadcasting ? (
            <>
              {initialScroll && (
                <>
                  <div className='loading-screen-chatlist'>
                    <div className='loading-icon'>
                      <LoadingOutlined />
                    </div>
                    <div className='loading-title'>Загрузка чата...</div>
                  </div>
                </>
              )}

              {fireMessages.length > 25 && !nextHave && (
                <Divider className='new-message-divider no-accent'>Начало чата</Divider>
              )}

              {!isBottom && !initialScroll ? (
                <>
                  <div className='scroll-to-bottom' onClick={() => scrollBottom()}>
                    {newMessagesCount > 0 ? <div className='new-messages-indicator'>{newMessagesCount}</div> : null}
                    <DownOutlined />
                  </div>
                </>
              ) : null}

              <div id='chatlist_wrapper' className={`history-chat__wrapper ${initialScroll ? "loading" : ""}`}>
                <AutoSizer onResize={onResize}>
                  {({ height, width }) => (
                    <List
                      ref={onRefChange}
                      onItemsRendered={ItemsRenderedHandler}
                      className='chatlist-container'
                      height={height}
                      itemCount={fireMessages.length}
                      itemSize={getItemSize}
                      width={width}
                    >
                      {renderMessage}
                    </List>
                  )}
                </AutoSizer>
              </div>
            </>
          ) : (
            <>
              <div className='broadcast-not-loaded-container'>
                <div className='broadcast-not-loaded-title'>
                  <ApiTwoTone twoToneColor='#3498db' />
                  Подключение...
                </div>
              </div>
            </>
          )}

          {(isLoadPrev || statusNextHistory === "pending") && nextHave ? (
            <div className={`loading-bar-container loading-percent`}>
              <div className='loader'>
                <div className='loader-mask'>
                  <div className='loaderBar'></div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className='error-chat-container'>
            <div className='error-icon'>{criticalError.type === "VPN" && <CompassTwoTone />}</div>
            <div className='error-title'>{criticalError.title}</div>
            <div className='error-text'>{criticalError.description()}</div>
          </div>
        </>
      )}
    </>
  );
};

export default HistoryChat;
