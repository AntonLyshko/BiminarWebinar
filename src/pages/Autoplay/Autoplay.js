import React from "react";

import ChatStateProvider from "../../providers/Chat/ChatStateProvider";
import ConfereeProvider from "../../providers/Conferee/ConfereeProvider";
import RandomAvatarsProvider from "../../providers/RandomAvatarProvider";
import SecondaryVideoProvider from "../../providers/SecondaryVideoProvider";
import SyncProvider from "../../providers/SyncProvider";

import AutoplayPage from "./AutoplayPage";

const Autoplay = ({ isLogged }) => {
  return (
    <SecondaryVideoProvider>
      <ConfereeProvider>
        <SyncProvider>
          <ChatStateProvider>
            <RandomAvatarsProvider>
              <AutoplayPage isLogged={isLogged} />
            </RandomAvatarsProvider>
          </ChatStateProvider>
        </SyncProvider>
      </ConfereeProvider>
    </SecondaryVideoProvider>
  );
};

export default Autoplay;
