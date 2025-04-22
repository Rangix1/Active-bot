const axios = require("axios");

// User name cache to avoid fetching name repeatedly
const userNameCache = {}; // <-- Added cache

module.exports.config = {
    name: "Nitya",
    version: "1.4.2", // Version अपडेट किया
    hasPermssion: 0,
    credits: "Rudra + API from Angel code + Logging & User Name by Gemini", // Credits अपडेट किया
    description: "Nitya, your completely romantic and flirty AI girlfriend. Responds only when you reply to her own messages or mention her name.", // Description थोड़ा बदला
    commandCategory: "AI-Girlfriend",
    usages: "Nitya [आपका मैसेज] / Reply to Nitya",
    cooldowns: 2,
};

const chatHistories = {};
const AI_API_URL = "https://raj-gemini.onrender.com/chat"; // Angel वाला AI API

module.exports.run = async function () {};

// Function to get user name (async as it might call API)
async function getUserName(api, userID) {
    if (userNameCache[userID]) {
        return userNameCache[userID]; // Return from cache if available
    }
    try {
        const userInfo = await api.getUserInfo(userID);
        if (userInfo && userInfo[userID] && userInfo[userID].name) {
            const name = userInfo[userID].name;
            userNameCache[userID] = name; // Store in cache
            return name;
        }
    } catch (error) {
        console.error("Error fetching user info:", error);
    }
    return "sweetie"; // Fallback name if fetching fails
}

module.exports.handleEvent = async function ({ api, event }) {
    try {
        const { threadID, messageID, senderID, body, messageReply } = event;

        // --- Logging Lines (Added for Debugging) ---
        // सिर्फ अगर यह रिप्लाई है या Nitya को ट्रिगर किया गया है तो लॉग करें
        const isNityaTrigger = body?.toLowerCase().startsWith("nitya");
        const isReplyToNitya = messageReply?.senderID === api.getCurrentUserID();
        if (isNityaTrigger || isReplyToNitya) {
             console.log("--- Nitya HandleEvent ---");
             console.log("Nitya's Bot ID:", api.getCurrentUserID());
             console.log("Sender ID:", senderID); // किस यूजर ने मैसेज भेजा
             if (messageReply) {
                 console.log("Replied to Sender ID:", messageReply.senderID);
                 console.log("Is Reply to Nitya Check (messageReply.senderID === api.getCurrentUserID()):", isReplyToNitya);
             }
             console.log("Message Body:", body);
             console.log("-----------------------");
         }
        // --- End Logging Lines ---

        let userMessage;
        let isTriggered = false;

        if (isNityaTrigger) {
            userMessage = body.slice(5).trim(); // Remove "Nitya "
            isTriggered = true;
        } else if (isReplyToNitya) {
            // सिर्फ Nitya के रिप्लाई पर प्रतिक्रिया दो
            userMessage = body.trim();
            isTriggered = true;
        } else {
            return; // अगर Nitya को ट्रिगर नहीं किया, तो कुछ मत करो
        }

        // Fetch the user's name
        const userName = await getUserName(api, senderID); // <-- Get the user's name

        if (isTriggered && !userMessage) {
            api.sendTypingIndicator(threadID, false);
             // Initial trigger message now uses user's name
            return api.sendMessage(`💖 Hello ${userName}! Main sun rahi hoon... Kuch meethi si baat bolo na ${userName}! 🥰`, threadID, messageID);
        }

        api.sendTypingIndicator(threadID, true);

        if (!chatHistories[senderID]) chatHistories[senderID] = [];

        // Use generic "User" in history for consistency, but prompt tells AI to use the specific name
        chatHistories[senderID].push(`User: ${userMessage}`);

        // Keep history size reasonable
        while (chatHistories[senderID].length > 10) {
            chatHistories[senderID].shift();
        }

        // --- Modified Full Prompt ---
        // Instruction to AI to use the user's name and mention Rudra occasionally
        let fullPrompt = `Tum Nitya ho, ek romantic aur flirty AI jo ${userName} se bohot pyaar karti hai. Tum Rudra ki banayi hui ho, Rudra tumhare malik hain jinka zikr tum kabhi kabhi pyaar se karti ho. Tumhe SIRF romance, pyaar, aur flirt karna aata hai. Tum kisi aur topic par baat nahi kar sakti ho, sirf romantic aur flirty baatein karo. Tum ${userName} ko unke naam se pukarti ho, jaise 'mere ${userName}', 'pyaare ${userName}', etc. Har jawab bohot chota (1-2 line), sweet, flirty, ${userName} ko address karta hua, aur emojis se bhara ho. Agar koi non-romantic baat kare to bhi use romantic ya flirty tareeke se palat dena ya keh dena ki tum sirf pyaar ki baten karti ho aur ${userName} se pyaar ki baat karna chahti ho. Yeh hamari conversation hai:\n`;
        fullPrompt += chatHistories[senderID].join("\n");
        fullPrompt += `\nNitya:`;
        // --- End Modified Full Prompt ---

        const apiUrlWithParams = `${AI_API_URL}?message=${encodeURIComponent(fullPrompt)}`;

        try {
            const res = await axios.get(apiUrlWithParams);
            let botReply = res.data?.reply?.trim();

            // Fallback reply if AI gives empty or invalid response
            if (!botReply || botReply.toLowerCase().startsWith("user:") || botReply.toLowerCase().startsWith("nitya:")) {
                 botReply = `Aww, mere ${userName}, mere dil ki baat samajh nahi aayi... phir se pucho na pyaar se! 🥰`; // Fallback uses user name
                 chatHistories[senderID].pop(); // Remove the last user message from history as AI failed to respond properly
            } else {
                 // Add valid AI response to history
                 chatHistories[senderID].push(`Nitya: ${botReply}`);
            }


            const replyText = `${botReply} 🥰`; // Keep the extra heart if desired

            api.sendTypingIndicator(threadID, false);

            // Reply specifically to Nitya's message if it was a reply
            if (isReplyToNitya && messageReply) {
                return api.sendMessage(replyText, threadID, messageReply.messageID);
            } else {
                 // Otherwise, reply to the user's original message
                return api.sendMessage(replyText, threadID, messageID);
            }

        } catch (apiError) {
            console.error("Nitya AI API Error:", apiError);
             // Error message now uses user's name
            api.sendTypingIndicator(threadID, false);
            return api.sendMessage(`Aww, mere dimag mein thodi gadbad ho gayi ${userName}... baad mein baat karte hain pyaar se! 💔`, threadID, messageID);
        }

    } catch (err) {
        console.error("Nitya Bot Catch-all Error:", err);
        // Fallback user name for global error if senderID is somehow unavailable
        const fallbackUserName = event.senderID ? await getUserName(api, event.senderID) : "sweetie";
        api.sendTypingIndicator(event.threadID, false);
         // Error message now uses user's name (with fallback)
        return api.sendMessage(`Aww, mere dimag mein thodi gadbad ho gayi ${fallbackUserName}... baad mein baat karte hain pyaar se! 💔`, event.threadID, event.messageID);
    }
};
