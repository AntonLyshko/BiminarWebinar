import React, { useEffect } from "react";

import { useClassName } from "../../../hooks";

const HistoryChatLoading = () => {
  const { cn } = useClassName("history-chat");

  return (
    <>
      <div className={cn("")} id="chatlist">
        <div id="chatlist_wrapper" className={cn("wrapper")}></div>

        <div className="loading-bar-container">
          <div className="loader">
            <div className="loaderBar"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryChatLoading;
