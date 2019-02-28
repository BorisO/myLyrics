const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const { logger } = require("../startup/logging");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const config = require("config");

router.get("/search", auth, async (req, res) => {
  let query = req.query.song;
  if (!query) return res.status(400).send("No search query provided.");

  let result = await searchForSong(query);
  if (result.status) return res.status(result.status).send(result.message);
  return res.send(result);
});

async function searchForSong(query) {
  const path = `search?q=${query}`;
  try {
    const { response } = await request(path);
    let hits = response.hits.map(hit => {
      return {
        name: hit.result.title,
        artist: hit.result.primary_artist.name,
        id: hit.result.id
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
          reject({ status: json.meta.status, message: json.meta.message });
        }
        resolve(json);
      })
      .catch(err => {
        logger.error(err);
        reject(err);
      });
  });
}

module.exports = router;
