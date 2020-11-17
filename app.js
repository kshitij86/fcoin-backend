if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const port = process.env.PORT || 5000;
const app = express();
app.use(bodyParser.json());

let data = {
  message: "fcoin",
};

app.get("/", (req, res, next) => {
  res.send(data);
});

app.get("/activity", async (req, res, next) => {
  let user_name = req.body.user_name;
  let project = req.body.project;

  let activity_url = `https://api.github.com/search/issues?q=state%3Aopen+author%3A${user_name}+type%3Apr`;
  const activityResp = await fetch(activity_url);
  let tempObj = await activityResp.json();
  let pullReqArray = [];
  tempObj.items.map((item) => {
    if (item.repository_url.includes(project)) {
      pullReqArray.push({ pr_title: item.title, pr_url: item.url });
    }
  });
  data.activity = pullReqArray;
  res.send(data);
});

app.listen(port, () => console.log(`Server on ${port}`));
