const express = require("express");
const app = express();
require("dotenv").config();
const morgan = require("morgan");
const homeRoute = require("./routes/home.route");
const userRoute = require("./routes/user.route");
const fileUpload = require("express-fileupload");

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.use("/api/v1", homeRoute);
app.use("/api/v1", userRoute);

module.exports = app;
