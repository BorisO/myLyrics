import http from "./httpService";

const apiEndpoint = "/spotify";

function spotifyUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getAuthCode() {}
