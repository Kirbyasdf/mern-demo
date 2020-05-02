const router = require("express").Router();
const { sendTokenResponse } = require("../utils/sendToken.js");
const gravatar = require("gravatar");
const User = require("../models/User.js");

module.exports = router;
