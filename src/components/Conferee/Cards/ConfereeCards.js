import React, { useEffect } from "react";

import { useClassName } from "../../../hooks";
import ConfereeCard from "../Cards/ConfereeCard";
import "./ConfereeCards.scss";

const ConfereeCards = (props) => {
  const { list, roomUid } = props;
  const { cn } = useClassName("conferee-cards");

  const somebodyIsLive = Object.values(list).some(
    (conferee) => conferee.is_live
  );

  return (
    <div className={cn()}>
      <div className={cn("wrap")}>
        {Object.keys(list).map((confereeKey, index) => (
          <ConfereeCard
            conferee={list[confereeKey]}
            uid={confereeKey}
            className={cn("item")}
            key={index}
            roomUid={roomUid}
            couldNotBeLive={somebodyIsLive && !list[confereeKey].isLive}
          />
        ))}
      </div>
    </div>
  );
};

export default ConfereeCards;
