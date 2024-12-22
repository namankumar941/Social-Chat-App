const User = require("../models/user");
const express = require("express");
const serviceAuth = require("../service/auth");

const router = express.Router();
let ServiceAuth = new serviceAuth()
//----------------------------------------------class----------------------------------------------

class UserController {
  //get request for signup page
  getSignUp(req, res) {
    return res.render("signup");
  }
  //creating new account
  async postCreateAccount(req, res) {
    const body = req.body;
    if (await User.findOne({ email: body.email })) {
      res.render("signup", {
        error: "email exist",
      });
    } else {
      await User.create({
        name: body.name,
        email: body.email,
        password: body.password,
      });
      res.redirect("/user/signin");
    }
  }
  //get request for signin page
  getSignIp(req, res) {
    return res.render("signin");
  }
  //login to your id
  async postLogIn(req, res) {
    const body = req.body;
    const user = await User.matchPassword(body.email, body.password);
    if (!user)
      return res.render("signin", {
        error: "invalid username or password",
      });
    await User.findOneAndUpdate(
      { email: body.email },
      { $set: { isOnline: "true" } }
    );

    const token = ServiceAuth.createToken(user);
    res.cookie("token", token);

    return res.redirect("/");
  }
}

//created class instance
const userController = new UserController();

//----------------------------------------------routes----------------------------------------------

//get request for signup page
router.get("/signup", userController.getSignUp.bind(userController));
//creating new account
router.post("/signup", userController.postCreateAccount.bind(userController));
//get request for signin page
router.get("/signin", userController.getSignIp.bind(userController));
//login to your id
router.post("/signin", userController.postLogIn.bind(userController));

module.exports = router;
