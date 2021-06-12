import React, { useState } from "react";

import { AxiosInstances } from "../_prodamus";

export const PublishContext = React.createContext({});

const PublishProvider = ({ children }) => {
  const [pending, setPending] = useState(null);
  const [room, setRoom] = useState(null);
  const [translationError, setTranslationError] = useState(null);
  const [translation, setTranslation] = useState({
    uid: "777",
  });
  const [dropdowns, setDropdowns] = useState(null);

  async function publisherIndexAction(uid) {
    setPending("publisherIndexAction");
    AxiosInstances.API.get(`/v1/publish/index?room=${uid}`)
      .then((res) => {
        setPending(null);
        if (res && res.data && res.data.error === 0) {
          setTranslationError(null);
          setRoom(res.data.data.publisher_room.data.room);
          setDropdowns(res.data.data.publisher_room.dropdowns);
          setTranslation(res.data.data.publisher_translation.data.translation);
          console.log(
            `main translation: ${uid}:main:${res.data.data.publisher_translation.data.translation.uid}`
          );
        } else {
          setTranslationError(res.data.data.message);
        }
      })
      .catch((error) => {
        setPending(null);
        throw error;
      });
  }

  return (
    <PublishContext.Provider
      value={{
        pending,
        room,
        translation,
        dropdowns,
        translationError,
        publisherIndexAction,
      }}
    >
      {children}
    </PublishContext.Provider>
  );
};

export default PublishProvider;
