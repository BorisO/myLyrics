const express = require("express");
const router = express.Router();
const { logger } = require("../startup/logging");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const config = require("config");
const _ = require("lodash");

// search for song. Any combination of name, artist, etc
router.get("/search", async (req, res) => {
  let query = req.query.q;
  if (!query) return res.status(400).send("No search query provided.");

  let result = await searchForSong(query);
  if (result.status) return res.status(result.status).send(result.message);
  return res.send(result);
});

// get lyrics by genius ID
router.get("/:id", async (req, res) => {
  // get the lyrics url
  if (!req.params.id) return res.status(400).send("No songs ID provided.");
  const path = `songs/${req.params.id}?text_format=dom`;
  let result = await request(path);
  let url = result.response.song.url;

  // scrape the lyrics url
  const lyrics = await scrapeLyrics(url);
  res.send(lyrics);
});

// get lyrics based on song name/ artist that is pulled from music source
router.get("/", async (req, res) => {
  // going to get data in body of req from spotify with the song info
  const songName = req.query.name;
  const artist = req.query.artist;

  // search genius based on spotify song
  const possibleSongs = await searchForSong(`${artist} ${songName}`);
  let resSong = null;
  _.forEach(possibleSongs, item => {
    if (_.includes(item.artist, artist)) {
      resSong = item;
      return false;
    }
  });
  if (!resSong)
    return res.status(404).send("Can't find song in lyric databse.");
  let lyrics = await scrapeLyrics(resSong.url);
  res.send(lyrics);
});

async function scrapeLyrics(url) {
  // scrape the lyrics from url
  const lyric_response = await fetch(url);
  const text = await lyric_response.text();
  const $ = cheerio.load(text);
  let lyrics = $(".lyrics")
    .text()
    .trim();
  return lyrics;
}

async function searchForSong(query) {
  const path = `search?q=${query}`;
  try {
    const { response } = await request(path);
    let hits = response.hits.map(hit => {
      return {
        name: hit.result.title,
        artist: hit.result.primary_artist.name,
        url: hit.result.url
      };
    });
    return hits;
  } catch (error) {
    logger.error(error);
    return error;
  }
}

function request(path) {
  // Setup basic path and headers
  const url = `https://api.genius.com/${path}`;
  const headers = {
    Authorization: `Bearer ${config.get("genius_access_token")}`
  };

  return new Promise((resolve, reject) => {
    fetch(url, {
      headers
    })
      .then(res => res.json())
      .then(json => {
        if (json.meta.status !== 200) {
          reject(json.meta);
        } else {
          resolve(json);
        }
      })
      .catch(err => {
        logger.error(err);
        reject(err);
      });
  });
}

module.exports = router;
