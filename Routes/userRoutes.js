const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const userRouter = express.Router();

userRouter.route("/signup").post(authController.createUser);

userRouter.route("/signin").post(authController.loginUser);

userRouter.route("/").get(userController.getUsers);

module.exports = userRouter;
