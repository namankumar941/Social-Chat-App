const express = require("express");
const path = require("path");
const http = require("http");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const User = require("./models/user");
const { Server } = require("socket.io");

const CheckForAuthentication = require("./middleware/auth");
let checkForAuthentication = new CheckForAuthentication();

const editRoute = require("./route/edit");
const userRoute = require("./route/user");
const friendRoute = require("./route/friends");
const messagesRoute = require("./route/messages");

const app = express();
const port = 8002;

const server = http.createServer(app);
server.listen(port, () => console.log("server started"));

const io = new Server(server);

io.on("connection", onConnected);
function onConnected(socket) {
  console.log("a new user connected", socket.id);

  socket.on("email", async (email) => {
    await User.findOneAndUpdate(
      { email: email },
      { $set: { socketId: socket.id } }
    );
  });

  socket.on("message", async (data) => {
    const to = await User.find({ email: data.to });
    console.log(to[0].socketId);
    io.to(to[0].socketId).emit("chat-message", `${data.from}: ${data.message}`);
    console.log("data", data);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected", socket.id);
  });
}

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(checkForAuthentication.checkForAuthentication);

app.use(express.static(path.resolve("./public")));

app.use("/user", userRoute);
app.use("/edit", editRoute);
app.use("/friend", friendRoute);
app.use("/messages", messagesRoute);

app.get("/", async (req, res) => {
  if (!req.user) return res.render("home");
  const user = await User.find({ email: req.user.email });

  return res.render("home", {
    user: user[0],
  });
});

app.get("/logout", async (req, res) => {
  console.log(req.user.email);
  await User.findOneAndUpdate(
    { email: req.user.email },
    { $set: { isOnline: "false" }, $unset: { socketId: "" } }
  );
  res.cookie("token", null);
  return res.redirect("/");
});

mongoose
  .connect("mongodb://127.0.0.1:27017/connect")
  .then(() => console.log("mongo db connected"))
  .catch((err) => console.log("mongo connection error", err));
