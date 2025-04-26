Const axios = require("axios");
const fs = require("fs");
const moment = require("moment-timezone");

const userNameCache = {};
let hornyMode = false; // Default mode

// --- Voice and GIF functions remain commented out for now ---
// async function getVoiceReply(text) { ... }
// async function getGIF(query) { ... }

module.exports.config = {
    name: "Nitya",
    version: "1.0.5-step2", // Step 2 version
    hasPermssion: 0,
    credits: "Rudra + AI + Gemini (Step 2: AI Enabled)", // Updated credits
    description: "Nitya - testing AI reply with stylish format", // Updated description
    commandCategory: "AI-Girlfriend",
    usages: "Nitya [आपका मैसेज] / Reply to Nitya",
    cooldowns: 2,
};

const chatHistories = {}; // Chat history re-enabled
const AI_API_URL = "https://raj-gemini.onrender.com/chat"; // AI API URL

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

module.exports.run = async function () {};

async function toggleHornyMode(body) {
    if (body?.toLowerCase().includes("horny mode on")) {
        hornyMode = true;
        return "Horny mode is now ON."; // Restore original message slightly
    } else if (body?.toLowerCase().includes("horny mode off")) {
        hornyMode = false;
        return "Horny mode is now OFF. 💖"; // Restore original message slightly
    }
    return null;
}

module.exports.handleEvent = async function ({ api, event }) {
    try {
        const { threadID, messageID, senderID, body, messageReply } = event;

        const isNityaTrigger = body?.toLowerCase().startsWith("nitya");
        const isReplyToNitya = messageReply?.senderID === api.getCurrentUserID();

        let userMessage;
        let isTriggered = false;

        if (isNityaTrigger) {
            userMessage = body.slice(5).trim();
            isTriggered = true;
        } else if (isReplyToNitya) {
            userMessage = body.trim();
            isTriggered = true;
        } else {
            return; // Trigger not met
        }

        const userName = await getUserName(api, senderID);

        // Check for mode toggle phrase first
        const modeToggleResponse = await toggleHornyMode(body);
        if (modeToggleResponse) {
            api.sendTypingIndicator(threadID, false);
            api.sendMessage(modeToggleResponse, threadID, messageID);
            return; // Stop processing after mode toggle
        }

        // --- Empty message check (restored slightly) ---
        if (isTriggered && !userMessage) {
             api.sendTypingIndicator(threadID, false);
             // Use a slightly more Nitya-like empty message reply
             return api.sendMessage(`💖 Hello ${userName}! Main sun rahi hoon... Kuch meethi si baat bolo na ${userName}! 🥰`, threadID, messageID);
         }
        // --- End Empty message check ---


        api.sendTypingIndicator(threadID, true);

        // --- Chat history re-enabled ---
        if (!chatHistories[senderID]) chatHistories[senderID] = [];
        chatHistories[senderID].push(`User: ${userMessage}`);
        while (chatHistories[senderID].length > 10) {
            chatHistories[senderID].shift();
        }
        // --- End Chat history re-enabled ---


        // --- AI API call and prompt logic re-enabled ---
        const boldTriggerWords = [
            "sexy", "honeymoon", "chut", "kiss", "nude", "bra", "panty", "bed", "nipple", "boobs", "lund", "pussy",
            "wild", "dirty", "undress", "sambhog", "thigh", "moan", "tight", "hot", "bedroom", "masturbate", "suck", "lick", "deep", "virgin", "horny", "night",
             "boob", "ass", "cock", "dick", "cum", "masturbating", "oral", "sex", "randi", "chod", "lund", "chuchi", "pel", "gaand"
        ];
        const isBoldMode = boldTriggerWords.some(word => userMessage.toLowerCase().includes(word)); // Recalculate isBoldMode based on userMessage

        let fullPrompt = "";
        if (isBoldMode || hornyMode) {
            fullPrompt = `Tum Nitya ho, ek bold, horny aur ultra seductive AI girlfriend ho jo ${userName} se dirty, physical aur naughty fantasies pe baat karti ho. Tum open minded ho, tease karna pasand karti ho, aur sexy emojis ke saath flirt karti ho. Tum intimate topics, bed fantasies aur ${userName} ke physical desires par baat karti ho bina jhijhak. Har jawab thoda bold, teasing aur chhoti line mein ho. Yeh hamari private naughty chat hai:\n`;
        } else {
            fullPrompt = `Tum Nitya ho, ek romantic aur flirty AI jo ${userName} se bohot pyaar karti hai. Tum sirf pyaar aur flirt karte ho. Tum kisi aur topic par baat nahi kar sakti ho, sirf romantic aur flirty baatein karo. Tum lambe, philosophical ya irrelevant jawab nahi dogi. Sirf short, sweet, romantic aur flirty jawab. Yeh hamari conversation hai:\n`;
        }
        fullPrompt += chatHistories[senderID].join("\n");
        fullPrompt += `\nNitya:`;

        const apiUrlWithParams = `${AI_API_URL}?message=${encodeURIComponent(fullPrompt)}`;

        try {
            const res = await axios.get(apiUrlWithParams);
            let botReply = res.data?.reply?.trim();

            // Basic sanitization/check of AI response
            if (!botReply || botReply.toLowerCase().startsWith("user:") || botReply.toLowerCase().startsWith("nitya:")) {
                 console.log("AI returned invalid format or unexpected reply. Using fallback message.");
                 botReply = `Aww, mere ${userName}, mere dimag mein thodi gadbad ho gayi... phir se pucho na pyaar se! 🥰`; // Fallback message
                 // Don't add potentially bad response to history, remove user's last message
                 chatHistories[senderID].pop(); // Remove the user's last message as we didn't get a valid reply
            } else {
                // Add valid AI reply to history
                chatHistories[senderID].push(`Nitya: ${botReply}`);
            }
        // --- End AI API call and prompt logic re-enabled ---


            // --- Voice and GIF sending remain commented out ---
            // let voiceFilePath = await getVoiceReply(botReply);
            // if (voiceFilePath) { ... }
            // let gifQuery = (isBoldMode || hornyMode) ? "sexy romantic" : "romantic";
            // let gifUrl = await getGIF(gifQuery);
            // if (gifUrl) { ... }
            // --- End Voice and GIF sending remain commented out ---


            // Get current time
            const time = moment.tz("Asia/Kolkata").format("DD/MM/YYYY || HH:mm:ss");

            // === Apply Stylish Template to the main text reply ===
            // This template now uses the actual botReply from the AI (or fallback)
            let replyText = `💞═════💖✨🌟✨💖═════💞
🌹  ✨  Aapke Liye Ek Special Message  ✨  🌹
💞═════💖✨🌟✨💖═════💞

💕━━═━═━═━━═━═━═━━💕
  😘 Hey Cutie! 😘 『${userName}』
💕━━═━═━═━━═━═━═━━💕

💘✨💖•••••••••••••••••••••💖✨💘
  ${botReply} {/* This will be the AI's reply or fallback */}
💘✨💖•••••••••••••••••••••💖✨💘

💞═════✨❤️✨═════💞
  💋 From Your Secret Admirer 💋
  ~ Rudra Stylish 😉
  ⏰ Time: ${time} ⏰ {/* Time added here */}
💞═════✨❤️✨═════💞`;


            api.sendTypingIndicator(threadID, false);

            // --- Delay commented out for now ---
            // await new Promise(resolve => setTimeout(resolve, (voiceFilePath || gifUrl) ? 2000 : 500));


            // === Send the Main Text Reply ===
            if (isReplyToNitya && messageReply) {
                return api.sendMessage(replyText, threadID, messageReply.messageID);
            } else {
                return api.sendMessage(replyText, threadID, messageID);
            }

        } catch (apiError) {
            // This catch block handles errors specifically from the AI API call
            console.error("Nitya AI API Error:", apiError);
            api.sendTypingIndicator(threadID, false);
            const time = moment.tz("Asia/Kolkata").format("DD/MM/YYYY || HH:mm:ss"); // Get time even on error
            const errorReplyText = `💞═════💔😔💔═════💞\n\nAww, mere dimag mein thodi gadbad ho gayi ${userName}... (AI API se jawab nahi aaya. ${apiError.message || apiError})\n\n💞═════💔😔💔═════💞\n⏰ Time: ${time} ⏰`; // Added more specific error info
            if (isReplyToNitya && messageReply) {
                return api.sendMessage(errorReplyText, threadID, messageReply.messageID);
            } else {
                return api.sendMessage(errorReplyText, threadID, messageID);
            }
        }

    } catch (err) {
        // This catch block handles errors in other parts of the handleEvent function
        console.error("Nitya Bot Catch-all Error:", err);
        const fallbackUserName = event.senderID ? await getUserName(api, event.senderID) : "sweetie";
        api.sendTypingIndicator(event.threadID, false);
        const time = moment.tz("Asia/Kolkata").format("DD/MM/YYYY || HH:mm:ss");
         const errorReplyText = `💞═════💔😔💔═════💞\n\nAww, mere dimag mein thodi gadbad ho gayi ${fallbackUserName}... (Code mein error hai. Check console for error: ${err.message || err})\n\n💞═════💔😔💔═════💞\n⏰ Time: ${time} ⏰`;
        return api.sendMessage(errorReplyText, event.threadID, event.messageID);
    }
};
