const router = require("express").Router();
const { clientVerify } = require("../middleware/auth.js");
const { check } = require("express-validator");

const {
  getCurUsersProfile,
  createProfile,
  getAllProfiles,
  getProfile,
  deleteProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  getGithub,
} = require("../controllers/profile.controller.js");

router.get("/me", clientVerify, getCurUsersProfile);

router
  .route("/")
  .post(
    clientVerify,
    [check("status", "Status is required").not().isEmpty()],
    [check("skills", "Skills are required").not().isEmpty()],
    createProfile
  )
  .get(getAllProfiles);

router.route("/:id").get(getProfile).delete(clientVerify, deleteProfile);

router.put(
  "/experience",
  clientVerify,
  [
    check("title", "cant be empty").not().isEmpty(),
    check("company", "cant be empty").not().isEmpty(),
    check("from", "cant be empty").not().isEmpty(),
  ],
  addExperience
);

router.route("/experience/:exp_id").delete(clientVerify, deleteExperience);

router.put(
  "/education",
  clientVerify,
  [
    check("school", "cant be empty").not().isEmpty(),
    check("degree", "cant be empty").not().isEmpty(),
    check("fieldofstudy", "cant be empty").not().isEmpty(),
    check("from", "cant be empty").not().isEmpty(),
  ],
  addEducation
);

router.route("/education/:edu_id").delete(clientVerify, deleteEducation);

router.get("/github/:username", getGithub);

module.exports = router;
