import React, { useContext, Suspense, Fragment } from "react";

import Comment from "antd/es/comment";
import dayjs from "dayjs";

import { useClassName } from "../../../hooks";
import { RandomAvatarsContext } from "../../../providers/RandomAvatarProvider";
import { UserContext } from "../../../providers/UserProvider";
import { Avatar } from "../../../ui";

import "./MessageChat.scss";

const MessageChat = React.memo(
  ({ content, timestamp, user, time, mine = null, avatars = null }) => {
    const { cn } = useClassName("message-chat");
    const { profile } = useContext(UserContext);
    const { generate, initials } = useContext(RandomAvatarsContext);

    return (
      <div className={`${cn({ mine: user.cuid === profile.cuid })} `}>
        <Suspense fallback={<Fragment>Loading...</Fragment>}>
          <Avatar
            className={cn("avatar")}
            size={38}
            src={user.avatarURL}
            initials={initials(user.username)}
            defaultAvatar={generate(user.cuid)}
          />

          <Comment
            className={cn("content")}
            author={
              <span className={cn("username")}>
                {user.username} {dayjs(time).format("HH:mm:ss")}
              </span>
            }
            content={<p>{content}</p>}
          />
        </Suspense>
      </div>
    );
  }
);

export default MessageChat;
