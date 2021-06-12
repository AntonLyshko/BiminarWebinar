import Cookie from "js-cookie";

import { API, AUTH } from "../../_prodamus/actions/axios";

export function logout() {
  return API.post("/v1/user/logout").then((response) => {
    Cookie.remove("token");
    return response;
  });
}

export function setSession(sessionId) {
  const formData = new FormData();
  formData.append("encrypted_session_data", sessionId);
  return API.post("/v1/user/set-session", formData);
}

export function getSchoolInfo(redirect_url) {
  return AUTH.get("/v1/school/get-info", { params: { redirect_url } });
}
