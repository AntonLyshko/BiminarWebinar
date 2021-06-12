import "./index.scss";
import React, { useRef, useState, useLayoutEffect, useCallback } from "react";

import Flashphoner from "@flashphoner/websdk";

import { SettingsIcon } from "../../assets/icons";
import { useClassName } from "../../hooks";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import Spiner from "../../ui/Spiner/Spiner";

import HandUpSettings from "./HandUpSettings";

const { STREAM_STATUS } = Flashphoner.constants;

const EMPTY_DEVICE = {
  value: "",
  label: "Не выбрано",
};

const HandUp = ({
  handUp,
  startTranslation,
  streamName,
  isMyHandStreamLive,
  stream,
  pending,
}) => {
  const { cn } = useClassName("minitest");

  const [audio, setAudio] = useLocalStorage("audioDevice", EMPTY_DEVICE);
  const [video, setVideo] = useLocalStorage("videoDevice", EMPTY_DEVICE);
  const [optionsAudio, setOptionsAudio] = useState([]);
  const [optionsVideo, setOptionsVideo] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const videoContainer = useRef(null);

  useLayoutEffect(() => {
    if (streamName) {
      if (handUp && !pending) {
        Flashphoner.getMediaDevices(null, true).then((list) => {
          let audioList = {};
          let videoList = {};

          if (list.audio && list.audio.length > 0) {
            audioList = setOptionList(list.audio, setOptionsAudio, setAudio);
          } else {
            return;
          }

          if (list.video && list.video.length > 0) {
            videoList = setOptionList(list.video, setOptionsVideo, setVideo);
          } else {
            return;
          }

          console.log("audioDevice = ", audio.value);
          console.log("videoDevice = ", video.value);

          if (!audio.value || !video.value) {
            setSettingsOpen(true);
          } else if (videoContainer.current) {
            startTranslation(
              audioList.selected,
              videoList.selected,
              videoContainer.current,
              streamName
            );
          }
        });
      }
    } else {
      console.warn("Couldn't get userUid");
    }

    return () => {
      setSettingsOpen(false);
    };
  }, [handUp, pending]);

  const setOptionList = (list, setOptions, setDevice) => {
    let deviceList = [];
    let selected = false;

    list.map((item) => {
      // проверяет выбрано ли какое-то устр-во и есть ли что-то из устройств в куках
      // если в куках пусто то сетим первое уйстройство из списка
      // если в  куках есть устр-ва то проверяем каждое из списка имеющихся с кукой и если устройство
      // есть в списке то сетим его
      if (!selected || audio.value === item.id || video.value === item.id) {
        if (audio.value === item.id) {
          setAudio({ value: item.id, label: item.label });
        } else if (video.value === item.id) {
          setVideo({ value: item.id, label: item.label });
        } else if (!selected) {
          setDevice({ value: item.id, label: item.label });
        }
        selected = { value: item.id, label: item.label };
      }
      deviceList.push({ value: item.id, label: item.label });
    });
    setOptions([...deviceList]);

    return { list: deviceList, selected: selected };
  };

  const onSettingsChangeVideo = useCallback(
    (device) => {
      console.log("handleVideoChange device: ", device);
      if (stream?.status() === STREAM_STATUS.PUBLISHING) {
        try {
          console.log("handleVideoChange stream: ", stream);
          stream.switchCam(device.value);
        } catch (e) {
          console.log(e);
        }
      }

      setVideo(device);
    },
    [stream]
  );

  const onSettingsChangeAudio = useCallback(
    (device) => {
      console.log("handleAudioChange device: ", device);
      if (stream?.status() === STREAM_STATUS.PUBLISHING) {
        try {
          console.log("handleAudioChange stream: ", stream);
          stream.switchMic(device.value);
        } catch (e) {
          console.log(e);
        }
      }

      setAudio(device);
    },
    [stream]
  );

  const onSettingsClose = () => {
    if (!isMyHandStreamLive && stream?.name() !== streamName) {
      console.warn("Translation start after settings btn click");
      startTranslation(audio, video, videoContainer.current, streamName);
    }

    setSettingsOpen(false);
  };

  return (
    <>
      <div className={"video-wrap video-wrap-16x9"}>
        <span
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={cn("setting-btn")}
        >
          <SettingsIcon />
        </span>

        {(pending || stream?.status() !== STREAM_STATUS.PUBLISHING) && (
          <Spiner className={cn("loader", ["spin-xs"])} />
        )}

        {settingsOpen && (
          <HandUpSettings
            audio={audio}
            video={video}
            optionsAudio={optionsAudio}
            optionsVideo={optionsVideo}
            onChangeAudio={onSettingsChangeAudio}
            onChangeVideo={onSettingsChangeVideo}
            onClose={onSettingsClose}
          />
        )}

        <>
          <div className="video-wrap-proportion"></div>
          <div className={cn("video-wrap")}>
            <div
              ref={videoContainer}
              className={cn("video", { active: !pending })}
            />
          </div>
        </>
      </div>
    </>
  );
};

export default HandUp;
