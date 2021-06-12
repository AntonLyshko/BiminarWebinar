import url from "url";

import * as AuthActions from "./actions/auth";
import * as AxiosInstances from "./actions/axios";

async function redirectAction(redirectPath, roomUid) {
  window.location.href = url.format({
    protocol: window.location.protocol,
    host: window.location.host,
    pathname: redirectPath,
    query: { room: roomUid },
  });
}

export { AxiosInstances, AuthActions, redirectAction };
