const { User, validate } = require("../models/user");
const config = require("config");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

module.exports = router;
