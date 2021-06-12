import React from "react";

import ChatProvider from "../../providers/Chat/ChatProvider";
import ChatStateProvider from "../../providers/Chat/ChatStateProvider";
import ConfereeProvider from "../../providers/Conferee/ConfereeProvider";
import ControlProvider from "../../providers/Control";
import RandomAvatarsProvider from "../../providers/RandomAvatarProvider";
import SyncProvider from "../../providers/SyncProvider";

import ControlPage from "./ControlPage";

const Control = ({ isLogged }) => {
  return (
    <ConfereeProvider>
      <SyncProvider>
        <ChatStateProvider>
          <ChatProvider>
            <ControlProvider>
              <RandomAvatarsProvider>
                <ControlPage isLogged={isLogged} />
              </RandomAvatarsProvider>
            </ControlProvider>
          </ChatProvider>
        </ChatStateProvider>
      </SyncProvider>
    </ConfereeProvider>
  );
};

export default Control;
