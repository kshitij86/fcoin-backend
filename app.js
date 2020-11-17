if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const User = require("./db/user");

const port = process.env.PORT || 5000;
const app = express();
app.use(bodyParser.json());

const FCOIN_PR = 10;

const dbConnect = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Database connection established"));
};

let data = {
  message: "fcoin",
};

const fetchActivity = async (user_name, project) => {
  let activity_url = `https://api.github.com/search/issues?q=state%3Aopen+author%3A${user_name}+type%3Apr`;
  const activityResp = await fetch(activity_url);
  const tempObj = await activityResp.json();
  let pullReqArray = [];

  tempObj.items.map((item) => {
    if (item.repository_url.includes(project)) {
      pullReqArray.push({
        pr_title: item.title,
        pr_url: item.url,
        created_at: item.created_at,
        updated_at: item.updated_at,
      });
    }
  });
  return pullReqArray;
};

const updateRewardPR = async (user_name, project) => {
  const existingUser = await User.findOne({ user_name: user_name });
  const pr_fresh = await (await fetchActivity(user_name, project)).length;
  const pr_stale = existingUser.pull_requests;

  if (pr_fresh > pr_stale) {
    existingUser.fcoins += Math.abs(pr_fresh - pr_stale) * FCOIN_PR;
    existingUser.pull_requests = pr_fresh;
    existingUser.last_checked = Date.now();
  }
  await User.update(existingUser);
};

app.get("/", (req, res, next) => {
  res.send(data);
});

app.post("/create", async (req, res, next) => {
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
  const userObj = { user_name: req.body.user_name, project: req.body.project };
  const existingUser = await User.findOne(userObj);
  if (existingUser === null) {
    existingUser = await User.create(userObj);
  }

  data.activity = await fetchActivity(userObj.user_name, userObj.project);
  res.send(data);
});

app.listen(port, () => {
  console.log(`Server on ${port}`);
  dbConnect();
});
