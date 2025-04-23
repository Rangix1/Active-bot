const trackedUsers = new Set();

module.exports.config = {
  name: "teg",
  version: "1.0.1",
  hasPermssion: 2,
  credits: "Lazer DJ Meham",
  description: "Track ek user aur gali de usko jab bhi wo message kare",
  commandCategory: "fun",
  usages: "teg @user | stopteg",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args, mentions }) {
  const { threadID, messageID, body } = event;

  if (body.toLowerCase().startsWith("stopteg")) {
    trackedUsers.clear();
    return api.sendMessage("Teg system OFF ho gaya hai.", threadID, messageID);
  }

  if (mentions && Object.keys(mentions).length > 0) {
    const mentionID = Object.keys(mentions)[0];
    const mentionName = mentions[mentionID].replace("@", "");

    trackedUsers.add(mentionID);

    return api.sendMessage({
      body: `${mentionName}, tera record lag gaya hai. Ab kuch bhi likhega toh gali milegi.`,
      mentions: [{ id: mentionID, tag: mentionName }]
    }, threadID, messageID);
  } else {
    return api.sendMessage("Pehle kisi ko mention karo jisko track karna hai.", threadID, messageID);
  }
};

module.exports.handleEvent = async function({ api, event }) {
  const { senderID, threadID } = event;

  if (trackedUsers.has(senderID)) {
    try {
      const userInfo = await api.getUserInfo(senderID);
      const name = userInfo[senderID]?.name || "bhosdike";

      return api.sendMessage({
        body: `${name}, fir aagaya maiya chudane!`,
        mentions: [{ id: senderID, tag: name }]
      }, threadID);
    } catch (err) {
      return api.sendMessage("Fir aagaya maiya chudane!", threadID);
    }
  }
};
