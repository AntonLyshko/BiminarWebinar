import React, { useState } from "react";

import axios from "axios";

import CONFIG from "../config";

export const AuthContext = React.createContext({});

const biminarBackend = axios.create({
  baseURL: CONFIG.BASE_API_URL,
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  withCredentials: true,
});

const AuthProvider = ({ children }) => {
  const [pending, setPending] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [isLoggedChecked, setIsLoggedChecked] = useState(false);
  const [token, setToken] = useState(null);

  async function isLoggedAction() {
    setPending(true);
    setIsLoggedChecked(true);

    biminarBackend
      .get("/v1/user/is-logged")
      .then((response) => {
        if (response.data.data.success) {
          setToken(response.data.data.token);
          // ! remporary solution
          if (token) {
            window.sessionStorage.setItem("token", token);
          }
          setIsLogged(true);
        } else {
          setIsLogged(false);
        }
        setPending(false);
      })
      .catch((error) => {
        setPending(false);
        throw error;
      });
  }

  async function setSessionAction(encryptedSessionData) {
    setPending(true);

    const formData = new FormData();
    formData.append("encrypted_session_data", encryptedSessionData);

    biminarBackend
      .post("/v1/user/set-session", formData)
      .then((response) => {
        if (response.data.data.success) {
          setToken(response.data.data.token);
        }
        setIsLoggedChecked(false);
        setPending(false);
      })
      .catch((error) => {
        setPending(false);
        throw error;
      });
  }

  function logOutAction() {
    if (token) {
      setPending(true);
      biminarBackend
        .get("/v1/user/logout", {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        .then(() => {
          setPending(false);
          setIsLoggedChecked(false);
        })
        .catch((error) => {
          setPending(false);
          throw error;
        });
    } else {
      setIsLogged(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedAction,
        setSessionAction,
        logOutAction,
        pending,
        isLogged,
        isLoggedChecked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
