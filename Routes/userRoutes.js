const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const userRouter = express.Router();

//Authentication

userRouter.route("/signup").post(authController.createUser);

userRouter.route("/signin").post(authController.loginUser);

userRouter.route("/forgotPassword").post(authController.forgotPassword);

userRouter.route("/resetPassword/:token").patch(authController.resetPassword);

//Basic

userRouter.route("/").get(userController.getUsers);

module.exports = userRouter;
