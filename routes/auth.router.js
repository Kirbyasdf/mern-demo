const router = require("express").Router();
const { clientVerify } = require("../middleware/auth.js");
const { check } = require("express-validator");

const {
  getCurrentUser,
  login,
  register,
} = require("../controllers/auth.controller.js");

router.get("/", clientVerify, getCurrentUser);

router.post(
  "/login",
  [
    check("email", "Include valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  login
);

router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Include valid email").isEmail(),
    check("password", "Please a password with 6 or more character").isLength({
      min: 6,
    }),
  ],
  register
);

module.exports = router;
