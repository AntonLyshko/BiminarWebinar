import React, { useState, useContext, useEffect } from "react";

import { ProdamusAuthContext } from "../_prodamus/stores/Auth";
import { UserContext } from "../providers/UserProvider";

export const AppContext = React.createContext({});

const AppProvider = ({ children }) => {
  const { isProdamusLogged: isLogged, checkLogin } = useContext(ProdamusAuthContext);
  //const {schoolInitialization} = useContext(SchoolContext);
  const { userInitialize } = useContext(UserContext);

  const [appLoaded, setAppLoaded] = useState(false);

  async function initialization() {
    try {
      if (!isLogged) {
        await checkLogin();
      }
      setAppLoaded(true);
    } catch (e) {}
  }

  return (
    <AppContext.Provider
      value={{
        appLoaded,
        initialization,
        userInitialize,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
