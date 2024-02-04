const express = require("express");

const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const userRouter = express.Router();

//No Authentication required

userRouter.route("/signup").post(authController.createUser);

userRouter.route("/signin").post(authController.loginUser);

userRouter.route("/signout").get(authController.logout);

userRouter.route("/forgotPassword").post(authController.forgotPassword);

userRouter.route("/resetPassword/:token").patch(authController.resetPassword);

//Auth Required
userRouter.use(authController.isAuthenticated);

userRouter.route("/updatePassword").post(authController.updatePassword);

userRouter.patch(
  "/updateMe",
  userController.uploadUserImage,
  userController.reszieUserImage,
  userController.updateMe
);

userRouter.delete("/", userController.deleteMe);

userRouter
  .route("/me")
  .get(userController.aboutMe, userController.getMyDetails);

//Admin restricted Route
userRouter.use(authController.restrictTo("admin"));

userRouter.route("/").get(userController.getUsers);

//Basic

module.exports = userRouter;
