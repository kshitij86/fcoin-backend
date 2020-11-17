if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const bodyParser = require("body-parser");

const { dbConnect } = require("./db/init");
const User = require("./db/user_schema");
const { fetchActivity, updateRewardPR } = require("./util/func");

const port = process.env.PORT || 5000;
const app = express();
app.use(bodyParser.json());

app.get("/", (req, res, next) => {
  let data = {
    message: "fcoin",
  };
  res.send(data);
});

app.post("/create", async (req, res, next) => {
  let data = {
    message: "fcoin",
  };
  const userObj = { user_name: req.body.user_name, project: req.body.project };
  const existingUser = await User.findOne(userObj);
  if (existingUser === null) {
    await User.create(userObj);
    data.message = "User created";
  } else {
    data.message = "User exists";
  }
  res.send(data);
});

app.get("/stats", async (req, res, next) => {
  let user_name = req.body.user_name;
  let project = req.body.project;
  const existingUser = await User.findOne({ user_name: user_name });
  if (existingUser === null) {
    existingUser = await User.create(userObj);
  }
  await updateRewardPR(user_name, project);

  res.send(existingUser);
});

app.get("/activity", async (req, res, next) => {
  let data = {
    message: "fcoin",
  };
  const userObj = { user_name: req.body.user_name, project: req.body.project };
  const existingUser = await User.findOne(userObj);
  if (existingUser === null) {
    existingUser = await User.create(userObj);
  }

  let activityResult = null;
  try {
    activityResult = await fetchActivity(userObj.user_name, userObj.project);
  } catch (e) {
    console.error(e);
    activityResult = "not found";
  }
  data.activity = activityResult;
  res.send(data);
});

app.get("/ranks", async (req, res, next) => {
  let rankArray = [];
  const allUsers = await User.find();
  allUsers.sort((a, b) => {
    return b.fcoins - a.fcoins;
  });
  allUsers.map((user) => {
    rankArray.push(user.user_name);
  });

  res.send(rankArray);
});

app.listen(port, () => {
  console.log(`Server on ${port}`);
  dbConnect();
});
