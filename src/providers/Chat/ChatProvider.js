import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

import notification from "antd/es/notification";
import Cookies from "js-cookie";
import first from "lodash/first";
import last from "lodash/last";
import io from "socket.io-client";

import CONFIG from "../../config";
import { ChatStateContext } from "../../providers/Chat/ChatStateProvider";
import { UserContext } from "../UserProvider";

import * as CHAT from "./chat";

export const ChatContext = React.createContext({});

const ChatProvider = ({ children }) => {
  const [lastMessage, setLastMessage] = useState({});

  const [fireMessages, setFireMessages] = useState([]);
  const [fireMessages_firstPool, setFireMessages_firstPool] = useState([]);

  const [isBottom, setIsBottom] = useState(false);
  const [triggerSend, setTriggerSend] = useState(false);
  const [limit, setLimit] = useState(0);

  /// Старые стейты
  const { profile } = useContext(UserContext);
  const [isHistoryPending, setIsHistoryPending] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [firstTempMessagesArray, setFirstTempMessagesArray] = useState([]);
  const [secondTempMessagesArray, setSecondMessagesArray] = useState([]);
  const [isFirstActive, setIsFirstActive] = useState(true);

  const {
    statusHistory,
    setStatusHistory,
    setActionSendingMessage,
    offline,
    online,
    isConnected,
  } = useContext(ChatStateContext);

  const [initialScroll, setInitialScroll] = useState(true);

  const socket = useRef(null);

  const currentUrl = new URL(window.location.href);
  const roomUid = currentUrl.searchParams.get("room");

  /// Новый код
  const firebaseUpdateMessages_firstPool = (data, profile) => {
    if (data) {
      const formattedMessages = formatFireMessagesLast(data);
      setFireMessages_firstPool(formattedMessages);
    }
  };

  function formatFireMessagesLast(data) {
    if (!data) return [];
    let formattedMessages = [];

    Object.keys(data).map((key) => {
      let data_item = data[key];
      let messageItem = {
        avatar: data_item.avatar,
        user: data_item.username,
        content: data_item.content,
        time: data_item.time,
        id: key,
        isMine: profile.cuid === data_item.cuid,
        cuid: data_item.cuid,
      };
      formattedMessages.push(messageItem);
    });

    let last_messsage_new = formattedMessages[formattedMessages.length - 1];

    setLastMessage(last_messsage_new);

    return formattedMessages;
  }

  const toggleUnreadDivider = async (index) => {
    let cloneFireMessages = fireMessages.slice();
    let message = cloneFireMessages[index];
    message["unreadDivider"] = !message["unreadDivider"];
    setFireMessages(cloneFireMessages);
  };

  function formatFireMessagesPrev(data, topMessage) {
    if (!data) return [];
    let formattedMessages = [];

    Object.keys(data).map((key) => {
      if (key !== topMessage.id) {
        let data_item = data[key];
        let messageItem = {
          avatar: data_item.avatar,
          user: data_item.username,
          content: data_item.content,
          time: data_item.time,
          id: key,
          isMine: profile.cuid === data_item.cuid,
          cuid: data_item.cuid,
        };
        formattedMessages.push(messageItem);
      }
    });
    return formattedMessages;
  }

  const setPrevMessages = async (data, topMessage) => {
    const formattedMessages = formatFireMessagesPrev(data, topMessage);
    setFireMessages([...formattedMessages, ...fireMessages]);
  };

  const updateFireMessages = async (newData) => {
    if (fireMessages.length) {
      let equal = 0;
      let newMessages = [];

      for (let index = 0; index <= 25; index++) {
        if (fireMessages.length - index - 1 >= 0 && !equal) {
          const old_message = fireMessages[fireMessages.length - index - 1];
          for (let j = newData.length; j >= 0; j--) {
            const new_message = newData[j];
            if (new_message && old_message) {
              if (new_message.id === old_message.id) {
                equal = j + 1;
                break;
              }
              newMessages.push(new_message);
            }
          }
        }
      }
      setFireMessages([...fireMessages, ...newMessages]);
    } else {
      setFireMessages(newData);
    }
  };

  /// Старый код

  const pushMessages = (newMessages) => {
    setMessages((state) => {
      return [...state, ...newMessages];
    });
  };

  const receiveHistory = useCallback(
    (type, time = null) => {
      const data = {
        chat_id: roomId,
        limit: CHAT.MESSAGE_LIMIT,
      };

      switch (type) {
        case "last":
          setActionSendingMessage("disable");
          data["sort"] = "desc";
          break;
        case "prev":
          data["max"] = time - 1;
          data["sort"] = "desc";
          break;
        case "next":
          data["asc"] = "desc";
          data["min"] = time + 1;
          break;
        default:
          break;
      }
      !isHistoryPending &&
        socket.current.emit(CHAT.EVENTS.SELECT, {
          token: Cookies.get("token"),
          data,
        });
    },
    [isHistoryPending, roomId, setActionSendingMessage, isConnected]
  );

  useEffect(() => {
    if (roomId) {
      if (!socket.current) {
        socket.current = io(CONFIG.BASE_SOCKET_URL, {
          path: "/chat",
          transports: ["websocket"],
        });

        socket.current.on(CHAT.EVENTS.CONNECT, () => {
          socket.current.emit(CHAT.EVENTS.JOIN, {
            token: Cookies.get("token"),
            data: { rooms: [roomId] },
          });
          // setMessages([]);
        });

        socket.current.on(CHAT.EVENTS.JOIN, () => {
          online();
          receiveHistory();
        });

        socket.current.on(CHAT.EVENTS.MESSAGE, (message) => {
          //каждый раз когда приходит сообщение вызывается пуш и объект перерисовывается
          //создать еще один массив для хранения этих сообщений, и вызывать pushMessages через setInterval с 1000
          // так как свои сообщения отрисовываются тоже только после того как они пришли по сокетам, то
          //чрезмерной отправкой своих сообщений все равно не получится повесить чат

          if (!hasNext) {
            //pushMessages(formatMessage([message]));
            if (isFirstActive) {
              setFirstTempMessagesArray((state) => [...state, message]);
            } else {
              setSecondMessagesArray((state) => [...state, message]);
            }
          }
        });

        socket.current.on(CHAT.EVENTS.SELECT, (data) => {
          if (statusHistory === "pending") {
            setIsHistoryPending(false);
            setStatusHistory("complete");
            // setActionSendingMessage("enabled");
            // const lastMessages = formatMessage(data.messages.reverse());
            // /** TODO: Может так получиться что количество сообщений будет равен лимиту. Выполниться лишний запрос */
            // setHasPrev(!(lastMessages.length < CHAT.MESSAGE_LIMIT));
            // setHasNext(false);
            // setMessages((state) => [...lastMessages, ...state]);
          }
        });

        socket.current.on(CHAT.EVENTS.DISCONNECT, () => {
          offline();
        });

        socket.current.on(CHAT.EVENTS.RECONNECT, () => {});

        socket.current.on(CHAT.EVENTS.CONNECT_ERROR, () => {
          offline();
        });

        socket.current.on(CHAT.EVENTS.AUTH_ERROR, () => {
          // setMessages([]);
          offline();
        });

        socket.current.on(CHAT.EVENTS.ERROR, () => {
          // setMessages([]);
          offline();
        });
      }
    }
  }, [roomId, statusHistory, isHistoryPending]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (firstTempMessagesArray.length > 0) {
        //console.log('firstTempMessagesArray : ', firstTempMessagesArray)
        setIsFirstActive(false);
        firstTempMessagesArray.map((message) => {
          return;
        });
        //pushMessages(formatMessage(firstTempMessagesArray));
        setFirstTempMessagesArray([]);
      } else if (secondTempMessagesArray.length > 0) {
        //console.log('setSecondMessagesArray : ', setSecondMessagesArray)
        // pushMessages(formatMessage(secondTempMessagesArray));
        setIsFirstActive(true);
        setSecondMessagesArray([]);
      }
    }, 300);

    return () => {
      clearInterval(interval);
    };
  }, [firstTempMessagesArray, secondTempMessagesArray]);

  const joinToRoom = useCallback((roomId) => {
    setRoomId(roomId);
  }, []);

  const send = useCallback(
    (message) => {
      socket.current.emit(CHAT.EVENTS.MESSAGE, {
        token: Cookies.get("token"),
        data: { text: message, chat_id: roomId },
      });
    },
    [roomId]
  );

  const loadPrev = useCallback(() => {
    const firstMessage = first(messages);
    if (firstMessage) {
      receiveHistory("prev", firstMessage.time);
      setIsHistoryPending(true);
    }
  }, [messages, isHistoryPending, setIsHistoryPending, receiveHistory]);

  const loadNext = useCallback(() => {
    const lastMessage = last(messages);
    if (lastMessage) {
      receiveHistory("next", lastMessage.time);
    }
  }, [messages, receiveHistory]);

  const loadLast = useCallback(() => {
    // setMessages([]);
    receiveHistory();
  }, [receiveHistory]);

  function formatMessage(messages) {
    return messages.map((message) => {
      return {
        avatar: message.from_user.avatar,
        user: message.from_user.full_name,
        content: message.text,
        time: message.created_at,
        isMine: message.is_mine,
        id: message.id,
        cuid: message.from_user.user_id,
      };
    });
  }

  const chatProps = useMemo(
    () => ({
      loadPrev,
      loadNext,
      loadLast,
      send,
      joinToRoom,
      hasNext,
      messages,
      fireMessages,
      roomUid,
      lastMessage,
      setIsBottom,
      isBottom,
      setPrevMessages,
      fireMessages_firstPool,
      firebaseUpdateMessages_firstPool,
      updateFireMessages,
      initialScroll,
      setInitialScroll,
      setLimit,
      limit,
      triggerSend,
      setTriggerSend,
      toggleUnreadDivider,
    }),
    [
      messages,
      roomUid,
      fireMessages,
      isBottom,
      lastMessage,
      fireMessages_firstPool,
      initialScroll,
      limit,
      triggerSend,
    ]
  );
  return (
    <ChatContext.Provider value={chatProps}>{children}</ChatContext.Provider>
  );
};

export default ChatProvider;
