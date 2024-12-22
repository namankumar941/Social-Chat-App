const express = require("express");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");
const { createHmac } = require("node:crypto");

const router = express.Router();

//middleware to save profile image
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    return callback(null, path.resolve(`./public/images`));
  },
  filename: function (req, file, callback) {
    const uniqueName = Date.now() + "-" + file.originalname;
    return callback(null, uniqueName);
  },
});
const upload = multer({ storage });

//----------------------------------------------class----------------------------------------------

class UserEditController {
  //get request to edit user
  async editUser(req, res) {
    const editUser = await User.find({ email: req.user.email });
    return res.render("edit", {
      user: editUser[0],
    });
  }
  //view profile image
  async viewProfileImage(req, res) {
    const editUser = await User.find({ email: req.user.email });
    return res.render("view", {
      user: editUser[0],
    });
  }
  //get request to edit profile image
  async editPrfileImage(req, res) {
    const editUser = await User.find({ email: req.user.email });
    return res.render("editImage", {
      user: editUser[0],
    });
  }
  //post to change profile image
  async postChangeImage(req, res) {
    const editUser = await User.findOneAndUpdate(
      { email: req.user.email },
      {
        profileImageURL: `/images/${req.file.filename}`,
      }
    );
    res.redirect("/");
  }
  //get request to edit name
  async getEditName(req, res) {
    const editUser = await User.find({ email: req.user.email });
    return res.render("editName", {
      user: editUser[0],
    });
  }
  //post to change Name
  async postEditName(req, res) {
    console.log(req.body);
    const body = req.body;
    const editUser = await User.findOneAndUpdate(
      { email: req.user.email },
      {
        name: body.fullName,
      }
    );

    res.redirect("/");
  }
  //get request to edit password
  async getEditPassword(req, res) {
    const editUser = await User.find({ email: req.user.email });
    return res.render("checkPassword", {
      user: editUser[0],
    });
  }
  //post to check password
  async postCheckPassword(req, res) {
    const body = req.body;
    const user = await User.matchPassword(req.user.email, body.password);
    const editUser = await User.find({ email: req.user.email });
    if (!user)
      return res.render("checkPassword", {
        error: "incorrect password",
        user: editUser[0],
      });
    res.render("editPassword", {
      user: editUser[0],
    });
  }
  //post to change password
  async postChangePassword(req, res) {
    const body = req.body;
    const user = await User.find({ email: req.user.email });
    if (body.password !== body.passwordDuplicate)
      return res.render("editPassword", {
        error: "Password doesn't match",
        user: user[0],
      });

    const hashedPassword = createHmac("sha256", user[0].salt)
      .update(body.password)
      .digest("hex");

    const editUser = await User.findOneAndUpdate(
      { email: req.user.email },
      {
        password: hashedPassword,
      }
    );
    res.redirect("/");
  }
}

//created class instance
const userEditController = new UserEditController();

//----------------------------------------------routes----------------------------------------------

//get request to edit user
router.get("/", userEditController.editUser.bind(userEditController));
//view profile image
router.get(
  "/view",
  userEditController.viewProfileImage.bind(userEditController)
);
//get request to edit profile image
router.get(
  "/image",
  userEditController.editPrfileImage.bind(userEditController)
);
//post to change profile image
router.post(
  "/image",
  upload.single("profileImage"),
  userEditController.postChangeImage.bind(userEditController)
);
//get request to edit name
router.get("/name", userEditController.getEditName.bind(userEditController));
//post to change Name
router.post("/name", userEditController.postEditName.bind(userEditController));
//get request to edit password
router.get(
  "/password",
  userEditController.getEditPassword.bind(userEditController)
);
//post to check password
router.post(
  "/checkpassword",
  userEditController.postCheckPassword.bind(userEditController)
);
//post to change password
router.post(
  "/changePassword",
  userEditController.postChangePassword.bind(userEditController)
);

module.exports = router;
