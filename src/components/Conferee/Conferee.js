import React from "react";

import ConfereeCards from "./Cards/ConfereeCards";
import ConfereeList from "./List/ConfereeList";

const Conferee = (props) => {
  switch (props.type) {
    case "list": {
      const { type, ...rest } = props;
      return <ConfereeList {...rest} />;
    }

    case "cards": {
      const { type, roomUid, ...rest } = props;
      return <ConfereeCards {...rest} roomUid={roomUid} />;
    }

    default:
      console.error("Not found Conferee component");
      return null;
  }
};

export default Conferee;
