import "./ConfereeList.scss";
import React, { useEffect, useContext } from "react";

import Tooltip from "antd/es/tooltip";

import { useClassName } from "../../../hooks";
import { ConfereeContext } from "../../../providers/Conferee/ConfereeProvider";

import ConfereeItem from "./ConfereeItem";

const ConfereeList = (props) => {
  const { list, displayCount } = props;
  const { cn } = useClassName("conferee-list");
  const { sortedUsers, setSortedDisplayLimit } = useContext(ConfereeContext);

  useEffect(() => {
    setSortedDisplayLimit(displayCount);
  }, [displayCount]);

  const items = Object.keys(list).map((uid) => {
    const conferee = list[uid];
    return (
      <Tooltip title={conferee.minFullName} key={uid}>
        <ConfereeItem conferee={conferee} uid={conferee.core_user_id} />
      </Tooltip>
    );
  });

  return <div className={cn()}>{items}</div>;
};

export default ConfereeList;
