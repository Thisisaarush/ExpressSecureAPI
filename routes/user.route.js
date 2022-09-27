const express = require("express");
const router = express.Router();

const {
  userRegisterController,
  userLoginController,
  userLogoutController,
  forgotPasswordController,
  resetPasswordController,
} = require("../controllers/user.controller");

router.route("/register").post(userRegisterController);
router.route("/login").post(userLoginController);
router.route("/logout").get(userLogoutController);
router.route("/forgotPassword").post(forgotPasswordController);
router.route("/forgotPassword/:token").post(resetPasswordController);

module.exports = router;
