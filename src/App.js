import React, { useEffect, useContext, Suspense } from "react";

import { Switch, Route } from "react-router-dom";

import { ProdamusAuthContext } from "./_prodamus/stores/Auth";
import NotFound from "./pages/NotFound/NotFound";
import AutoplayPreloader from "./pages/Skeleton/AutoplayPreloader";
import ControlPreloader from "./pages/Skeleton/ControlPreloader";
import PublishPreloader from "./pages/Skeleton/PublishPreloader";
import { AppContext } from "./providers/AppProvider";
import { FlashphonerContext } from "./providers/FlashphonerProvider";

import "./styles/styles.scss";

const Publish = React.lazy(() => import("./pages/Publish/Publish"));
const Autoplay = React.lazy(() => import("./pages/Autoplay/Autoplay"));
const Control = React.lazy(() => import("./pages/Control/Control"));

const App = () => {
  const { initialization, appLoaded, userInitialize } = useContext(AppContext);
  const { isProdamusLogged, checkLogin, authRedirect } = useContext(ProdamusAuthContext);
  const flashphoner = useContext(FlashphonerContext);
  const path = window.location.pathname;

  const preloader = () => {
    if (path === "/publish") {
      return <PublishPreloader />;
    } else if (path === "/control") {
      return <ControlPreloader />;
    } else if (path === "/player") {
      return <AutoplayPreloader />;
    } else return <div>Loading</div>;
  };

  useEffect(() => {
    var htmlclass;
    // определение операционки
    if (navigator.userAgent.indexOf("iPhone") !== -1) {
      htmlclass = "iphone";
    } else if (navigator.userAgent.indexOf("iPad") !== -1) {
      htmlclass = "ipad";
    } else if (navigator.userAgent.indexOf("Windows") !== -1) {
      htmlclass = "windows";
    } else if (navigator.userAgent.indexOf("Linux") !== -1) {
      htmlclass = "linux";
    } else if (navigator.userAgent.indexOf("Mac") !== -1) {
      htmlclass = "mac";
    } else if (navigator.userAgent.indexOf("FreeBSD") !== -1) {
      htmlclass = "freebsd";
    }
    if (htmlclass) {
      const el = document.getElementsByTagName("html")[0];
      const arr = el.className.split(" ");
      if (arr.indexOf(htmlclass) === -1) {
        el.className += " " + htmlclass;
      }
    }
  }, []);

  useEffect(() => {
    if (!isProdamusLogged) {
      const init = async () => {
        await initialization();
      };
      init();
    } else {
      const userInit = async () => {
        await userInitialize();
      };
      userInit();
      flashphoner.init();
    }
  }, [isProdamusLogged]);

  // Чекаем isLogged когда входим и выходим из вкладки
  document.addEventListener(
    "visibilitychange",
    async () => {
      try {
        setTimeout(() => checkLogin(), 500); // Разлогин на сервере срабатывает не сразу
      } catch (error) {
        console.log(error);
      }
    },
    true
  );

  if (appLoaded) {
    return (
      <Suspense fallback={preloader()}>
        <Switch>
          <Route exact path='/publish'>
            <Publish isLogged={isProdamusLogged} />
          </Route>
          <Route exact path='/player'>
            <Autoplay isLogged={isProdamusLogged} />
          </Route>
          <Route exact path='/control'>
            <Control isLogged={isProdamusLogged} />
          </Route>
          <Route path='*' component={NotFound} />
        </Switch>
      </Suspense>
    );
  } else return preloader();
};

export default App;
