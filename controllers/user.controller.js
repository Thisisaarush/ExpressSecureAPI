const User = require("../models/user.model");
const cloudinary = require("cloudinary").v2;
const { mailHandler } = require("../utils/mailHandler");
const crypto = require("crypto");

exports.userRegisterController = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.send("Please Provide Necessary Credentials");
  }

  const userAlreadyExists = await User.findOne({ email });

  if (userAlreadyExists) {
    return res.status(201).send("User Already Exists");
  }

  const userProfilePhoto = req.files.profilePhoto.tempFilePath;

  const fileResult = await cloudinary.uploader.upload(userProfilePhoto, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  const user = await User.create({
    name,
    email,
    password,
    profilePhoto: {
      id: fileResult.public_id,
      photo_url: fileResult.secure_url,
    },
    createdAt: Date.now(),
  });

  const token = user.createJwtToken();
  user.password = undefined;

  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    })
    .json({
      success: true,
      token,
      user,
    });
};

exports.userLoginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send("Please Provide Necessary Credentials");
  }
  const user = await User.findOne({ email }).select(+"password");

  if (!user) {
    return res.send("You are not registered, Please Register...");
  }

  const passwordMatch = await user.validatePassword(password);

  if (!passwordMatch) {
    return res.send("Password doesn't Match");
  }

  const token = user.createJwtToken();
  user.password = undefined;
  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    })
    .json({
      isLoggedIn: true,
      token,
      user,
    });
};

exports.userLogoutController = (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout Successfully",
  });
};

exports.forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.send("Please Provide Email To Reset Password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).send("User Not Found");
  }
  const token = user.getForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const passwordResetUrl =
    "http://localhost:4000/api/v1" + req.path + `/${token}`;

  try {
    await mailHandler(passwordResetUrl, email);
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).send("Server Error");
  }

  await user.update({
    forgotPasswordToken: token,
    forgotPasswordExpiry: Date.now() + 3 * 60 * 1000,
  });

  user.password = undefined;

  res.status(200).json({
    success: true,
    emailSent: true,
  });
};

exports.resetPasswordController = async (req, res) => {
  const { token } = req.params;

  const encryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    encryptedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(404).send("Token Expired or Invalid");
  }

  const { password, confirmPassword } = req.body;

  if (!password && !confirmPassword) {
    return res.send("Please Provide New Password");
  }

  if (password !== confirmPassword) {
    return res.send("Passwords do not Match");
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  res.status(200).send("Password is Successfully Changed");
};
