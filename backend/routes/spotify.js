const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const config = require("config");
const auth = require("../middleware/auth");
const { User } = require("../models/user");

router.get("/auth_code", auth, async (req, res) => {
  var scopes = ["user-read-recently-played", "user-read-currently-playing"],
    redirectUri = "http://localhost:3900/api/spotify/spotify_callback",
    clientId = config.get("spotify_client"),
    state = req.user._id;

  var spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId
  });

  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

  res.send(authorizeURL);
});

router.get("/spotify_callback", async (req, res) => {
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
    async function(data) {
      // Set the access token on the API object to use it in later calls
      // spotifyApi.setAccessToken(data.body["access_token"]);
      // spotifyApi.setRefreshToken(data.body["refresh_token"]);

      // save data to DB

      userId = req.query.state;
      let user = await User.findById(userId);
      if (!user) return res.status(404).send("User with that ID not found");
      user.musicProviderTokens.set("spotify", data.body);
      await user.save();

      res.send("Tokens Saved");
    },
    function(err) {
      return res
        .status(400)
        .send("Something with wrong with spotify token", err);
    }
  );
});

module.exports = router;
