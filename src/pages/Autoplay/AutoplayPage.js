import "./index.scss";
import React, { useEffect, useState, useContext } from "react";

import { Button, Result } from "antd";
import Modal from "antd/es/modal";

import UserIcon from "../../assets/icons/UserIcon";
import Chat from "../../components/Chat/Chat";
import Conferee from "../../components/Conferee/Conferee";
import FullScreenButton from "../../components/FullScreenButton";
import RenderHandUp from "../../components/HandUp/RenderHandUp";
import HandUpPlayer from "../../components/HandUpPlayer";
import NoStream from "../../components/NoStream";
import Player from "../../components/Player";
import { usePrevious, useClassName } from "../../hooks";
import ChatProvider from "../../providers/Chat/ChatProvider";
import { ConfereeContext } from "../../providers/Conferee/ConfereeProvider";
import { FlashphonerContext } from "../../providers/FlashphonerProvider";
import { SecondaryVideoContext } from "../../providers/SecondaryVideoProvider";
import { SyncContext } from "../../providers/SyncProvider";
import { UserContext } from "../../providers/UserProvider";
import { generateHandUpStreamName } from "../../utils/streamName";

const AutoplayPage = ({ isLogged }) => {
  const { profile } = useContext(UserContext);

  const {
    playerIndexAction,
    syncObject,
    isSocketConnected,
    connectToSocket,
    disconnect,
    created,
    isUserExist,
    disconnectPreviousUser,
    terminate,
    setTerminate,
    resetSyncObj,
  } = useContext(SyncContext);

  const {
    openChat,
    isMobileChatActive,
    setIsSecVideoActive,
    isSecVideoActive,
  } = useContext(SecondaryVideoContext);

  const { publishSession } = useContext(FlashphonerContext);

  const { conferees } = useContext(ConfereeContext);

  const currentUrl = new URL(window.location.href);
  const roomUid = currentUrl.searchParams.get("room");

  // hand up stream
  const [handUpStreamName, setHandUpStreamName] = useState(null);

  const [handUp, setHandUp] = useState(false);
  const [isMyHandStreamLive, setIsMyHandStreamLive] = useState(false);
  const prevIsMyHandStreamLive = usePrevious(isMyHandStreamLive);
  const [isMuted, setIsMuted] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [isMobileHandUp, setIsMobileHandUp] = useState(false);

  useEffect(() => {
    if (!isLogged) {
      Modal.warning({
        title: "Ошибка:",
        content:
          "Недостаточно прав для входа на страницу! Для правильного входа необходимо использовать короткую ссылку, выданную Вашим чат-ботом.",
        okButtonProps: {
          hidden: "hidden",
        },
      });
    }
    const init = async () => {
      !isSocketConnected() && connectToSocket(roomUid, "_p", true);
    };
    init();
    return () => {
      // disconnect on unmount
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (document.getElementById("root").offsetWidth > 767) {
      setIsMobileHandUp(false);
    } else setIsMobileHandUp(true);

    window.addEventListener("resize", () => {
      if (document.getElementById("root").offsetWidth > 767) {
        setIsMobileHandUp(false);
      } else setIsMobileHandUp(true);
    });

    return () => {
      window.removeEventListener("resize", () => {
        if (document.getElementById("root").offsetWidth > 767) {
          setIsMobileHandUp(false);
        } else setIsMobileHandUp(true);
      });
    };
  }, [isMobileHandUp]);

  useEffect(() => {
    setIsSecVideoActive(
      syncObject?.streams?.broadcasting &&
        (!!syncObject?.streams?.advanced?.output ||
          !!handUpStreamName ||
          isMyHandStreamLive)
    );
  }, [
    syncObject?.streams?.broadcasting,
    syncObject?.streams?.advanced?.output,
    handUpStreamName,
    isMyHandStreamLive,
  ]);

  useEffect(() => {
    if (isUserExist && !terminate) {
      setIsModalVisible(true);
    }
  }, [isUserExist]);

  useEffect(() => {
    if (terminate) {
      publishSession && publishSession.disconnect();
      resetSyncObj();
    }
  }, [terminate]);

  useEffect(() => {
    if (created) {
      console.log("Start syncing");
      playerIndexAction(roomUid);
    }
  }, [created]);

  // handle streams changes
  useEffect(() => {
    // reset hand up
    if (!syncObject?.streams?.broadcasting) {
      setHandUp(false);
    } else {
      setIsMuted(true);
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

    // reset hand up
    if (!syncObject?.states?.hand_up) {
      setHandUp(false);
    }

    // if I am a hand up streamer
    setIsMyHandStreamLive(syncObject?.users[profile?.userUid]?.is_live);
  }, [syncObject, syncObject?.users, syncObject?.states]);

  // reset hand up if user's live is finished
  useEffect(() => {
    if (prevIsMyHandStreamLive && !isMyHandStreamLive) {
      setHandUp(false);
    }
  }, [isMyHandStreamLive, prevIsMyHandStreamLive]);

  const onChatButtonClick = () => {
    !isMyHandStreamLive && setHandUp(false);
    openChat();
  };

  // RENDERERS
  const { cn } = useClassName("autoplay");

  const renderMyHandUpStream = () => {
    return (
      <div className={cn("myHandup", { active: isMyHandStreamLive })}>
        <div id={"streamer"} />
      </div>
    );
  };

  const renderHandUpStream = () => {
    return (
      <div
        className={cn("handup", {
          active: !!handUpStreamName && !isMyHandStreamLive,
        })}
      >
        <HandUpPlayer
          streamName={handUpStreamName}
          muted={isMyHandStreamLive ? true : isMuted}
          roomUid={roomUid}
        />
      </div>
    );
  };

  const renderMainStream = () => (
    <div className={cn("blurWrap")}>
      {renderPlay()}
      <div className={cn("blur", { active: isMuted })}>
        <Player
          streamName={syncObject?.streams?.main?.output}
          width={syncObject?.streams?.main?.width}
          height={syncObject?.streams?.main?.height}
          input={syncObject?.streams?.main?.input}
          isPlaying
          muted={isMuted}
        />
      </div>
    </div>
  );

  const renderAdvancedStream = () => (
    <Player
      streamName={syncObject?.streams?.advanced?.output}
      width={syncObject?.streams?.advanced?.width}
      height={syncObject?.streams?.advanced?.height}
      input={syncObject?.streams?.advanced?.input}
      isPlaying
      muted={isMuted}
    />
  );

  const renderPlay = () =>
    !isMuted ? null : (
      <div className={cn("play")}>
        Для начала нажмите кнопку
        <Button
          type={"primary"}
          className={cn("play-btn")}
          onClick={() => {
            setIsMuted(false);
          }}
        >
          Начать
        </Button>
      </div>
    );

  if (isModalVisible) {
    return (
      <div id={"playerContent"}>
        <Modal
          visible={isModalVisible}
          maskClosable={false}
          onCancel={() => {
            setIsModalVisible(false);
            setTerminate(true);
            setIsErrorModalVisible(true);
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setIsModalVisible(false);
                setTerminate(true);
                setIsErrorModalVisible(true);
              }}
            >
              Отмена
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                setIsModalVisible(false);
                disconnectPreviousUser(roomUid, profile?.userUid, "_p");
              }}
            >
              Продолжить
            </Button>,
          ]}
        >
          <Result
            status={"warning"}
            title={"Внимание!"}
            subTitle="Трансляция уже воспроизводится на другом устройстве. Отключить и продолжить на этом?"
          />
        </Modal>
      </div>
    );
  } else if (terminate && isUserExist) {
    return (
      <div id={"playerContent"}>
        <Modal
          visible={isErrorModalVisible || (terminate && isUserExist)}
          maskClosable={false}
          onCancel={() => {
            window.location.reload();
          }}
          closable={false}
          footer={[
            <Button type="primary" onClick={() => window.location.reload()}>
              Обновить
            </Button>,
          ]}
        >
          <Result
            status="error"
            title="Отказ в доступе"
            subTitle="Трансляция уже воспроизводится на другом устройстве."
          />
        </Modal>
      </div>
    );
  } else if (!isUserExist || isUserExist !== null) {
    return (
      <div className="table full-height margin-0" id="playerContent">
        <ChatProvider>
          <div className="table-tr playerContent-rowTop">
            <div className="table-td playerContent-columnLeft">
              <div
                className="bg-color padding-0 video-wrap video-wrap-16x9"
                id="video-prim"
              >
                {syncObject?.streams?.broadcasting &&
                syncObject?.streams?.main?.output ? (
                  renderMainStream()
                ) : (
                  <NoStream />
                )}
              </div>

              <div
                className={"bg-color scroll-y v-align-middle player-userlist"}
                id="playerUserList1"
              >
                <div className="table full-height margin-0">
                  <div className="table-tr full-height column">
                    <div className="table-td w-40 p-r-10 p-t-10 text-white boxStreamInfo-container">
                      {Object.keys(syncObject?.users).length > 0 && (
                        <div className="boxStreamInfo">
                          <UserIcon />
                          {` ${Object.keys(syncObject?.users).length}`}
                        </div>
                      )}
                    </div>

                    <div className="table-td padding-5 v-align-middle full-height h-align-middle">
                      <Conferee type="list" list={conferees} displayCount={5} />
                    </div>
                  </div>
                </div>
              </div>

              <div id="playerUserList1-spacer"></div>
            </div>

            <div className="table-td playerContent-columnRight">
              <div
                id="video-sec"
                className={cn("wrapAdvancedStream", {
                  active: isSecVideoActive,
                })}
              >
                <div className="bg-color padding-0 video-wrap video-wrap-16x9">
                  <div className="video-wrap-proportion"></div>
                  <div className={cn("wrapAdvancedStreamProportion")}>
                    {renderPlay()}
                    <div className={cn("blur", { active: isMuted })}>
                      {renderMyHandUpStream()}
                      {!isMyHandStreamLive && renderHandUpStream()}
                      {syncObject?.streams?.broadcasting &&
                        syncObject?.streams?.advanced?.output &&
                        renderAdvancedStream()}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={"bg-color scroll-y v-align-middle player-userlist"}
                id="playerUserList2"
              >
                <div className="table full-height margin-0">
                  <div className="table-tr full-height">
                    <div className="table-td w-40 p-r-10 p-t-10 v-align-top align-right text-white boxStreamInfo-container">
                      {Object.keys(syncObject?.users).length > 0 && (
                        <div className="boxStreamInfo">
                          <UserIcon />
                          {` ${Object.keys(syncObject?.users).length}`}
                        </div>
                      )}
                    </div>

                    <div className="table-td padding-5 v-align-middle h-align-middle full-height">
                      <Conferee type="list" list={conferees} displayCount={5} />
                    </div>
                  </div>
                </div>
              </div>

              <Chat
                roomId={syncObject?.states?.chat_id}
                inputEnabled={syncObject?.states?.chat}
                type="history"
              />
            </div>
          </div>
          <div className="table-tr playerContent-rowBottom">
            <div className="table-td playerContent-columnLeft">
              <div
                className="bg-color align-left player-buttonlist"
                id="playerButtonList"
              >
                <div className="player-buttonlist-left">
                  {!isMuted && (
                    <RenderHandUp
                      handUp={handUp}
                      isMyHandStreamLive={isMyHandStreamLive}
                      profile={profile}
                      roomUid={roomUid}
                      setHandUp={setHandUp}
                      syncObject={syncObject}
                    />
                  )}
                </div>

                <div className="player-buttonlist-right">
                  <FullScreenButton isActive={false} />
                  <Button
                    type="primary"
                    onClick={onChatButtonClick}
                    className="control-chat"
                  >
                    {isMobileChatActive ? (
                      <i className="fa fa-video-camera"></i>
                    ) : (
                      <i className="fa fa-comment"></i>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="table-td playerContent-columnRight">
              <div className="bg-color" id="chatlist-controls">
                <Chat
                  roomId={syncObject?.states?.chat_id}
                  inputEnabled={syncObject?.states?.chat}
                  type="input"
                />
              </div>
            </div>
          </div>
        </ChatProvider>
      </div>
    );
  } else {
    return (
      <div id={"playerContent"}>
        <div id={"video-prim"}></div>
      </div>
    );
  }
};

export default AutoplayPage;
