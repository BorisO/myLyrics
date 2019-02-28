const express = require("express");
const users = require("../routes/users");
const auth = require("../routes/auth");
const spotify = require("../routes/spotify");
const lyrics = require("../routes/lyrics");
const error = require("../middleware/error");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/spotify", spotify);
  app.use("/api/lyrics", lyrics);
  app.use(error);
};
