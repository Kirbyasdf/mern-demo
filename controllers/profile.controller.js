const User = require("../models/User.js");
const Profile = require("../models/Profile.js");
const { validationResult } = require("express-validator");
const request = require("request");

exports.getCurUsersProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(404).json({ sucess: false, msg: "No Profile Found for this user" });
    }

    res.status(200).json({ sucess: true, data: profile });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ sucess: false, msg: err.message });
  }
};

exports.createProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ sucess: false, errors: errors.array() });
  }

  const {
    company,
    location,
    website,
    bio,
    skills,
    status,
    githubusername,
    youtube,
    twitter,
    instagram,
    linkedin,
    facebook,
  } = req.body;

  const profileFields = {
    user: req.user.id,
    company,
    location,
    website,
    bio,
    status,
    githubusername,
  };
  if (skills) {
    profileFields.skills = skills.split(",").map((skill) => skill.trim());
  }

  // Build social object and add to profileFields
  const socialfields = { youtube, twitter, instagram, linkedin, facebook };

  for (const [key, value] of Object.entries(socialfields)) {
    if (value && value.length > 0) socialfields[key] = value;
  }
  profileFields.social = socialfields;

  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    response.status(500).json({ sucess: false, msg: err.message });
  }
};

exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["email", "avatar"]);
    res.json({ sucess: true, count: profiles.length, data: profiles });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ sucess: false, msg: err.message });
  }
};

exports.getProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await Profile.findById(id).populate("user", ["name", "avatar"]);
    if (!profile) {
      res.status(404).json({ sucess: false, msg: "No profile found with id :" + id });
    }
    res.status(200).json({ sucess: true, data: profile });
  } catch (err) {
    console.error(err.message);
    if (err.kid == "ObjectId") {
      return res.status(404).json({ sucess: false, msg: "No profile found with id :" + id });
    }
    res.status(500).json({ sucess: false, msg: "SERVER ERROR" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete({ _id: req.user.id });
    await Profile.findByIdAndDelete({ user: req.user.id });

    res.json({ sucess: true, msg: "User and profile deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ sucess: false, msg: "SERVER ERROR" });
  }
};

exports.addExperience = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ sucess: false, errors: errors.array() });
  }

  const { title, company, location, from, to, current, description } = req.body;

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description,
  };

  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience.unshift(newExp);
    await profile.save();
    res.status(201).json({ sucess: true, data: profile });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("SERVER ERROR");
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.experience.map((item) => item.id).indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("SERVER ERROR");
  }
};

exports.addEducation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ sucess: false, errors: errors.array() });
  }

  const { school, degree, fieldofstudy, from, to, current, description } = req.body;

  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description,
  };

  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education.unshift(newEdu);
    await profile.save();
    res.status(201).json({ sucess: true, data: profile });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("SERVER ERROR");
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.education.map((item) => item.id).indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("SERVER ERROR");
  }
};

exports.getGithub = async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.GITHUB_CLIENT_ID}&client_secert=${process.env.GITHUB_CLIENT_SECERT}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "no github profile found" });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("SERVER ERROR");
  }
};
