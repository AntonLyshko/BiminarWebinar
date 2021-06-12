import React from "react";

import Select from "antd/es/select";

import { AudioIcon, VideoIcon } from "../../assets/icons";
import { useClassName } from "../../hooks";
import Button from "../../ui/Button/Button";

const HandUpSettings = ({
  audio,
  video,
  optionsAudio,
  optionsVideo,
  onChangeVideo,
  onChangeAudio,
  onClose,
}) => {
  const { cn } = useClassName("minitest");

  return (
    <div className={cn("settings")}>
      <div>
        <VideoIcon />
        <Select
          value={video}
          size={"small"}
          labelInValue
          options={optionsVideo}
          onChange={onChangeVideo}
          className="wrap-react-select"
        />
      </div>

      <div>
        <AudioIcon />
        <Select
          labelInValue
          value={audio}
          size={"small"}
          options={optionsAudio}
          onChange={onChangeAudio}
          className="wrap-react-select"
        />
      </div>

      <Button type={"primary"} onClick={onClose}>
        Применить
      </Button>
    </div>
  );
};

export default HandUpSettings;
