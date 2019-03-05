import http from "./httpService";

const apiEndpoint = "/spotify";

export function getAuthCode(userId) {
  return http.get(`${apiEndpoint}/auth_code/${userId}`);
}

export function getRecentlyPlayed(userId) {
  return http.get(`${apiEndpoint}/recently_played/${userId}`);
}

export function getCurrentlyPlaying(userId) {
  return http.get(`${apiEndpoint}/current_playback/${userId}`);
}
