const publishHost = "wcs.prodamus.me";
const playerHost = "zeus.prodamus.me";

const wscHost = (host) => {
  // Set WCS URL
  let proto;
  let port;

  if (window.location.protocol === "http:") {
    proto = "ws://";
    port = "8080";
  } else {
    proto = "wss://";
    port = "8443";
  }

  return `${proto}${host}:${port}`;
};

// default is dev
let CONFIG = {
  BASE_API_URL: "https://backend.dev.biminar.ru",
  BASE_AUTH_URL: "https://auth.prodamus.ru",
  BASE_ACCOUNT_URL: "https://account.dev.prodamus.ru",
  BASE_SOCKET_URL: "https://ws.dev.prodamus.ru:443",
  BASE_SOCKET_SYNC_PATH: "/biminar_dev",
  get BASE_PLAY_WCS_HOST() {
    return wscHost(playerHost);
  },
  get BASE_PUBLISH_WCS_HOST() {
    return wscHost(publishHost);
  },
};

export default CONFIG;
