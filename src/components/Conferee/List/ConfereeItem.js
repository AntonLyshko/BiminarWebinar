import React, { useContext, useState } from "react";

import { useClassName } from "../../../hooks";
import "./ConfereeItem.scss";
import { RandomAvatarsContext } from "../../../providers/RandomAvatarProvider";
import { Avatar } from "../../../ui";
import { BanIcon, HandIcon, StopIcon, VideoIcon } from "../../../assets/icons";

import { Badge } from "antd";

const ConfereeItem = (props) => {
  const { className, conferee, uid } = props;
  const { cn } = useClassName("conferee-item");
  const { generate, initials } = useContext(RandomAvatarsContext);

  return (
    <Badge
      count={
        <div
          className={cn("actions", {
            active: conferee.is_live || conferee.hand_up,
          })}
        >
          {conferee.hand_up && !conferee.is_live && <HandIcon />}
          {conferee.is_live && <VideoIcon />}
        </div>
      }
    >
      <div
        className={cn(
          "",
          {
            "is-hand-up": conferee.hand_up,
            "is-live": conferee.is_live,
            active: conferee.is_live || conferee.hand_up,
          },
          ["ant-avatar ant-avatar-circle ant-user"]
        )}
      >
        <Avatar
          className={cn("avatar")}
          src={conferee.avatar}
          initials={initials(conferee.full_name)}
          defaultAvatar={generate(uid)}
        />
      </div>
    </Badge>
  );
};

export default ConfereeItem;
