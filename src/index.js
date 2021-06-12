import React from "react";

import ReactDOM from "react-dom";

import "./index.css";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./App.scss";
import AppProvider from "./providers/AppProvider";
import ProdamusAuthProvider from "./_prodamus/stores/Auth";
import FirebaseProvider from "./providers/Firebase/Firebase";
import FlashphonerProvider from "./providers/FlashphonerProvider";
import UserProvider from "./providers/UserProvider";
import reportWebVitals from "./reportWebVitals";
import { RootStoreProvider } from "./store";

ReactDOM.render(
  <React.StrictMode>
    <RootStoreProvider>
      <BrowserRouter>
        <ProdamusAuthProvider>
          <UserProvider>
            <AppProvider>
              <FirebaseProvider>
                <FlashphonerProvider>
                  <App />
                </FlashphonerProvider>
              </FirebaseProvider>
            </AppProvider>
          </UserProvider>
        </ProdamusAuthProvider>
      </BrowserRouter>
    </RootStoreProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
