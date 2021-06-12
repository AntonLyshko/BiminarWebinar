import React, { useMemo, useState, useCallback } from "react";

import { AxiosInstances } from "../_prodamus";

const { API } = AxiosInstances;

export const UserContext = React.createContext({});

const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    avatar: null,
    fullName: "",
    gender: null,
    birthDate: null,
    cuid: null,
    buid: null,
    userUid: "",
  });

  function getMe() {
    return API.get("/v1/user/get-data");
  }

  function formatUserProfile(data) {
    return {
      avatar: data.avatar || "",
      birthDate: data.birth_date,
      fullName: data.full_name,
      gender: data.gender,
      buid: data.biminar_user_id,
      cuid: data.core_user_id,
      userUid: data.user_uid,
    };
  }

  const userInitialize = useCallback(async () => {
    try {
      const response = await getMe();
      setProfile(formatUserProfile(response.data.data));
      window.sessionStorage.setItem("cuid", response.data.data.core_user_id);
      window.sessionStorage.setItem("user_uid", response.data.data.user_uid);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const profileProps = useMemo(
    () => ({
      profile,
      userInitialize,
      formatUserProfile,
    }),
    [profile, userInitialize]
  );

  return (
    <UserContext.Provider value={profileProps}>{children}</UserContext.Provider>
  );
};

export default UserProvider;
