import http from "./httpService";

const apiEndpoint = "/lyrics";

export function getLyricsFromSongObj(query) {
  return http.get(`${apiEndpoint}/?${query}`);
}
