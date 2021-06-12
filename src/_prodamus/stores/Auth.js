import React, { useState, useMemo } from "react";

import axios from "axios";
import Cookies from "js-cookie";

import { setSession } from "../../_prodamus/actions/auth";
import { API } from "../../_prodamus/actions/axios";
import CONFIG from "../../config";
import Cookie from "js-cookie";

const CancelToken = axios.CancelToken;

const WATCH_TIMEOUT = 1000 * 60 * 5; // 5 min
export const ProdamusAuthContext = React.createContext({});

const ProdamusAuthProvider = ({ children }) => {
  const [isProdamusLogged, setIsProdamusLogged] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [intervalId, setIntervalId] = useState("");
  const [isLoggedChecked, setIsLoggedChecked] = useState(false);
  const [pending, setPending] = useState(false);

  function checkAuth() {
    authIsChecked();
  }

  function authIsChecked() {
    let date = new Date();
    date.setTime(date.getTime() + 60 * 60 * 1000);
    document.cookie = `isAuthChecked=${true}; expires=${date.toUTCString()}; path=/`;
  }

  function authIsNotChecked() {
    document.cookie = "isAuthChecked=; Max-Age=0";
  }

  function resetWatch() {
    clearInterval(intervalId);
    watchLogin();
  }

  async function authRedirect() {
    window.location.href = `${CONFIG.BASE_ACCOUNT_URL}/?redirect_url=${window.location.href}`;
  }

  async function checkLogin() {
    try {
      let cancelIsLogged;
      let res = await API.get("/v1/user/is-logged", {
        cancelToken: new CancelToken((c) => {
          cancelIsLogged = c;
        }),
      });

      if (res?.data?.data) {
        const { success, token } = res?.data?.data;

        console.log(success ? "Авторизирован" : "Не авторизирован");

        const currentUrl = new URL(location.href);
        const encryptedSessionData = currentUrl.searchParams.get("encrypted_session_data");

        if (encryptedSessionData) {
          await setSession(encryptedSessionData);
          currentUrl.searchParams.delete("encrypted_session_data");
          history.replaceState(history.state, null, currentUrl.href);
          checkLogin();
        }

        if (!success && !encryptedSessionData) authRedirect();

        if (success && !encryptedSessionData) {
          let oldToken = Cookie.get("token");
          oldToken ? Cookies.set("token", token) : authRedirect();
        }

        if (success && encryptedSessionData) Cookie.set("token", token);

        setIsProdamusLogged(success);
        setCheckingAuth(false);
        setIsLoggedChecked(false);
        setPending(false);

        return success;
      }
    } catch (e) {
      console.log(e);
      setIsProdamusLogged(false);
      setCheckingAuth(false);
      setPending(false);
    }
  }

  function watchLogin(lockCancel = false, onSuccessLogged = () => {}, onFailureLogged = () => {}) {
    let tempIntervalId = setInterval(() => {
      checkLogin(lockCancel, onSuccessLogged, onFailureLogged);
    }, WATCH_TIMEOUT);
    setIntervalId(tempIntervalId);
  }

  const authProps = useMemo(
    () => ({
      checkingAuth,
      isLoggedChecked,
      isProdamusLogged,
      pending,
      checkLogin,
      authRedirect,
    }),
    [isLoggedChecked, isProdamusLogged, checkLogin, checkAuth, pending]
  );

  return <ProdamusAuthContext.Provider value={authProps}>{children}</ProdamusAuthContext.Provider>;
};

export default ProdamusAuthProvider;
