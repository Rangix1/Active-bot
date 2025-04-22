// events/antiban.js
const fs = require("fs");

let userCooldowns = {};

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

module.exports.config = {
  name: "antiban",
  eventType: ["message", "message_reply"],
  version: "2.0",
  credits: "Lazer DJ Meham",
  description: "Advanced Anti-Ban with Typing & Cooldown"
};

module.exports.run = async function ({ api, event }) {
  try {
    const config = JSON.parse(fs.readFileSync(__dirname + "/../config/antiban.json", "utf-8"));
    if (!config.enabled) return;

    const { threadID, senderID } = event;
    const now = Date.now();

    // Cooldown system
    if (!userCooldowns[senderID]) userCooldowns[senderID] = 0;
    const timePassed = (now - userCooldowns[senderID]) / 1000;

    if (timePassed < config.cooldown) return; // skip reply to avoid spam

    userCooldowns[senderID] = now;

    // Typing simulation
    const delayTime = config.fastMode
      ? 800
      : Math.floor(Math.random() * (config.maxDelay - config.minDelay)) + config.minDelay;

    api.sendTypingIndicator(threadID, true);
    await delay(delayTime);
    api.sendTypingIndicator(threadID, false);

  } catch (e) {
    console.log("AntiBan error:", e);
  }
};
