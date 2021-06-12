import React, { useState, useEffect, useMemo, useCallback } from "react";

export const SecondaryVideoContext = React.createContext({});

// TODO: remove playerPage-minHeight next version

const SecondaryVideoProvider = ({ children }) => {
  const [isSecVideoActive, setIsSecVideoActive] = useState(false);
  const [isMobileChatActive, setIsMobileChatActive] = useState(false);
  const root = document.documentElement;

  const openChat = useCallback(() => {
    var htmlclass = "inchat";

    var arr = root.className.split(" "),
      idx = arr.indexOf(htmlclass);

    if (idx === -1) {
      root.className += " " + htmlclass;
      setIsMobileChatActive(true);
    } else {
      arr.splice(idx, 1);
      root.className = arr.join(" ");
      setIsMobileChatActive(false);
    }
  }, [setIsMobileChatActive]);

  useEffect(() => {
    window.addEventListener("orientationchange", (event) => {
      if (!isSecVideoActive) {
        root.classList.remove("inchat");
      }

      setIsMobileChatActive(false);
      window.scrollTo(0, 1);
    });
  }, [isMobileChatActive]);

  useEffect(() => {
    if (!isSecVideoActive) {
      root.classList.add("mainvideoonly");
    } else {
      root.classList.remove("mainvideoonly");
    }
  }, [isSecVideoActive]);

  const secondaryVideoProps = useMemo(
    () => ({
      isSecVideoActive,
      setIsSecVideoActive,
      openChat,
      isMobileChatActive,
    }),
    [isSecVideoActive, setIsSecVideoActive, isMobileChatActive, openChat]
  );

  return (
    <SecondaryVideoContext.Provider value={secondaryVideoProps}>
      {children}
    </SecondaryVideoContext.Provider>
  );
};

export default SecondaryVideoProvider;
