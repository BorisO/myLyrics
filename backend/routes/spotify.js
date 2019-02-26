const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const config = require("config");
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const { logger } = require("../startup/logging");
const moment = require("moment");

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
      // save data to DB
      userId = req.query.state;
      let user = await User.findById(userId);
      if (!user) return res.status(404).send("User with that ID not found");

      // add current time to data to know when to refresh
      data.body.time_created = moment().format();
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

router.get("/current_playback", auth, async (req, res) => {
  let user = await User.findById(req.user._id);
  let tokenData = user.musicProviderTokens.get("spotify");
  // setup spotify api creds
  let spotifyApi = new SpotifyWebApi({
    clientId: config.get("spotify_client"),
    clientSecret: config.get("spotify_secret")
  });

  if (checkRefresh(tokenData)) {
    // this is black magic that somehow works even though it doesn't return anything. without await
    // it will break bc of async stuff
    await saveNewTokens(tokenData, req.user._id);
  }

  spotifyApi.setAccessToken(tokenData.access_token);
  spotifyApi.setRefreshToken(tokenData.refresh_token);

  // get current song
  spotifyApi.getMyCurrentPlayingTrack().then(
    function(data) {
      // Output items
      res.send(data);
    },
    function(err) {
      logger.error(`Couldn't get current playing track: ${err}`);
      res.status(400).send("Spotify request failed");
    }
  );
});

function checkRefresh(data) {
  let { time_created, expires_in } = data; // expires in seconds
  let createdMoment = moment(time_created);
  let currTime = moment();
  timeDiff = currTime.diff(createdMoment, "seconds");
  if (timeDiff < expires_in) {
    return false;
  } else {
    return true;
  }
}

function saveNewTokens(tokenData, userId) {
  let spotifyApi = new SpotifyWebApi({
    clientId: config.get("spotify_client"),
    clientSecret: config.get("spotify_secret"),
    refreshToken: tokenData.refresh_token
  });

  spotifyApi.refreshAccessToken().then(
    async function(data) {
      logger.info(`Access token refreshed for user._id ${userId}`);
      tokenData.access_token = data.body.access_token;
      tokenData.time_created = moment().format();

      // Save the access token
      let user = await User.findById(userId);
      user.set("musicProviderTokens.spotify", tokenData);
      await user.save();
    },
    function(err) {
      logger.error(`Could not refresh access token due to ${err}`);
    }
  );
}

module.exports = router;
