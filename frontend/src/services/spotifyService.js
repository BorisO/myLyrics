import http from "./httpService";

const apiEndpoint = "/spotify";

export function getAuthCode(userId) {
  return http.get(`${apiEndpoint}/auth_code/${userId}`);
}
