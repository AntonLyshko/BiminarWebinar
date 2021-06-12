import React, { useState } from "react";

import { SmileFilled } from "@ant-design/icons";
import AntdAvatar from "antd/es/avatar";

import { useClassName } from "../../hooks";
import "./Avatar.scss";

const Avatar = React.memo(function Image({
  initials,
  size,
  src,
  className,
  defaultAvatar,
}) {
  const { cn } = useClassName("avatar");
  const [error, setError] = useState(false);

  if (src && !error) {
    return (
      <AntdAvatar
        icon={<SmileFilled />}
        src={src}
        className={cn("", [className])}
        size={size}
        onError={() => setError(true)}
      />
    );
  }

  const styles = {
    backgroundColor: defaultAvatar?.bgc,
    color: defaultAvatar?.color,
  };

  return (
    <div style={styles} className={cn("", [className])}>
      <span className={cn("initials")}>{initials}</span>
    </div>
  );
});

export default Avatar;
