import React, { useState, useContext, useEffect } from "react";

import Button from "antd/es/button";
import Popover from "antd/es/popover";
import { browser } from "detectrtc";

import HandIcon from "../../assets/icons/HandIcon";
import VideoIcon from "../../assets/icons/VideoIcon";
import PRELOADER_URL from "../../assets/media/preloader.mp4";
import { useClassName } from "../../hooks";
import "../Player/index.scss";
import { FlashphonerContext } from "../../providers/FlashphonerProvider";
import { SecondaryVideoContext } from "../../providers/SecondaryVideoProvider";
import { SyncContext } from "../../providers/SyncProvider";

import Flashphoner from "@flashphoner/websdk";

import { generateHandUpStreamName } from "../../utils/streamName";

import HandUpPortal from "./HandUpPortal";

import HandUp from "./index";
const { SESSION_STATUS, STREAM_STATUS } = Flashphoner.constants;

const RenderHandUp = ({
  profile,
  handUp,
  setHandUp,
  syncObject,
  isMyHandStreamLive,
  roomUid,
}) => {
  const { cn } = useClassName("autoplay");
  const [stream, setStream] = useState(null);

  const { updateSyncAction } = useContext(SyncContext);

  const { publishSession, createPublishSession } = useContext(
    FlashphonerContext
  );
  const { isMobileChatActive, openChat } = useContext(SecondaryVideoContext);

  const handUpButtonClick = () => {
    !handUp && isMobileChatActive && openChat();
    !isMyHandStreamLive && !handUp && !publishSession && createPublishSession();
    !isMyHandStreamLive &&
      handUp &&
      publishSession &&
      publishSession.disconnect();
    !isMyHandStreamLive && setHandUp(!handUp);
  };

  const userUid = profile?.userUid;

  function getOptionsHandUpStream(
    audioId,
    videoId,
    videoContainer,
    streamName
  ) {
    const constraints = {
      video: {
        deviceId: videoId.value,
        width: browser.isSafari ? 640 : 320,
        height: browser.isSafari ? 360 : 180,
        frameRate: 30,
      },
      audio: {
        deviceId: audioId.value,
      },
      cacheLocalResources: true,
      receiveVideo: false,
      receiveAudio: false,
    };

    const mediaConnectionConstraints = {
      mandatory: {
        googCpuOveruseDetection: false,
      },
    };

    return {
      record: false,
      name: streamName,
      display: videoContainer,
      constraints: constraints,
      mediaConnectionConstraints: mediaConnectionConstraints,
    };
  }

  const startTranslation = (audioId, videoId, videoContainer, streamName) => {
    //check if we already have session
    if (browser.isSafari) {
      Flashphoner.playFirstVideo(videoContainer, true, PRELOADER_URL).then(
        () => {
          publishStream(
            publishSession,
            audioId,
            videoId,
            videoContainer,
            streamName
          );
        }
      );
    } else {
      publishStream(
        publishSession,
        audioId,
        videoId,
        videoContainer,
        streamName
      );
    }
  };

  const publishStream = (
    session,
    audioId,
    videoId,
    videoContainer,
    streamName
  ) => {
    if (session.status() !== SESSION_STATUS.ESTABLISHED) {
      return;
    }

    const options = getOptionsHandUpStream(
      audioId,
      videoId,
      videoContainer,
      streamName
    );
    console.log("HAND UP constraints: ", options);

    const stream = session.createStream(options);
    stream
      .on(STREAM_STATUS.FAILED, (stream) => {
        console.log("HandUP STREAM_STATUS FAILED - ", stream.getInfo());
        console.log(stream.name());
        setStream(null);
        updateSyncAction(roomUid, {
          users: { [profile?.userUid]: { hand_up: false, is_live: false } },
        });
        // session.disconnect();
      })
      .on(STREAM_STATUS.STOPPED, () => {
        updateSyncAction(roomUid, {
          users: { [profile?.userUid]: { hand_up: false, is_live: false } },
        });
        // session.disconnect();
        console.log("HandUP STREAM_STATUS ", STREAM_STATUS.STOPPED);
      })
      .on(STREAM_STATUS.UNPUBLISHED, () => {
        updateSyncAction(roomUid, {
          users: { [profile?.userUid]: { hand_up: false, is_live: false } },
        });
        // session.disconnect();
        console.log("HandUP STREAM_STATUS ", STREAM_STATUS.UNPUBLISHED);
      })
      .on(STREAM_STATUS.PUBLISHING, () => {
        !isMyHandStreamLive &&
          updateSyncAction(roomUid, {
            users: { [profile?.userUid]: { hand_up: true } },
          });
      })
      .on(STREAM_STATUS.PLAYING, () => {
        console.log("HandUP STREAM_STATUS ", STREAM_STATUS.PLAYING);
      })
      .publish();

    setStream(stream);
  };

  useEffect(() => {
    // Destroy session for remove capture audio and video
    if (!isMyHandStreamLive && !handUp) {
      publishSession && publishSession.disconnect();
    }
  }, [isMyHandStreamLive, handUp]);

  return (
    <Popover
      content={
        <HandUp
          stream={stream}
          handUp={handUp}
          startTranslation={startTranslation}
          streamName={roomUid + userUid}
          pending={publishSession?.status() !== SESSION_STATUS.ESTABLISHED}
          isMyHandStreamLive={isMyHandStreamLive}
        />
      }
      trigger="click"
      placement="topLeft"
      visible={!isMyHandStreamLive && handUp}
    >
      {isMyHandStreamLive && (
        <HandUpPortal>
          <HandUp
            stream={stream}
            handUp={handUp}
            startTranslation={startTranslation}
            streamName={generateHandUpStreamName(roomUid, userUid)}
            pending={publishSession?.status() !== SESSION_STATUS.ESTABLISHED}
            isMyHandStreamLive={isMyHandStreamLive}
          />
        </HandUpPortal>
      )}
      <Button
        className={cn("wrap__button__hand", {
          active: syncObject?.states?.hand_up,
        })}
        type="primary"
        danger={isMyHandStreamLive}
        disabled={!syncObject.states.hand_up}
        onClick={handUpButtonClick}
      >
        {isMyHandStreamLive ? (
          <VideoIcon className={cn("wrap__button__icon")} />
        ) : (
          <HandIcon className={cn("wrap__button__icon")} />
        )}
        {isMyHandStreamLive
          ? "Вы в эфире"
          : handUp
          ? "Убрать руку"
          : "Поднять руку"}
      </Button>
    </Popover>
  );
};

export default RenderHandUp;
