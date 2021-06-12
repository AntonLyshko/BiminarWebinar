import React from "react";
import Button from "antd/es/button";
import { VideoIcon } from "../../assets/icons";
import VideoSlashIcon from "../../assets/icons/VideoSlashIcon";
import { useClassName } from "../../hooks";

type TProps = {
  show: boolean;
  onSwitch: () => void;
};

export function ControlsVideo({ show, onSwitch }: TProps) {
  const { cn } = useClassName("playerStream");

  return (
    <Button
      type="primary"
      className={cn("mute", { muted: !show })}
      onClick={onSwitch}
      shape="round"
    >
      {show ? <VideoIcon /> : <VideoSlashIcon/>}
    </Button>
  );
}
