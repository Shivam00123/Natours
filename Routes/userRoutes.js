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

userRouter.route("/verify-user-otp").post(authController.verifyUserOTP);

userRouter
  .route("/resendOTP")
  .post(authController.isAuthenticated, authController.resendOTP);

//Auth Required

userRouter
  .route("/updatePassword")
  .post(authController.isAuthenticated, authController.updatePassword);

userRouter.patch(
  "/updateMe",
  authController.isAuthenticated,
  userController.uploadUserImage,
  userController.reszieUserImage,
  userController.updateMe
);

userRouter.delete("/", authController.isAuthenticated, userController.deleteMe);

userRouter
  .route("/me")
  .get(
    authController.isAuthenticated,
    userController.aboutMe,
    userController.getMyDetails
  );

//Admin restricted Route

userRouter
  .route("/")
  .get(
    authController.isAuthenticated,
    authController.restrictTo("admin"),
    userController.getUsers
  );

//Basic

module.exports = userRouter;
