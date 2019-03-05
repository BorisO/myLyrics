const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const config = require("config");
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const { logger } = require("../startup/logging");
const moment = require("moment");

router.get("/auth_code/:id", auth, async (req, res) => {
  let scopes = ["user-read-recently-played", "user-read-currently-playing"],
    redirectUri = "http://localhost:3900/api/spotify/spotify_callback",
    clientId = config.get("spotify_client"),
    state = req.params.id;

  let spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId
  });

  let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

  // res.send(authorizeURL);
  res.send(authorizeURL);
});

router.get("/spotify_callback", async (req, res) => {
  let credentials = {
    clientId: config.get("spotify_client"),
    clientSecret: config.get("spotify_secret"),
    redirectUri: "http://localhost:3900/api/spotify/spotify_callback"
  };

  let spotifyApi = new SpotifyWebApi(credentials);

  // The code that's returned as a query parameter to the redirect URI
  let code = req.query.code;

  // Retrieve an access token and a refresh token
  spotifyApi.authorizationCodeGrant(code).then(
    async function(data) {
      // save data to DB
      let userId = req.query.state;
      let user = await User.findById(userId);
      if (!user) return res.status(404).send("User with that ID not found");

      // add current time to data to know when to refresh
      data.body.time_created = moment().format();
      user.musicProviderTokens.set("spotify", data.body);
      await user.save();

      res.redirect("http://localhost:3000/spotify");

      // res.send("Tokens Saved");
    },
    function(err) {
      return res
        .status(400)
        .send("Something with wrong with spotify token", err);
    }
  );
});

router.get("/recently_played/:id", auth, async (req, res) => {
  const user = await User.findById(req.params.id);
  let tokenData = user.musicProviderTokens.get("spotify");

  // setup spotify api creds
  let spotifyApi = new SpotifyWebApi({
    clientId: config.get("spotify_client"),
    clientSecret: config.get("spotify_secret")
  });

  if (checkRefresh(tokenData)) {
    let newCreds = await saveNewTokens(tokenData, req.params.id);
    if (!newCreds) return res.status(400).send("Couldn't save new token.");
    else {
      tokenData = newCreds;
    }
  }

  spotifyApi.setAccessToken(tokenData.access_token);
  spotifyApi.setRefreshToken(tokenData.refresh_token);

  // get recently played songs. later need to implent a cursor for more songs
  spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 }).then(
    function(data) {
      let items = data.body.items.map(item => {
        return {
          album: {
            name: item.track.album.name,
            images: item.track.album.images
          },
          artists: {
            names: item.track.artists.map(a => a.name)
          },
          song: {
            name: item.track.name
          }
        };
      });
      res.send(items);
    },
    function(err) {
      logger.error(`Couldn't get recently played tracks: ${err}`);
      res.status(400).send("Spotify request failed");
    }
  );
});

router.get("/current_playback/:id", auth, async (req, res) => {
  let user = await User.findById(req.params.id);
  let tokenData = user.musicProviderTokens.get("spotify");
  // setup spotify api creds
  let spotifyApi = new SpotifyWebApi({
    clientId: config.get("spotify_client"),
    clientSecret: config.get("spotify_secret")
  });

  if (checkRefresh(tokenData)) {
    let newCreds = await saveNewTokens(tokenData, req.params.id);
    if (!newCreds) return res.status(400).send("Couldn't save new token.");
    else {
      tokenData = newCreds;
    }
  }

  spotifyApi.setAccessToken(tokenData.access_token);
  spotifyApi.setRefreshToken(tokenData.refresh_token);

  // get current song
  spotifyApi.getMyCurrentPlayingTrack().then(
    function(data) {
      if (data.statusCode !== 200)
        return res
          .status(data.statusCode)
          .send("Error getting curernt playback.");
      // Output items
      let album = {
        name: data.body.item.album.name,
        images: data.body.item.album.images
      };
      let artists = {
        names: data.body.item.artists.map(a => a.name)
      };
      let song = {
        name: data.body.item.name
      };

      res.send({ album, artists, song });
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

  return new Promise((resolve, reject) => {
    spotifyApi.refreshAccessToken().then(
      async function(data) {
        logger.info(`Access token refreshed for user._id ${userId}`);
        tokenData.access_token = data.body.access_token;
        tokenData.time_created = moment().format();

        // Save the access token
        let user = await User.findById(userId);
        user.set("musicProviderTokens.spotify", tokenData);
        await user.save();

        resolve(tokenData);
      },
      function(err) {
        logger.error(`Could not refresh access token due to ${err}`);
        reject(err);
      }
    );
  });
}

module.exports = router;
