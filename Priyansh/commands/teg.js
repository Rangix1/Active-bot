const fs = require("fs");
const path = __dirname + "/../data/trackedUsers.json";

module.exports.config = {
  name: "teg",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Mohit",
  description: "Track a user for flirty reply",
  commandCategory: "love",
  usages: "[mention or name]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  let mention = Object.keys(event.mentions)[0];
  let nameToTrack = "";
  let idToTrack = "";

  if (mention) {
    idToTrack = mention;
    nameToTrack = event.mentions[mention];
  } else if (args.length > 0) {
    nameToTrack = args.join(" ");
    idToTrack = `NAME:${nameToTrack}`;
  } else {
    return api.sendMessage("Pehle kisi ko mention karo ya naam likho jisko track karna hai.", event.threadID, event.messageID);
  }

  let data = {};
  if (fs.existsSync(path)) {
    data = JSON.parse(fs.readFileSync(path));
  }

  data[idToTrack] = nameToTrack;
  fs.writeFileSync(path, JSON.stringify(data, null, 2));

  return api.sendMessage(`${nameToTrack} ko track list me daal diya gaya hai!`, event.threadID);
};
