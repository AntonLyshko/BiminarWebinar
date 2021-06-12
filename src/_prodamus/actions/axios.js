import axios from "axios";
import Cookie from "js-cookie";
import get from "lodash/get";
import set from "lodash/set";

import CONFIG from "../../config";

const AUTH = axios.create({
  baseURL: CONFIG.BASE_AUTH_URL,
  headers: { "Content-Type": "multipart/form-data" },
  withCredentials: true,
});

const API = axios.create({
  baseURL: CONFIG.BASE_API_URL,
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  withCredentials: true,
});

function interceptor401(error) {
  if (get(error, "response.status", 0) === 401) {
    //Cookie.remove('token');
  }
  return error;
}

function interceptorBeforeRequest(config) {
  // Do something before request is sent
  const token = Cookie.get("token");
  if (token) {
    set(config, "headers.Authorization", `Bearer ${Cookie.get("token")}`);
  }
  return config;
}

AUTH.interceptors.response.use((response) => response, interceptor401);
AUTH.interceptors.request.use(interceptorBeforeRequest, (error) =>
  Promise.reject(error)
);

API.interceptors.response.use((response) => response, interceptor401);
API.interceptors.request.use(interceptorBeforeRequest, (error) =>
  Promise.reject(error)
);

export { AUTH, API };
