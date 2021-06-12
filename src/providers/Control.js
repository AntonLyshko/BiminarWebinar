import React, { useState, useContext } from "react";

import { AxiosInstances, redirectAction } from "../_prodamus";
import { ConfereeContext } from "../providers/Conferee/ConfereeProvider";
import { SyncContext } from "../providers/SyncProvider";

export const ControlContext = React.createContext({});

const ControlProvider = ({ children }) => {
  const [pending, setPending] = useState(null);
  const [controlIndexData, setControlIndexData] = useState(null);

  const { updateSyncAction } = useContext(SyncContext);
  const { confereeInitialize } = useContext(ConfereeContext);

  const controlIndexAction = async (roomUid) => {
    setPending("controlIndexAction");
    AxiosInstances.API.get(`/v1/control/index?room=${roomUid}`)
      .then((res) => {
        setPending(null);
        if (res?.data?.error === 0) {
          if (
            res?.data?.data?.redirect &&
            res.data.data.redirect.location !== "control"
          ) {
            redirectAction(
              res.data.data.redirect.location,
              res.data.data.redirect.room_uid
            );
          } else {
            setControlIndexData(res.data.data.state);
            console.log("controlIndexAction ", res.data.data.state);
            updateSyncAction(roomUid, res.data.data.state);
            console.log("updateSyncAction ", res.data.data.state);
            confereeInitialize(res.data.data.state.users);
          }
        }
      })
      .catch((error) => {
        setPending(null);
        throw error;
      });
  };

  return (
    <ControlContext.Provider
      value={{
        controlIndexAction,
        controlIndexData,
        pending,
      }}
    >
      {children}
    </ControlContext.Provider>
  );
};

export default ControlProvider;
