import "./index.scss";
import React, { useState, useEffect, useRef, useContext } from "react";

import Modal from "antd/es/modal/Modal";
import clsx from "clsx";

import VideoStreamSettings from "../../components/tabs/VideoStreamSettings";
import { FlashphonerContext } from "../../providers/FlashphonerProvider";
import { PublishContext } from "../../providers/PublishProvider";
import PublishPreloader from "../Skeleton/PublishPreloader";

const PublishPage = ({ isLogged }) => {
  const { publisherIndexAction, translationError } = useContext(PublishContext);
  const { publishSession, createPublishSession } = useContext(
    FlashphonerContext
  );

  const currentUrl = new URL(window.location.href);
  const roomUid = currentUrl.searchParams.get("room");
  const unmounted = useRef(false);

  const [activeTab, setActiveTab] = useState(1);
  const [roomSession, setRoomSession] = useState({
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
        input: "",
        output: "",
      },
      advanced: {
        input: "",
        output: "",
      },
    },
    // users: {},
    states: {
      chat: true,
    },
    // stats: {
    //     countParticipants: 0,
    //     countChatMessages: 0,
    // },
    chat: {},
  });

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
    } else {
      if (roomUid) {
        publisherIndexAction(roomUid).then(() => {
          if (translationError) {
            Modal.warning({
              title: "Ошибка:",
              content: "Комната не найдена",
              okButtonProps: {
                hidden: "hidden",
              },
            });
          }
        });
      }
    }

    return () => {
      unmounted.current = true;
    };
  }, [translationError]);

  useEffect(() => {
    !publishSession && createPublishSession();
  }, []);

  if (!publishSession) {
    return <PublishPreloader />;
  }

  return (
    <div className="container clearfix">
      <div className={"boxTabSwitches"}>
        <div
          className={clsx("tabSwitchesItem", {
            tabSwitchesItemActive: activeTab === 1,
          })}
          onClick={() => setActiveTab(1)}
        >
          Настройка видео потоков
        </div>
      </div>
      <div className={"boxTabs"}>
        <div className={clsx({ hidden: activeTab !== 1 })}>
          <VideoStreamSettings
            session={publishSession}
            roomSession={roomSession}
            setRoomSession={setRoomSession}
            roomUid={roomUid}
            publisherIndexAction={publisherIndexAction}
          />
        </div>
      </div>
      {/*<div className={'mediaInfo'}></div>*/}
    </div>
  );
};

export default PublishPage;
