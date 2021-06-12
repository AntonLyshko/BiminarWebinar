import "./index.scss";
import React, { useState, useEffect, useContext } from "react";

import Flashphoner from "@flashphoner/websdk";
import Popover from "antd/es/popover";

import { InfoIcon, VideoSlashIcon } from "../../assets/icons";
import { useClassName } from "../../hooks";
import { useVideoPlayer } from "../../hooks/useVideoPlayer";
import { FlashphonerContext } from "../../providers/FlashphonerProvider";
import { SyncContext } from "../../providers/SyncProvider";
import { ControlsAudio } from "../Player/ControlsAudio";
import { ControlsVideo } from "../Player/ControlsVideo";

const { SESSION_STATUS, STREAM_STATUS } = Flashphoner.constants;

const HandUpPlayer = ({ streamName, showControls = true, muted = false }) => {
  const { syncObject } = useContext(SyncContext);

  const {
    stream,
    setStream,
    videoContainer,
    videoContainerWrapper,
    isShowControls,
    audioState,
    videoState,
    setMute,
    switchAudio,
    switchVideo,
  } = useVideoPlayer();

  const [handUpPlayerStats, setHandUpPlayerStats] = useState({});
  const [isStatsVisible, setIsStatsVisible] = useState(false);

  const { playSession, createPlaySession } = useContext(FlashphonerContext);

  const getVideoWidth = () => {
    const width = syncObject?.streams?.main?.width;
    const height = syncObject?.streams?.main?.height;
    if (
      videoContainerWrapper.current.offsetWidth * 2 > width ||
      videoContainerWrapper.current.offsetHeight * 2 > height
    ) {
      return width;
    } else return videoContainerWrapper.current?.offsetWidth * 2;
  };

  const getVideoHeight = () => {
    const width = syncObject?.streams?.main?.width;
    const height = syncObject?.streams?.main?.height;
    if (
      videoContainerWrapper.current.offsetWidth * 2 > width ||
      videoContainerWrapper.current.offsetHeight * 2 > height
    ) {
      return height;
    } else return videoContainerWrapper.current.offsetHeight * 2;
  };

  const playStream = (session) => {
    if (streamName && !stream && videoContainerWrapper.current) {
      const constrains = {
        name: streamName,
        display: videoContainerWrapper.current,
        remoteVideo: videoContainer.current,
        constraints: {
          audio: true,
          video: {
            width: getVideoWidth(),
            height: getVideoHeight(),
          },
          transport: "TCP",
        },
      };

      console.log("HandUpPlayer constrains: ", constrains);
      console.warn("Hand Up Player create stream");
      const newStream = session.createStream(constrains);
      setStream(newStream);

      newStream
        .on(STREAM_STATUS.PENDING, () => {
          //PENDING
        })
        .on(STREAM_STATUS.FAILED, () => {
          setStream(null);
          console.log("[HandUpPlayer]: STREAM_STATUS ", STREAM_STATUS.FAILED);
        })
        .on(STREAM_STATUS.NEW, () => {})
        .on(STREAM_STATUS.PAUSED, () => {
          console.log("[HandUpPlayer]: STREAM_STATUS ", STREAM_STATUS.PAUSED);
        })
        .on(STREAM_STATUS.STOPPED, () => {
          console.log("[HandUpPlayer]: STREAM_STATUS ", STREAM_STATUS.STOPPED);
        })
        .on(STREAM_STATUS.PUBLISHING, function () {
          console.log(
            "[HandUpPlayer]: STREAM_STATUS ",
            STREAM_STATUS.PUBLISHING
          );
        })
        .on(STREAM_STATUS.UNPUBLISHED, () => {
          console.log(
            "[HandUpPlayer]: STREAM_STATUS ",
            STREAM_STATUS.UNPUBLISHED
          );
        })
        .on(STREAM_STATUS.PLAYING, (stream) => {
          setInterval(() => {
            stream.getStats(function (stats) {
              if (stats && stats.inboundStream) {
                if (stats.inboundStream.video) {
                  setHandUpPlayerStats(stats.inboundStream.video);
                }
              }
            });
          }, 2000);

          console.log("[HandUpPlayer]: STREAM_STATUS ", STREAM_STATUS.PLAYING);
        });

      isStreamAvailable(newStream);
    }
  };

  const isStreamAvailable = (stream) => {
    stream
      .available()
      .then(() => {
        console.log("stream is available", stream);
        console.log("stream.status", stream.status());
        stream.play();
      })
      .catch((error) => {
        stream.status() !== STREAM_STATUS.PLAYING &&
          setTimeout(() => isStreamAvailable(stream), 1500);
      });
  };

  // EFFECTS
  useEffect(() => {
    streamName && !playSession && createPlaySession();
    return () => {
      setIsStatsVisible(false);
    };
  }, [streamName]);

  useEffect(() => {
    if (playSession?.status() === SESSION_STATUS.ESTABLISHED) {
      playStream(playSession);
    }
  }, [streamName, playSession]);

  useEffect(() => setMute(muted), [muted]);
  // RENDERERS

  const { cn } = useClassName("playerStream");

  return (
    <div className={cn("playerStream")}>
      <Popover
        content={
          <div className={cn("popover-content")}>
            <h3>Main player stream</h3>
            {Object.keys(handUpPlayerStats).map((key) => (
              <div key={`handUpPlayer_${key}`}>
                {key}: {handUpPlayerStats[key]}
              </div>
            ))}
          </div>
        }
        trigger="click"
        placement="topLeft"
        visible={isStatsVisible}
        className={cn("main_setting_popover")}
      >
        <div
          className={cn("main_setting_btn")}
          onClick={() => setIsStatsVisible(!isStatsVisible)}
        >
          <InfoIcon />
        </div>
      </Popover>

      {isShowControls && (
        <div className={cn("controls")}>
          {streamName && (
            <>
              <ControlsVideo show={videoState} onSwitch={switchVideo} />
              <ControlsAudio show={audioState} onSwitch={switchAudio} />
            </>
          )}
        </div>
      )}
      <div ref={videoContainerWrapper} className={"video-wrap video-wrap-16x9"}>
        <div className="video-wrap-proportion"></div>
        {!videoState && (
          <div className={cn("video-cancel")}>
            <VideoSlashIcon />
            <p>Видео отключено</p>
          </div>
        )}
        <div className={cn("video")}>
          <video ref={videoContainer} autoPlay playsInline></video>
        </div>
      </div>
    </div>
  );
};

export default HandUpPlayer;
