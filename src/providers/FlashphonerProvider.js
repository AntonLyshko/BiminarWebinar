import React, { useState } from "react";

import Flashphoner from "@flashphoner/websdk";

import CONFIG from "../config";

const { SESSION_STATUS } = Flashphoner.constants;

export const FlashphonerContext = React.createContext({});

const FlashphonerProvider = ({ children }) => {
  const [playSession, setPlaySession] = useState(null);
  const [publishSession, setPublishSession] = useState(null);

  // const isSessionPublish = (session) =>
  //   session.getServerUrl() === CONFIG.BASE_PUBLISH_WCS_HOST;
  // const isSessionPlay = (session) =>
  //   session.getServerUrl() === CONFIG.BASE_PLAY_WCS_HOST;

  const init = () => {
    console.log("Flashphoner initialize");
    const extensionId = "nlbaajplpmleofphigmgaifhoikjmbkg";

    try {
      Flashphoner.init({
        screenSharingExtensionId: extensionId,
        flashMediaProviderSwfLocation:
          "../../utils/flashphoner/media-provider.swf",
      });
    } catch (e) {
      console.error(
        "Browser doesn't support Flash or WebRTC technology necessary for work of an example",
        e
      );
      alert(
        "Browser doesn't support Flash or WebRTC technology necessary for work of an example"
      );
    }
  };

  const createPublishSession = () => {
    let clearReconnect = null;

    //create session
    console.log("Create new session with url " + CONFIG.BASE_PUBLISH_WCS_HOST);
    Flashphoner.createSession({ urlServer: CONFIG.BASE_PUBLISH_WCS_HOST })
      .on(SESSION_STATUS.ESTABLISHED, function (flashSession) {
        console.log("session connected, status: ", flashSession.status());
        setPublishSession(flashSession);
        clearTimeout(clearReconnect);
      })
      .on(SESSION_STATUS.DISCONNECTED, function () {
        console.log(
          "Streamer session disconnected, status: ",
          SESSION_STATUS.DISCONNECTED
        );
        setPublishSession(null);
      })
      .on(SESSION_STATUS.FAILED, function () {
        console.log("Streamer session failed, status: ", SESSION_STATUS.FAILED);
        setPublishSession(null);
        clearReconnect = setTimeout(createPublishSession, 1000);
      });
  };

  const createPlaySession = () => {
    let clearReconnect = null;

    //create session
    console.log("Create new session with url " + CONFIG.BASE_PLAY_WCS_HOST);
    Flashphoner.createSession({ urlServer: CONFIG.BASE_PLAY_WCS_HOST })
      .on(SESSION_STATUS.ESTABLISHED, function (flashSession) {
        console.log("session connected, status: ", flashSession.status());
        setPlaySession(flashSession);
        clearTimeout(clearReconnect);
      })
      .on(SESSION_STATUS.DISCONNECTED, function () {
        console.log(
          "Streamer session disconnected, status: ",
          SESSION_STATUS.DISCONNECTED
        );
        setPlaySession(null);
        clearReconnect = setTimeout(createPlaySession, 1000);
      })
      .on(SESSION_STATUS.FAILED, function () {
        console.log("Streamer session failed, status: ", SESSION_STATUS.FAILED);
        setPlaySession(null);
        clearReconnect = setTimeout(createPlaySession, 1000);
      });
  };

  return (
    <FlashphonerContext.Provider
      value={{
        init,
        playSession,
        publishSession,
        createPublishSession,
        createPlaySession,
      }}
    >
      {children}
    </FlashphonerContext.Provider>
  );
};

export default FlashphonerProvider;
