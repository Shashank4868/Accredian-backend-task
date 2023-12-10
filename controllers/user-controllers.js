const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");

const mysql = require("mysql2");

const pool = mysql
  .createPool({
    host: "localhost",
    user: "root",
    password: "admin",
    database: "accredian_task",
  })
  .promise();

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { username, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await pool.query(
      "SELECT * FROM user_data WHERE email = ? or username = ?",
      [email, username]
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser[0].length > 0) {
    console.log(existingUser[0]);
    res
      .status(422)
      .json({ message: "User already exists, please login instead" });
  } else {
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      const error = new HttpError(
        "Could not create user, please try again.",
        500
      );
      return next(error);
    }
    try {
      await pool.query(
        "INSERT INTO user_data (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword]
      );
    } catch (err) {
      const error = new HttpError(
        "Signing up failed, please try again later.",
        500
      );
      return next(error);
    }
    res.status(200).json({ message: "User created, Successfully signed up" });
  }
};

const logIn = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { usernameOrEmail, password } = req.body;
  let result;
  try {
    const [user] = await pool.query(
      "SELECT * FROM user_data WHERE email = ? or username = ?",
      [usernameOrEmail, usernameOrEmail]
    );
    result = user;
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  let isValidPassword = false;

  if (result[0]) {
    const user = result[0];
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
    } catch (err) {
      const error = new HttpError(
        "Could not log you in, please check your credentials and try again.",
        500
      );
      return next(error);
    }

    if (isValidPassword === true) {
      res.status(200).json({ message: "Successfully logged in" });
    } else {
      res.status(422).json({ message: "Invalid password" });
    }
  } else {
    res.status(422).json({ message: "Invalid username or email" });
  }
};

exports.signup = signUp;
exports.login = logIn;
