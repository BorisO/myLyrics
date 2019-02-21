const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const config = require("config");
const auth = require("../middleware/auth");

router.get("/auth_code", auth, async (req, res) => {
  var scopes = ["user-read-recently-played", "user-read-currently-playing"],
    redirectUri = "http://localhost:3900/spotify_callback",
    clientId = config.get("spotify_client"),
    state = "some-state-of-my-choice";

  var spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId
  });

  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

  console.log(authorizeURL);
});

module.exports = router;
