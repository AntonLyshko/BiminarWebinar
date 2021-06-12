import url from "url";

import React, {
  useState,
  useContext,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";

import Cookies from "js-cookie";
import _merge from "lodash/merge";
import io from "socket.io-client";

import { AxiosInstances } from "../_prodamus";
import { API } from "../_prodamus/actions/axios";
import { ProdamusAuthContext } from "../_prodamus/stores/Auth";
import CONFIG from "../config";
import { ConfereeContext } from "../providers/Conferee/ConfereeProvider";

export const SyncContext = React.createContext({});

const token = Cookies.get("token");

const defaultSyncObject = {
  interface: {
    template: 1,
    title: "",
    chat: false,
    smile: false,
    logos: {},
    buttons: {},
    files: {},
    opinions: {},
  },
  streams: {
    init: false,
    broadcasting: false,
    main: {
      input: null,
      output: null,
    },
    advanced: {
      input: null,
      output: null,
    },
  },
  users: {},
  states: {
    chat: true,
  },
  // stats: {
  //     countParticipants: 0,
  //     countChatMessages: 0,
  // },
  chat: {},
};

const SyncProvider = ({ children }) => {
  const [syncObject, setSyncObject] = useState({ ...defaultSyncObject });
  const [created, setCreated] = useState(false);
  const [joined, setJoined] = useState(false);
  const [terminate, setTerminate] = useState(false);
  const [isUserExist, setIsUserExist] = useState(null);
  const socket = useRef(null);

  const sessionID = useRef(Math.floor(Math.random() * 1000000));

  const { confereeInitialize, manage } = useContext(ConfereeContext);
  const { isProdamusLogged: isLogged } = useContext(ProdamusAuthContext);

  let profile = {};
  profile.cuid = window.sessionStorage.getItem("cuid");
  profile.userUid = window.sessionStorage.getItem("user_uid");

  const createLog = (message, time, roomType, category) => {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("timestamp", time);
    formData.append(
      "front_pid",
      `${Date.now()}_${window.sessionStorage.getItem("cuid")}`
    );
    formData.append("location", roomType);
    formData.append("category", category);

    API.post("/v1/front/create-log", formData).catch((error) => {
      throw error;
    });
  };

  const resetSyncObj = () => {
    setSyncObject({ ...defaultSyncObject });
  };

  const updateSyncObject = (data) => {
    if (data) {
      setSyncObject((state) => _merge({ ...state }, data));
    }
  };

  const disconnect = () => {
    socket.current?.close();
  };

  const playerIndexAction = useCallback(async (uid) => {
    AxiosInstances.API.get(`/v1/player/index?room=${uid}`)
      .then((res) => {
        if (res?.data?.error === 0) {
          if (
            res?.data?.data?.redirect &&
            res.data.data.redirect.location !== "player"
          ) {
            redirectAction(
              res.data.data.redirect.location,
              res.data.data.redirect.room_uid
            );
          } else {
            confereeInitialize(res.data.data.state.users);
            updateSyncObject(res.data.data.state);
          }
        } else {
          throw "Invalid index response";
        }
      })
      .catch((error) => {
        throw error;
      });
  }, []);

  const isSocketConnected = () => {
    return socket.current?.connected;
  };

  const connectToSocket = useCallback(
    (roomUid, roomType, disconnectOnStart = false) => {
      if (roomUid && !socket.current) {
        socket.current = io(CONFIG.BASE_SOCKET_URL, {
          path: CONFIG.BASE_SOCKET_SYNC_PATH,
          transports: ["websocket"],
        });

        socket.current.on("connect", () => {
          setJoined(false);
          if (roomType === "_p") {
            console.warn("socket emit check_active_connection");
            disconnectOnStart && disconnectUser(roomUid, profile.userUid);

            socket.current.emit("check_active_connection", {
              token,
              timestamp: Date.now(),
              front_pid: `${Date.now()}_${profile.cuid}`,
              front_session_id: sessionID.current,
              data: { room_id: roomUid, room_type: roomType },
            });
            //говорит всем пользователям что произошло новое поделючение и проверяет нет ли еще такого пользователя
            // возвращает true - если такой пользователь уже подключен
          } else {
            console.warn("socket emit start");
            socket.current.emit("start", {
              token,
              timestamp: Date.now(),
              front_pid: `${Date.now()}_${profile.cuid}`,
              front_session_id: sessionID.current,
              data: { rooms: [{ room_id: roomUid, room_type: roomType }] },
            }); // roomUid
          }
        });

        socket.current.on("start", () => {
          console.log("syncing isLogged", isLogged);
          if (isLogged) {
            playerIndexAction(roomUid);
          }
        });

        socket.current.on("connect_error", () => {
          createLog(
            `Socket disconnect connect error`,
            Math.round(new Date().getTime() / 1000),
            window.location.pathname,
            "Socket"
          );
          setJoined(false);
          console.warn("socket connect error");
        });

        socket.current.on("disconnect", (reason) => {
          createLog(
            `Socket disconnect ${reason}`,
            Math.round(new Date().getTime() / 1000),
            window.location.pathname,
            "Socket"
          );
          console.warn("socket disconnect because ", reason);
        });

        socket.current.on("check_active_connection", (msg) => {
          if (msg.result) {
            setIsUserExist(msg.result);
            console.warn("socket on check_active_connection = true");
          } else {
            console.warn("socket on check_active_connection = false");
            socket.current.emit("start", {
              token,
              timestamp: Date.now(),
              front_pid: `${Date.now()}_${profile.cuid}`,
              front_session_id: sessionID.current,
              data: { rooms: [{ room_id: roomUid, room_type: roomType }] },
            }); // roomUid
            console.warn("socket emit start");
          }
        });

        socket.current.on("new_user_connection", () => {
          if (roomType === "_p") {
            console.warn("socket on new_user_connection");
            setTerminate(true);
            setIsUserExist(true);
            setSyncObject({ ...defaultSyncObject });
            socket.current.close();
          }
        });

        socket.current.on("select_webinar_status", (msg) => {
          if (msg.data) {
            if (msg.data.created) {
              setCreated(true);
            }

            if (syncObject) {
              if (msg.data.terminated) {
                setTerminate(true);
                updateSyncObject({
                  ...defaultSyncObject,
                  states: { hand_up: false },
                });
                window.location.reload();
              } else {
                setJoined(true);
                updateSyncObject(msg.data.state);
                if (msg.data.state?.users) {
                  manage({ updated: true, users: msg.data.state.users });
                }
              }
            } else {
              setSyncObject((state) =>
                _merge({ ...state }, { ...msg.data.state })
              );
            }
          }
        });

        socket.current.on("user_management_result", (msg) => {
          console.log("joined: ", joined);

          if (msg.data.disconnected && msg.data.users) {
            setSyncObject((state) => {
              Object.keys(msg.data.users).map((deletedUser) => {
                delete state.users[deletedUser];
              });
              return { ...state };
            });
          }
          if (msg.data.joined && msg.data.users) {
            console.log("setJoined after user_management_result");
            setJoined(true);
          }
          if (msg.data) {
            manage(msg.data);
          }
        });

        setInterval(() => {
          socket.current.emit("ping_user", {
            token,
            timestamp: Date.now(),
            front_pid: `${Date.now()}_${profile.cuid}`,
            data: { room_uid: roomUid },
          });
        }, 10000);
      }
    },
    [manage, playerIndexAction, syncObject]
  );

  const disconnectUser = useCallback((roomUid, userUid) => {
    updateSyncAction(roomUid, {
      users: { [userUid]: { hand_up: false, is_live: false } },
    });
    setIsUserExist(false);
  }, []);

  const disconnectPreviousUser = useCallback(
    (roomUid, userUid, roomType) => {
      disconnectUser(roomUid, userUid);
      socket.current.emit("start", {
        token,
        timestamp: Date.now(),
        front_pid: `${Date.now()}_${profile.cuid}`,
        front_session_id: sessionID.current,
        data: { rooms: [{ room_id: roomUid, room_type: roomType }] },
      }); // roomUid
    },
    [syncObject]
  );

  const updateSyncAction = (roomUid, syncData, front_disconnected = false) => {
    if (syncData && socket.current) {
      socket.current.emit("update_webinar_status", {
        token,
        timestamp: Date.now(),
        front_pid: `${Date.now()}_${profile.cuid}`,
        data: { state: syncData, room_uid: roomUid, front_disconnected },
      });
    }
  };

  const redirectAction = async (redirectPath, roomUid) => {
    window.location.href = url.format({
      protocol: window.location.protocol,
      host: window.location.host,
      pathname: redirectPath,
      query: { room: roomUid },
    });
  };

  const props = useMemo(
    () => ({
      playerIndexAction,
      syncObject,
      resetSyncObj,
      connectToSocket,
      isSocketConnected,
      terminate,
      joined,
      setTerminate,
      disconnect,
      created,
      updateSyncAction,
      isUserExist,
      disconnectUser,
      disconnectPreviousUser,
      createLog,
    }),
    [
      syncObject,
      terminate,
      created,
      joined,
      isUserExist,
      connectToSocket,
      disconnectUser,
      disconnectPreviousUser,
      playerIndexAction,
    ]
  );

  return <SyncContext.Provider value={props}>{children}</SyncContext.Provider>;
};

export default SyncProvider;
