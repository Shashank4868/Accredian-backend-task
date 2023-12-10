const express = require("express");
const { check } = require("express-validator");

const userControllers = require("../controllers/user-controllers");

const router = express.Router();

router.post(
  "/signup",
  [
    check("username").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  userControllers.signup
);

router.post(
  "/",
  [
    check("usernameOrEmail").not().isEmpty(),
    check("password").isLength({ min: 8 }),
  ],
  userControllers.login
);

module.exports = router;
