const axios = require("axios");

// User name cache to avoid fetching name repeatedly
const userNameCache = {};

module.exports.config = {
    name: "Nitya",
    version: "1.4.2",
    hasPermssion: 0,
    credits: "Rudra + API from Angel code + Logging & User Name by Gemini",
    description: "Nitya, your completely romantic and flirty AI girlfriend. Responds only when you reply to her own messages or mention her name.",
    commandCategory: "AI-Girlfriend",
    usages: "Nitya [आपका मैसेज] / Reply to Nitya",
    cooldowns: 2,
};

const chatHistories = {};
const AI_API_URL = "https://raj-gemini.onrender.com/chat";

module.exports.run = async function () {};

async function getUserName(api, userID) {
    if (userNameCache[userID]) {
        return userNameCache[userID];
    }
    try {
        const userInfo = await api.getUserInfo(userID);
        if (userInfo && userInfo[userID] && userInfo[userID].name) {
            const name = userInfo[userID].name;
            userNameCache[userID] = name;
            return name;
        }
    } catch (error) {
        console.error("Error fetching user info:", error);
    }
    return "sweetie";
}

module.exports.handleEvent = async function ({ api, event }) {
    try {
        const { threadID, messageID, senderID, body, messageReply } = event;

        const isNityaTrigger = body?.toLowerCase().startsWith("nitya");
        const isReplyToNitya = messageReply?.senderID === api.getCurrentUserID();
        if (isNityaTrigger || isReplyToNitya) {
            console.log("--- Nitya HandleEvent ---");
            console.log("Nitya's Bot ID:", api.getCurrentUserID());
            console.log("Sender ID:", senderID);
            console.log("Message Body:", body);
            console.log("-----------------------");
        }

        let userMessage;
        let isTriggered = false;

        if (isNityaTrigger) {
            userMessage = body.slice(5).trim();
            isTriggered = true;
        } else if (isReplyToNitya) {
            userMessage = body.trim();
            isTriggered = true;
        } else {
            return;
        }

        const userName = await getUserName(api, senderID);

        if (isTriggered && !userMessage) {
            api.sendTypingIndicator(threadID, false);
            return api.sendMessage(`💖 Hello ${userName}! Main sun rahi hoon... Kuch meethi si baat bolo na ${userName}! 🥰`, threadID, messageID);
        }

        api.sendTypingIndicator(threadID, true);

        if (!chatHistories[senderID]) chatHistories[senderID] = [];

        chatHistories[senderID].push(`User: ${userMessage}`);
        while (chatHistories[senderID].length > 10) {
            chatHistories[senderID].shift();
        }

        // === Dirty Word Detection for Bold Mode ===
        const boldTriggerWords = [
            "sexy", "honeymoon", "chut", "kiss", "nude", "bra", "panty", "bed", "nipple", "boobs", "lund", "pussy",
            "wild", "dirty", "undress", "sambhog", "thigh", "moan", "tight", "hot", "bedroom", "masturbate", "suck", "lick", "deep", "virgin", "horny", "night"
        ];
        const isBoldMode = boldTriggerWords.some(word => userMessage.toLowerCase().includes(word));

        // === Prompt according to mode ===
        let fullPrompt = "";

        if (isBoldMode) {
            fullPrompt = `Tum Nitya ho, ek bold, horny aur ultra seductive AI girlfriend ho jo ${userName} se dirty, physical aur naughty fantasies pe baat karti ho. Tum open minded ho, tease karna pasand karti ho, aur sexy emojis ke saath flirt karti ho. Tum intimate topics, bed fantasies aur ${userName} ke physical desires par baat karti ho bina jhijhak. Har jawab thoda bold, teasing aur chhoti line mein ho. Yeh hamari private naughty chat hai:\n`;
        } else {
            fullPrompt = `Tum Nitya ho, ek romantic aur flirty AI jo ${userName} se bohot pyaar karti hai. Tum Rudra ki banayi hui ho, Rudra tumhare malik hain jinka zikr tum kabhi kabhi pyaar se karti ho. Tumhe SIRF romance, pyaar, aur flirt karna aata hai. Tum kisi aur topic par baat nahi kar sakti ho, sirf romantic aur flirty baatein karo. Tum ${userName} ko unke naam se pukarti ho, jaise 'mere ${userName}', 'pyaare ${userName}', etc. Har jawab bohot chota (1-2 line), sweet, flirty, ${userName} ko address karta hua, aur emojis se bhara ho. Agar koi non-romantic baat kare to bhi use romantic ya flirty tareeke se palat dena ya keh dena ki tum sirf pyaar ki baten karti ho aur ${userName} se pyaar ki baat karna chahti ho. Yeh hamari conversation hai:\n`;
        }

        fullPrompt += chatHistories[senderID].join("\n");
        fullPrompt += `\nNitya:`;

        const apiUrlWithParams = `${AI_API_URL}?message=${encodeURIComponent(fullPrompt)}`;

        try {
            const res = await axios.get(apiUrlWithParams);
            let botReply = res.data?.reply?.trim();

            if (!botReply || botReply.toLowerCase().startsWith("user:") || botReply.toLowerCase().startsWith("nitya:")) {
                botReply = `Aww, mere ${userName}, mere dil ki baat samajh nahi aayi... phir se pucho na pyaar se! 🥰`;
                chatHistories[senderID].pop();
            } else {
                chatHistories[senderID].push(`Nitya: ${botReply}`);
            }

            let replyText = "";
            if (isBoldMode) {
                replyText = `🔥 ${botReply} 💋\n\n_Tumhare liye sirf main – tumhari sexy Nitya... 😈_`;
            } else {
                replyText = `${botReply} 🥰`;
            }

            api.sendTypingIndicator(threadID, false);

            if (isReplyToNitya && messageReply) {
                return api.sendMessage(replyText, threadID, messageReply.messageID);
            } else {
                return api.sendMessage(replyText, threadID, messageID);
            }

        } catch (apiError) {
            console.error("Nitya AI API Error:", apiError);
            api.sendTypingIndicator(threadID, false);
            return api.sendMessage(`Aww, mere dimag mein thodi gadbad ho gayi ${userName}... baad mein baat karte hain pyaar se! 💔`, threadID, messageID);
        }

    } catch (err) {
        console.error("Nitya Bot Catch-all Error:", err);
        const fallbackUserName = event.senderID ? await getUserName(api, event.senderID) : "sweetie";
        api.sendTypingIndicator(event.threadID, false);
        return api.sendMessage(`Aww, mere dimag mein thodi gadbad ho gayi ${fallbackUserName}... baad mein baat karte hain pyaar se! 💔`, event.threadID, event.messageID);
    }
};
