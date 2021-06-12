import React, { useState, useMemo } from "react";

export const ChatStateContext = React.createContext({});

const ChatStateProvider = ({ children }) => {
  const [actionSendingMessage, setActionSendingMessage] = useState("disabled");
  const [statusHistory, setStatusHistory] = useState("pending");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  function connecting() {
    setIsConnected(true);
    setActionSendingMessage("disabled");
  }

  function online() {
    setIsConnected(true);
    setIsConnecting(false);
    setActionSendingMessage("enabled");
  }
  function offline() {
    setIsConnected(false);
    setIsConnecting(false);
    setActionSendingMessage("disabled");
  }

  const chatStateProp = useMemo(
    () => ({
      actionSendingMessage,
      setActionSendingMessage,
      statusHistory,
      setStatusHistory,
      isConnected,
      isConnecting,
      connecting,
      online,
      offline,
    }),
    [actionSendingMessage, isConnected, isConnecting, statusHistory]
  );

  return (
    <ChatStateContext.Provider value={chatStateProp}>
      {children}
    </ChatStateContext.Provider>
  );
};

export default ChatStateProvider;
