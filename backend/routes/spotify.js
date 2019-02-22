const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const config = require("config");
const auth = require("../middleware/auth");

router.get("/auth_code", auth, async (req, res) => {
  var scopes = ["user-read-recently-played", "user-read-currently-playing"],
    redirectUri = "http://localhost:3900/api/spotify/spotify_callback",
    clientId = config.get("spotify_client"),
    state = "some-state-of-my-choice";

  var spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId
  });

  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

  res.send(authorizeURL);
});

router.get("/spotify_callback", async (req, res) => {
  // console.log(req.query.code);

  var credentials = {
    clientId: config.get("spotify_client"),
    clientSecret: config.get("spotify_secret"),
    redirectUri: "http://localhost:3900/api/spotify/spotify_callback"
  };

  var spotifyApi = new SpotifyWebApi(credentials);

  // The code that's returned as a query parameter to the redirect URI
  var code = req.query.code;

  // Retrieve an access token and a refresh token
  spotifyApi.authorizationCodeGrant(code).then(
    function(data) {
      console.log("The token expires in " + data.body["expires_in"]);
      console.log("The access token is " + data.body["access_token"]);
      console.log("The refresh token is " + data.body["refresh_token"]);

      // Set the access token on the API object to use it in later calls
      // spotifyApi.setAccessToken(data.body["access_token"]);
      // spotifyApi.setRefreshToken(data.body["refresh_token"]);
      tokens = {
        access_token: data.body["access_token"],
        refresh_token: data.body["refresh_token"]
      };

      res.send(tokens);
    },
    function(err) {
      return res
        .status(400)
        .send("Something with wrong with spotify token", err);
    }
  );
});

module.exports = router;
