import React, { useContext, useState } from "react";

import Tooltip from "antd/es/tooltip";

import { StopIcon, BanIcon, VideoIcon, HandIcon } from "../../../assets/icons";
import { useClassName } from "../../../hooks";
import { RandomAvatarsContext } from "../../../providers/RandomAvatarProvider";
import { SyncContext } from "../../../providers/SyncProvider";
import { Avatar } from "../../../ui";

import "./ConfereeCard.scss";

const ConfereeCard = (props) => {
  const { className, conferee, roomUid, couldNotBeLive, uid } = props;
  const { updateSyncAction, syncObject } = useContext(SyncContext);
  const { cn } = useClassName("conferee-card");
  const { generate, initials } = useContext(RandomAvatarsContext);
  const [hovered, setHovered] = useState(false);

  const onClick = () => {
    if (syncObject.states.hand_up) {
      if (conferee.hand_up && !conferee.is_live && !couldNotBeLive) {
        updateSyncAction(roomUid, { users: { [uid]: { is_live: true } } });
      } else if (conferee.hand_up && conferee.is_live) {
        updateSyncAction(roomUid, {
          users: { [uid]: { is_live: false, hand_up: false } },
        });
      }
    }
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const renderCard = () => (
    <div
      className={cn(
        "",
        {
          "is-hand-up": conferee.hand_up,
          "is-live": conferee.is_live,
          "is-banned": conferee.is_banned,
          "is-hover": hovered,
        },
        [className]
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div className={cn("actions")}>
        {conferee.hand_up && !conferee.is_live && <HandIcon />}

        {conferee.is_live && !hovered && <VideoIcon />}

        {conferee.is_live && hovered && <StopIcon className="icon-stop" />}

        {conferee.is_banned && <BanIcon />}
      </div>
      <div className={cn("wrap")}>
        <Avatar
          className={cn("avatar")}
          src={conferee.avatar}
          initials={initials(conferee.full_name)}
          defaultAvatar={generate(conferee.core_user_id)}
        />
        <div className={cn("full-name")}>
          {conferee.full_name.split(" ").map((partName) => (
            <div key={partName}>{partName}</div>
          ))}
        </div>
      </div>
    </div>
  );

  return conferee.isHandUp && couldNotBeLive ? (
    <Tooltip
      placement="topLeft"
      title="Не может быть выведен в эфир пока выступает другой пользователь"
      trigger="hover"
    >
      {renderCard()}
    </Tooltip>
  ) : (
    renderCard()
  );
};

export default ConfereeCard;
