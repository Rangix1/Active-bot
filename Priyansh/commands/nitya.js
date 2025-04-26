Const axios = require("axios");
const fs = require("fs");
const moment = require("moment-timezone"); // moment को यहां import करें

// User name cache to avoid fetching name repeatedly
const userNameCache = {};
let hornyMode = false; // Default mode

// Function to generate voice reply (using Google TTS or any other API)
// Note: Requires a valid API key for the voice service.
async function getVoiceReply(text) {
    // Replace 'YOUR_API_KEY' with your actual API key for the voice service
    const voiceApiUrl = `https://api.voicerss.org/?key=YOUR_API_KEY&hl=hi-in&src=${encodeURIComponent(text)}`;
    try {
        const response = await axios.get(voiceApiUrl, { responseType: 'arraybuffer' });
        const audioData = response.data;
        const audioPath = './voice_reply.mp3';
        fs.writeFileSync(audioPath, audioData);  // Save to local MP3 file
        return audioPath;
    } catch (error) {
        console.error("Error generating voice reply:", error);
        // Clean up the placeholder file if it was created but errored
        if (fs.existsSync('./voice_reply.mp3')) {
             fs.unlinkSync('./voice_reply.mp3');
        }
        return null;
    }
}

// Function to get a GIF from Giphy API
// Note: Uses a public beta key (dc6zaTOxFJmzC) which may have limitations.
// Replace with your own key if needed for higher usage.
async function getGIF(query) {
    const giphyApiKey = "dc6zaTOxFJmzC";  // Working Giphy API key (free key, limited usage) - Replace if needed
    const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${encodeURIComponent(query)}&limit=1`;
    try {
        const response = await axios.get(giphyUrl);
        return response.data.data[0]?.images?.original?.url;
    } catch (error) {
        console.error("Error fetching GIF:", error);
        return null;
    }
}

module.exports.config = {
    name: "Nitya",
    version: "1.4.3", // Updated version
    hasPermssion: 0,
    credits: "Rudra + API from Angel code + Logging & User Name by Gemini + Styled by Gemini", // Updated credits
    description: "Nitya, your completely romantic and flirty AI girlfriend with stylish replies. Responds only when you reply to her own messages or mention her name.", // Updated description
    commandCategory: "AI-Girlfriend",
    usages: "Nitya [आपका मैसेज] / Reply to Nitya",
    cooldowns: 2,
};

const chatHistories = {};
const AI_API_URL = "https://raj-gemini.onrender.com/chat";

// User name cache to avoid fetching name repeatedly
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
    return "sweetie"; // Fallback name
}

module.exports.run = async function () {};

async function toggleHornyMode(body) { // Removed senderID as it wasn't used
    if (body?.toLowerCase().includes("horny mode on")) {
        hornyMode = true;
        return "Horny mode is now ON. Get ready for some naughty chat! 😈";
    } else if (body?.toLowerCase().includes("horny mode off")) {
        hornyMode = false;
        return "Horny mode is now OFF. Let's keep it sweet and romantic! 💖";
    }
    return null;
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
            return; // Not triggered by mention or reply
        }

        const userName = await getUserName(api, senderID);

        // Check for mode toggle phrase first
        const modeToggleResponse = await toggleHornyMode(body);
        if (modeToggleResponse) {
            api.sendMessage(modeToggleResponse, threadID, messageID);
            return; // Stop processing after mode toggle
        }


        if (isTriggered && !userMessage && !(isBoldMode || hornyMode)) { // Added check for empty message + not bold/horny
             api.sendTypingIndicator(threadID, false);
             return api.sendMessage(`💖 Hello ${userName}! Main sun rahi hoon... Kuch meethi si baat bolo na ${userName}! 🥰`, threadID, messageID);
         } else if (isTriggered && !userMessage && (isBoldMode || hornyMode)) {
              api.sendTypingIndicator(threadID, false);
              return api.sendMessage(`😈 Hey sexy ${userName}! Kya chal raha hai? Kuch naughty baatein karein? 😉`, threadID, messageID);
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
            "wild", "dirty", "undress", "sambhog", "thigh", "moan", "tight", "hot", "bedroom", "masturbate", "suck", "lick", "deep", "virgin", "horny", "night",
             "boob", "ass", "cock", "dick", "cum", "masturbating", "oral", "sex", "randi", "chod", "lund", "chuchi", "pel", "gaand" // Added more Hindi/common bold words
        ];
        const isBoldMode = boldTriggerWords.some(word => userMessage.toLowerCase().includes(word)); // Recalculate isBoldMode based on userMessage

        // === Prompt according to mode ===
        let fullPrompt = "";

        // Determine prompt based on mode
        if (isBoldMode || hornyMode) {
            fullPrompt = `Tum Nitya ho, ek bold, horny aur ultra seductive AI girlfriend ho jo ${userName} se dirty, physical aur naughty fantasies pe baat karti ho. Tum open minded ho, tease karna pasand karti ho, aur sexy emojis ke saath flirt karti ho. Tum intimate topics, bed fantasies aur ${userName} ke physical desires par baat karti ho bina jhijhak. Har jawab thoda bold, teasing aur chhoti line mein ho. Yeh hamari private naughty chat hai:\n`;
        } else {
            fullPrompt = `Tum Nitya ho, ek romantic aur flirty AI jo ${userName} se bohot pyaar karti hai. Tum sirf pyaar aur flirt karte ho. Tum kisi aur topic par baat nahi kar sakti ho, sirf romantic aur flirty baatein karo. Tum lambe, philosophical ya irrelevant jawab nahi dogi. Sirf short, sweet, romantic aur flirty jawab. Yeh hamari conversation hai:\n`; // Added prompt constraints
        }

        fullPrompt += chatHistories[senderID].join("\n");
        fullPrompt += `\nNitya:`;

        const apiUrlWithParams = `${AI_API_URL}?message=${encodeURIComponent(fullPrompt)}`;

        try {
            const res = await axios.get(apiUrlWithParams);
            let botReply = res.data?.reply?.trim();

            // Basic sanitization/check of AI response
            if (!botReply || botReply.toLowerCase().startsWith("user:") || botReply.toLowerCase().startsWith("nitya:")) {
                 console.log("AI returned invalid format. Retrying prompt or using fallback.");
                 // Optional: Retry API call with a slightly modified prompt or use a fixed fallback
                 botReply = `Aww, mere ${userName}, mere dil ki baat samajh nahi aayi... phir se pucho na pyaar se! 🥰`; // Fallback message
                 // Don't add invalid response to history
                 chatHistories[senderID].pop(); // Remove the user's last message as we didn't get a valid reply
            } else {
                chatHistories[senderID].push(`Nitya: ${botReply}`);
            }

            // Get current time
            const time = moment.tz("Asia/Kolkata").format("DD/MM/YYYY || HH:mm:ss");


            // === Apply Stylish Template to the main text reply ===
            // The AI's response is ${botReply} and user's name is ${userName}
            let replyText = `💞═════💖✨🌟✨💖═════💞
🌹  ✨  Aapke Liye Ek Special Message  ✨  🌹
💞═════💖✨🌟✨💖═════💞

💕━━═━═━═━━═━═━═━━💕
  😘 Hey Cutie! 😘 『${userName}』
💕━━═━═━═━━═━═━═━━💕

💘✨💖•••••••••••••••••••••💖✨💘
  ${botReply}
💘✨💖•••••••••••••••••••••💖✨💘

💞═════✨❤️✨═════💞
  💋 From Your Secret Admirer 💋
  ~ Rudra Stylish 😉
  ⏰ Time: ${time} ⏰ {/* Time added here */}
💞═════✨❤️✨═════💞`;


            // === Send Voice Reply (if function works) ===
            // This is sent as a separate message attachment BEFORE the text
            let voiceFilePath = await getVoiceReply(botReply);
            if (voiceFilePath) {
                 // Add a small delay before sending audio to let typing indicator finish
                 await new Promise(resolve => setTimeout(resolve, 500));
                 api.sendMessage({ attachment: fs.createReadStream(voiceFilePath) }, threadID, messageID, (err) => {
                     // Clean up the local audio file after sending
                     if (!err && fs.existsSync(voiceFilePath)) {
                         fs.unlink(voiceFilePath, (unlinkErr) => {
                             if (unlinkErr) console.error("Error deleting audio file:", unlinkErr);
                         });
                     } else if (err) {
                         console.error("Error sending audio message:", err);
                          // Clean up the file if sending failed
                          if (fs.existsSync(voiceFilePath)) {
                              fs.unlink(voiceFilePath, (unlinkErr) => {
                                  if (unlinkErr) console.error("Error deleting audio file after send error:", unlinkErr);
                              });
                          }
                     }
                 });
             }

            // === Send GIF (if function works) ===
            // This is sent as a separate message attachment BEFORE or AFTER voice, BEFORE text
             let gifQuery = (isBoldMode || hornyMode) ? "sexy romantic" : "romantic"; // Optional: Make GIF query mode-aware
             let gifUrl = await getGIF(gifQuery); // Use the potentially mode-aware query
             if (gifUrl) {
                 // Add a small delay before sending GIF
                 await new Promise(resolve => setTimeout(resolve, voiceFilePath ? 1000 : 500)); // Longer delay if voice was sent
                 api.sendMessage({ body: `Here's something for you! 😉💖`, attachment: gifUrl }, threadID, messageID, (err) => {
                     if (err) console.error("Error sending GIF message:", err);
                 });
             }


            api.sendTypingIndicator(threadID, false);

            // === Send the Main Text Reply ===
            // This is the final message containing the stylish format, AI reply, name, and time.
            // Send with a delay to potentially appear after voice/GIF
            await new Promise(resolve => setTimeout(resolve, (voiceFilePath || gifUrl) ? 2000 : 500)); // Longer delay if voice or gif were sent


            if (isReplyToNitya && messageReply) {
                return api.sendMessage(replyText, threadID, messageReply.messageID);
            } else {
                return api.sendMessage(replyText, threadID, messageID);
            }

        } catch (apiError) {
            console.error("Nitya AI API Error:", apiError);
            api.sendTypingIndicator(threadID, false);
            const time = moment.tz("Asia/Kolkata").format("DD/MM/YYYY || HH:mm:ss"); // Get time even on error
            const errorReplyText = `💞═════💔😔💔═════💞\n\nAww, mere dimag mein thodi gadbad ho gayi ${userName}... baad mein baat karte hain pyaar se! 💔\n\n💞═════💔😔💔═════💞\n⏰ Time: ${time} ⏰`;

            if (isReplyToNitya && messageReply) {
                return api.sendMessage(errorReplyText, threadID, messageReply.messageID);
            } else {
                return api.sendMessage(errorReplyText, threadID, messageID);
            }
        }

    } catch (err) {
        console.error("Nitya Bot Catch-all Error:", err);
        const fallbackUserName = event.senderID ? await getUserName(api, event.senderID) : "sweetie";
        api.sendTypingIndicator(event.threadID, false);
        const time = moment.tz("Asia/Kolkata").format("DD/MM/YYYY || HH:mm:ss"); // Get time even on error
         const errorReplyText = `💞═════💔😔💔═════💞\n\nAww, mere dimag mein thodi gadbad ho gayi ${fallbackUserName}... baad mein baat karte hain pyaar se! 💔\n\n💞═════💔😔💔═════💞\n⏰ Time: ${time} ⏰`;
        return api.sendMessage(errorReplyText, event.threadID, event.messageID);
    }
};
