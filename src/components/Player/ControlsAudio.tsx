import React from "react";
import Button from "antd/es/button";
import AudioIcon from "../../assets/icons/AudioIcon";
import AudioSlashIcon from "../../assets/icons/AudioSlashIcon";
import { useClassName } from "../../hooks";

type TProps = {
  show: boolean;
  onSwitch: () => void;
};

export function ControlsAudio({ show, onSwitch }: TProps) {
  const { cn } = useClassName("playerStream");

  return (
    <Button
      type="primary"
      className={cn("mute", { muted: !show })}
      onClick={onSwitch}
      shape="round"
    >
      {show ? <AudioIcon /> : <AudioSlashIcon />}
    </Button>
  );
}
