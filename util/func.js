const fetch = require("node-fetch");
const User = require("../db/user_schema");

const FCOIN_PR = 10;

const fetchActivity = async (user_name, project) => {
  let activity_url = `https://api.github.com/search/issues?q=state%3Aopen+author%3A${user_name}+type%3Apr`;
  const activityResp = await fetch(activity_url);
  const tempObj = await activityResp.json();
  let pullReqArray = [];

  tempObj.items.map((item) => {
    if (item.repository_url.includes(project)) {
      pullReqArray.push({
        pr_title: item.title,
        pr_url: item.html_url,
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

module.exports = {
  fetchActivity: fetchActivity,
  updateRewardPR: updateRewardPR,
};
