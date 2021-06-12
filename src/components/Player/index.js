import "./index.scss";
import React, { useState, useEffect, useContext } from "react";

import Flashphoner from "@flashphoner/websdk";
import Popover from "antd/es/popover";
import { browser } from "detectrtc";

import { InfoIcon } from "../../assets/icons";
import VideoSlashIcon from "../../assets/icons/VideoSlashIcon";
import { useClassName } from "../../hooks";
import { useVideoPlayer } from "../../hooks/useVideoPlayer";
import { FlashphonerContext } from "../../providers/FlashphonerProvider";

import { ControlsAudio } from "./ControlsAudio";
import { ControlsVideo } from "./ControlsVideo";

const { SESSION_STATUS, STREAM_STATUS } = Flashphoner.constants;

const Player = ({
  streamName,
  width,
  height,
  input = "",
  isPlaying = false,
  muted = false,
}) => {
  const {
    setStream,
    videoContainer,
    videoContainerWrapper,
    isShowControls,
    videoState,
    audioState,
    setMute,
    switchAudio,
    switchVideo,
  } = useVideoPlayer();

  const [playerStats, setPlayerStats] = useState({});
  const [isStatsVisible, setIsStatsVisible] = useState(false);

  const { playSession, createPlaySession } = useContext(FlashphonerContext);

  const getVideoWidth = () => {
    if (
      videoContainerWrapper.current.offsetWidth * 2 > width ||
      videoContainerWrapper.current.offsetHeight * 2 > height
    ) {
      return width;
    } else return videoContainerWrapper.current.offsetWidth * 2;
  };

  const getVideoHeight = () => {
    if (
      videoContainerWrapper.current.offsetWidth * 2 > width ||
      videoContainerWrapper.current.offsetHeight * 2 > height
    ) {
      return height;
    } else return videoContainerWrapper.current.offsetHeight * 2;
  };

  const playStream = (session) => {
    if (!videoContainerWrapper.current) {
      return;
    }

    console.warn("|PLAYER| - play stream");
    let options = {
      name: streamName,
      display: videoContainerWrapper.current,
      remoteVideo: videoContainer.current,
      flashShowFullScreenButton: true,
      constraints: {
        audio: true,
        video: {
          //width: window.screen.width > 1280 ? 1280 : window.screen.width,
          //height: window.screen.height > 720 ? 720 : window.screen.height,
          //Блок 720х360 - видео 1280х720 -> начинается растягивание по ширине (если хотя бы одна выходит за пределы) -> В данном случае мы берем размеры самого видео
          //Блок 720х360 - видео 1920х1920 -> вписываемя в размеры исходного видео (если ниодна не выходит) -> В данном случае мы берем х2 размеры блока
          //width: videoContainer.current.offsetWidth > 960 ? 1920 : videoContainer.current.offsetWidth * 2,
          width: getVideoWidth(),
          height: getVideoHeight(),
        },
        transport: "TCP",
      },
    };

    if (!streamName) {
      console.error("playStream stream target not found in DOM");
      return false;
    }

    if (Flashphoner.getMediaProviders()[0] === "WSPlayer") {
      Flashphoner.playFirstSound();
      console.log("playFirstSound()");
    } else if (
      browser.isSafari ||
      Flashphoner.getMediaProviders()[0] === "MSE"
    ) {
      Flashphoner.playFirstVideo(videoContainer.current);
      console.log("playFirstVideo");
    }

    const newStream = session.createStream(options);
    setStream(newStream);
    let reconnectPlayerTimer = null;

    console.warn("Player create new stream");
    console.log("play stream options: ", options);

    newStream
      .on(STREAM_STATUS.PENDING, function (stream) {
        console.log("stream  PENDING");
      })
      .on(STREAM_STATUS.PLAYING, function (stream) {
        console.log("stream PLAYING");

        setInterval(() => {
          stream.getStats(function (stats) {
            if (stats && stats.inboundStream) {
              if (stats.inboundStream.video) {
                setPlayerStats(stats.inboundStream.video);
              }
            }
          });
        }, 2000);
      })
      .on(STREAM_STATUS.PAUSED, function () {
        console.log("stream PAUSED");
      })
      .on(STREAM_STATUS.PLAYBACK_PROBLEM, function () {
        console.log("stream PLAYBACK_PROBLEM");
      })
      .on(STREAM_STATUS.PUBLISHING, function () {
        console.log("stream PUBLISHING");
        clearTimeout(reconnectPlayerTimer);
      })
      .on(STREAM_STATUS.SNAPSHOT_COMPLETE, function () {
        console.log("stream SNAPSHOT_COMPLETE");
      })
      .on(STREAM_STATUS.UNPUBLISHED, function () {
        console.log("stream UNPUBLISHED");
        clearTimeout(reconnectPlayerTimer);
      })
      .on(STREAM_STATUS.STOPPED, function () {
        console.log("stream STOPPED");
        clearTimeout(reconnectPlayerTimer);
      })
      .on(STREAM_STATUS.FAILED, function (stream) {
        console.log("stream FAILED: ", stream.getInfo());
        reconnectPlayerTimer = setTimeout(playStream, 2000, session);
        console.log("after setTimeout", stream);
      })
      .on(STREAM_STATUS.NOT_ENOUGH_BANDWIDTH, function (stream) {
        console.log("stream NOT_ENOUGH_BANDWIDTH, status: ", stream.status());
        console.error(
          "Not enough bandwidth, consider using lower video resolution or bitrate. Bandwidth " +
            Math.round(stream.getNetworkBandwidth() / 1000) +
            " bitrate " +
            Math.round(stream.getRemoteBitrate() / 1000)
        );
      });

    isStreamAvailable(newStream);
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
  }, [playSession]);

  useEffect(() => setMute(muted), [muted]);
  // RENDERERS

  const { cn } = useClassName("playerStream");

  if (!streamName) {
    return null;
  }

  return (
    <div className={cn({ hidden: !streamName })}>
      <Popover
        content={
          streamName.includes("main") ? (
            <div className={cn("popover-content")}>
              <h3>Main player stream</h3>
              {Object.keys(playerStats).map((key) => (
                <div key={key}>
                  {key}: {playerStats[key]}
                </div>
              ))}
            </div>
          ) : (
            streamName.includes("advanced") && (
              <div className={cn("popover-content")}>
                <h3>Advanced player stream</h3>
                {Object.keys(playerStats).map((key) => (
                  <div key={key}>
                    {key}: {playerStats[key]}
                  </div>
                ))}
              </div>
            )
          )
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

      {isShowControls && isPlaying && (
        <div className={cn("controls")}>
          {streamName && (
            <>
              <ControlsVideo show={videoState} onSwitch={switchVideo} />
              {input !== "mute" && (
                <ControlsAudio show={audioState} onSwitch={switchAudio} />
              )}
            </>
          )}
        </div>
      )}

      <div className={"video-wrap video-wrap-16x9"}>
        <div className="video-wrap-proportion"></div>
        {!videoState && (
          <div className={cn("video-cancel")}>
            <VideoSlashIcon />
            <p>Видео отключено</p>
          </div>
        )}
        <div ref={videoContainerWrapper} className={cn("video")}>
          <video ref={videoContainer} autoPlay playsInline></video>
        </div>
      </div>
    </div>
  );
};

export default Player;
