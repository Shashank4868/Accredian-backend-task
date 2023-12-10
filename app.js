const express = require("express");
const HttpError = require("./models/http-error.js");
const cors = require("cors");

const userRoutes = require("./routes/user-routes.js");

const app = express();

app.use(express.json());

app.use(cors());

app.use("/", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occurred!" });
});

app.listen(3000, () => {
  console.log("server running on port 3000");
});
