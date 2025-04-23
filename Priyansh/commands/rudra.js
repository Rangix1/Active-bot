module.exports.config = {
  name: "mention",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Rudra + Lazer DJ Meham",
  description: "Automatically gali users when they message.",
  commandCategory: "group",
  usages: "mention | stopmention | startmention",
  cooldowns: 5
};

let mentionStatus = false; 
let mentionedUsers = new Set(); 

const galiyan = [
  `Teri maa ki chut mein ganna ghusa ke juice nikal dun, kutte ke pille tere jaise pe to thook bhi na phekhu main, aukat dekh ke muh khol haramkhor!`,
  `Bhosdike, tere jaise chhoti soch wale chhapriyo ka toh main churan banake nasha kar jaun, maa chod pagal aadmi!`,
  `Tere baap ka naak kaat diya kal, aur teri maa toh bolti thi beta engineer banega, chutiya nikla!`,
  // Add the rest of the galiyan here
];

module.exports.run = async function({ api, event, permission }) {
  const { threadID, senderID, body } = event;

  if (["stopmention", "startmention"].includes(body.toLowerCase()) && permission !== 2) {
    return api.sendMessage("Sirf admin hi is command ko chala sakta hai.", threadID, event.messageID);
  }

  if (body.toLowerCase() === "stopmention") {
    mentionStatus = false;
    mentionedUsers.clear();
    return api.sendMessage("Mention system OFF ho gaya hai.", threadID);
  }

  if (body.toLowerCase() === "startmention") {
    mentionStatus = true;
    return api.sendMessage("Mention system ON ho gaya hai.", threadID);
  }
};

module.exports.handleEvent = async function({ api, event }) {
  const { threadID, senderID, body } = event;

  if (mentionStatus) { 
    const gali = galiyan[Math.floor(Math.random() * galiyan.length)];

    try {
      const userInfo = await api.getUserInfo(senderID);
      const name = userInfo[senderID]?.name || "bhosdike";

      return api.sendMessage({
        body: `${name}, ${gali}`,
        mentions: [{ id: senderID, tag: name }]
      }, threadID);
    } catch (err) {
      console.error("User name fetch failed:", err);
      return api.sendMessage(gali, threadID);
    }
  }
};
