const User = require("../models/User.js");
const { sendTokenResponse } = require("../utils/sendToken.js");
const { validationResult } = require("express-validator");

const gravatar = require("gravatar");

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ sucess: false, msg: "no user foun with id: " + req.user.id });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    console.log("HEY IM THE REASON THIS IS BROKEN");
    res.status(500).send("Server Error");
  }
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ sucess: false, errors: errors.array() });
  }
  try {
    const { name, password, email } = req.body;
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ sucess: false, errors: [{ msg: "user already exists" }] });
    }

    const avatar = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "mm",
    });

    user = await User.create({ name, email, avatar, password });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ sucess: false, msg: "No user found with that email" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ sucess: false, msg: "Invalid Login" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucess: false });
  }
};
