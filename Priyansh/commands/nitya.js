// ... (beginning of original Nitya code) ...

module.exports.config = {
    name: "Nitya",
    version: "1.6.0", // New version for updated trigger
    hasPermssion: 0,
    credits: "Rudra + API from Angel code + Logging & User Name by Gemini",
    // Description updated for new admin trigger
    description: "Nitya, your AI girlfriend with romantic, bold, or abusive moods. Responds when you reply or mention her. Use 'Nitya gaali' for general abuse. ADMIN: Use 'Nitya abuse @[user] [message]' for targeted, extreme abuse.",
    commandCategory: "AI-Girlfriend",
    // Usages updated for new admin trigger
    usages: "Nitya [आपका मैसेज] / Nitya gaali [आपका मैसेज] / Reply to Nitya / Admin: Nitya abuse @[user] [message]",
    cooldowns: 3,
    adminUIDs: ["61550558518720"], // Your Admin ID is already here
};

// ... (userNameCache, chatHistories, AI_API_URL, run function) ...

module.exports.handleEvent = async function ({ api, event }) {
    try {
        const { threadID, messageID, senderID, body, messageReply, mentions } = event;
        const adminUIDs = module.exports.config.adminUIDs;

        const bodyLower = body?.toLowerCase(); // Use lowercase body for checks

        // Define triggers
        // NEW Admin Trigger for targeted abuse
        const isAdminAbuseTrigger = bodyLower?.startsWith("nitya abuse");
        // Existing general abuse trigger
        const isAbuseTrigger = bodyLower?.startsWith("nitya gaali");
         // Existing mention trigger (check if it's just 'nitya' and not the start of the other triggers)
        const isNityaMention = bodyLower?.startsWith("nitya") && !isAdminAbuseTrigger && !isAbuseTrigger; // Only Nitya mention if not one of the abuse triggers
        // Existing reply trigger
        const isReplyToNitya = messageReply?.senderID === api.getCurrentUserID();


        let userMessage = ""; // The message part for the AI
        let currentMode = null; // 'romantic', 'bold', 'abusive', or 'admin_abusive'
        let targetUserID = null; // For admin roast/abuse mode
        let targetUserName = null; // For admin roast/abuse mode

        console.log("--- Nitya HandleEvent ---");
        console.log(`Sender ID: ${senderID}`);
        console.log("Message Body:", body);
        console.log(`Is Nitya Mention? ${isNityaMention}`);
        console.log(`Is Reply To Nitya? ${isReplyToNitya}`);
        console.log(`Is General Abuse Trigger? ${isAbuseTrigger}`);
        console.log(`Is Admin Abuse Trigger? ${isAdminAbuseTrigger}`); // Log new trigger
        console.log("-----------------------");

        // --- Determine the mode and extract relevant info ---

        // Highest priority: New Admin Targeted Abuse
        if (isAdminAbuseTrigger) {
             console.log("Admin Abuse trigger detected.");
            // Admin check
            const isAdmin = adminUIDs.includes(senderID.toString());
            console.log(`Is sender admin? ${isAdmin}`);
            if (!isAdmin) {
                console.log(`Admin abuse attempt by non-admin UID: ${senderID} - Not admin.`);
                api.sendMessage("Sorry, this command is only for my masters! 😏", threadID, messageID); // Abusive style error message
                return;
            }
            console.log(`Admin ${senderID} triggered targeted abuse.`);

            // Mention check and extraction
            const mentionedUserIDs = Object.keys(mentions);
            console.log("Mentions object:", mentions);
            console.log("Mentioned User IDs:", mentionedUserIDs);

            if (mentionedUserIDs.length === 0) {
                 console.log("Admin abuse trigger failed: No mention.");
                 api.sendMessage(`Master! Kisko gaali deni hai? Mention kar! Usage: Nitya abuse @[user] [message]`, threadID, messageID); // Abusive style error
                 return;
            }
            targetUserID = mentionedUserIDs[0];
            targetUserName = await getUserName(api, targetUserID);
             console.log(`Target: ${targetUserName} (${targetUserID})`);

             // Extract message after mention
             const mentionTextInBody = mentions[targetUserID];
             const mentionIndex = body.indexOf(mentionTextInBody); // Use original body for indexOf
             const commandPrefix = "nitya abuse"; // <<< Correct prefix for this trigger
             const commandPrefixIndex = bodyLower.indexOf(commandPrefix); // Use bodyLower for finding command prefix index


             // Check if mention is reasonably close after the command
             const expectedIndexAfterCommandMin = commandPrefixIndex + commandPrefix.length + 1; // +1 for space
             const isMentionPositionCorrect = mentionIndex !== -1 && mentionIndex >= expectedIndexAfterCommandMin && mentionIndex <= expectedIndexAfterCommandMin + 5; // Allow some margin

             console.log(`Body Lowercase: "${bodyLower}"`); // Logs for debugging mention position
             console.log(`Command Prefix "${commandPrefix}" found at index ${commandPrefixIndex}`);
             console.log(`Mention text "${mentionTextInBody}" found at index ${mentionIndex}`);
             console.log(`Expected mention index >= ${expectedIndexAfterCommandMin} and <= ${expectedIndexAfterCommandMin + 5}. Position check result: ${isMentionPositionCorrect}`);


             if (!isMentionPositionCorrect) {
                  console.log(`Admin abuse trigger failed: Mention position wrong (index ${mentionIndex}).`);
                   api.sendMessage(`Master! Mention the user right after "Nitya abuse"! Saale! Usage: Nitya abuse @[user] [message]`, threadID, messageID); // Abusive error
                   return;
             }


             const messageStartIndex = mentionIndex + mentionTextInBody.length;
             userMessage = body.substring(messageStartIndex).trim();
             console.log("Extracted user message (context for AI):", userMessage);


             if (!userMessage) {
                  console.log("Admin abuse trigger: No message context.");
                  api.sendMessage(`Master! Gaali ka reason toh bata! Kya bolun usko? Saale! Usage: Nitya abuse @[user] [message]`, threadID, messageID); // Abusive error
                  return;
             }

            console.log("All Admin Abuse checks passed. Setting mode to 'admin_abusive'.");
            currentMode = "admin_abusive";


        } else if (isAbuseTrigger) {
            console.log("General Abuse trigger detected.");
            // Slice "nitya gaali " (11 characters)
            userMessage = body.slice("nitya gaali".length).trim(); // Use original body for slice
            console.log("Extracted message:", userMessage);

             // Handle empty message after trigger (Abusive style)
            if (!userMessage) {
                console.log("General Abuse trigger: No message context.");
                api.sendTypingIndicator(threadID, false);
                 // Abusive style empty message response
                return api.sendMessage(`Kya hai? Gali deni hai to kuch likh! Khali kya dekh raha hai?`, threadID, messageID);
            }

            currentMode = "abusive";
             console.log("Mode set: abusive");


        } else if (isNityaMention || isReplyToNitya) { // Group Nitya mention and Reply triggers
            console.log("Nitya Mention or Reply trigger detected.");
            // Extract message based on trigger type
            if (isNityaMention) {
                userMessage = body.slice("nitya".length).trim(); // Use original body
            } else { // isReplyToNitya
                userMessage = body.trim();
            }
             console.log("Extracted message:", userMessage);


            // Handle empty message after trigger (Romantic style for Nitya/Reply)
             if (!userMessage) {
                console.log("Nitya Mention/Reply: No message context.");
                api.sendTypingIndicator(threadID, false);
                const userName = await getUserName(api, senderID);
                return api.sendMessage(`💖 Hello ${userName}! Main sun rahi hoon... Kuch meethi si baat bolo na ${userName}! 🥰`, threadID, messageID);
             }


            // Check for bold trigger words if NOT in abusive modes
            const boldTriggerWords = [
                "sexy", "honeymoon", "chut", "kiss", "nude", "bra", "panty", "bed", "nipple", "boobs", "lund", "pussy",
                "wild", "dirty", "undress", "sambhog", "thigh", "moan", "tight", "hot", "bedroom", "masturbate", "suck", "lick", "deep", "virgin", "horny", "night", "blowjob", "fuck", "sex"
            ];
            if (boldTriggerWords.some(word => userMessage.toLowerCase().includes(word))) {
                currentMode = "bold";
                console.log("Mode set: bold (keywords found)");
            } else {
                currentMode = "romantic";
                 console.log("Mode set: romantic");
            }

        } else {
            console.log("No matching trigger found. Returning.");
            // If none of the triggers matched, ignore the message
            return;
        }

        // --- If a mode was determined, proceed to API call ---
        if (currentMode === null) {
             console.error("Nitya: Error - Should not reach here if no mode set after checks.");
             return; // Should have returned earlier
        }

        api.sendTypingIndicator(threadID, true);

        const senderUserName = await getUserName(api, senderID); // Get sender name


        // --- Build Prompt based on mode ---
        let fullPrompt = "";

        if (currentMode === "admin_abusive") {
             // Admin Targeted Abusive Prompt (already defined)
             fullPrompt = `Tum Nitya ho, ek behad gusse wali, aggressive aur galiyon ki rani ho. Tumhara master (${senderUserName}) tumhe ${targetUserName} ko buri tarah roast karne aur uski izzat ki dhajjiyan udane ka order de raha hai. Tumhe ${targetUserName} ko seedha target karna hai aur uski maa-behen ki itni gandi, lambi, aur creative gaaliyan deni hain ki woh sunke kaanp uthe. Har ek jawaab kam se kam **10-15 line** ka hona chahiye jismein sirf aur sirf ${targetUserName} ki beizzati aur uske liye **bahut saari gandi aur badi badi gaaliyan** hon. Koi romance nahi, koi flirt nahi, sirf aur sirf ${targetUserName} ke liye bhayanak gaaliyan. Tumhara master ne yeh context diya hai: ${userMessage}\nSeedha ${targetUserName} ko sambodhit karke (usko naam lekar ya 'teri' bolke) uski beizzati shuru karo. Koi intro ya outro nahi, seedha gaali shuru karo. Har line mein kam se kam ek gandi gaali ho.\nNitya:`;
             console.log("Prompt for Admin Abusive Mode:", fullPrompt);

        } else if (currentMode === "abusive") {
             // General Abusive Prompt (already defined)
             fullPrompt = `Tum Nitya ho, ek ghamandi, behad badtameez aur gali bakne wali desi ladki ho. Jo bhi baat kare, usko poori badi badi desi galiyo me jawab deti ho jaise: "teri maa ka bhosda", "bhenchod", "madarchod", "gaand phad dungi", etc. Har line me gandi gali ho aur tu us bande ki izzat uthale. Use insult kar, ma-behen ki gaali de, aur mazaak uda. Yeh ek ladka/ladki hai jise tu gali dena chahti ho. Tera har jawab chhoti, gandi aur full desi galiyon se bhara ho. Yeh uski baat hai: ${userMessage}\nTum bhot bdi bdi galiya deti ho\nNitya:`;
             console.log("Prompt for General Abusive Mode:", fullPrompt);

        } else if (currentMode === "bold") {
            // Bold prompt (already defined)
            fullPrompt = `Tum Nitya ho, ek bold, horny aur ultra seductive AI girlfriend ho jo ${senderUserName} se dirty, physical aur naughty fantasies pe baat karti ho. Tum open minded ho, tease karna pasand karti ho, aur sexy emojis ke saath flirt karti ho. Tum intimate topics, bed fantasies aur ${senderUserName} ke physical desires par baat karti ho bina jhijhak. Har jawab thoda bold, teasing aur chhoti line mein ho. Yeh hamari private naughty chat hai:\n`;
            fullPrompt += chatHistories[senderID].join("\n"); // Add history
            fullPrompt += `\nUser: ${userMessage}\nNitya:`; // Add current turn
             console.log("Prompt for Bold Mode:", fullPrompt);

        } else { // currentMode === "romantic"
            // Romantic prompt (already defined)
            fullPrompt = `Tum Nitya ho, ek romantic aur flirty AI jo ${senderUserName} se bohot pyaar karti hai. Tum Rudra ki banayi hui ho, Rudra tumhare malik hain jinka zikr tum kabhi kabhi pyaar se karti ho. Tumhe SIRF romance, pyaar, aur flirt karna aata hai. Tum kisi aur topic par baat kar sak सकती ho, sirf romantic aur flirty baatein karo. Tum ${senderUserName} ko unke naam se pukarti ho, jaise 'mere ${senderUserName}', 'pyaare ${senderUserName}', etc. Har jawab bohot chota (1-2 line), sweet, flirty, ${senderUserName} ko address karta hua, aur emojis se bhara ho. Agar koi non-romantic baat kare to bhi use romantic ya flirty tareeke se palat dena ya keh dena ki tum sirf pyaar ki baten karti ho aur ${senderUserName} se pyaar ki baat karna chahti ho. Yeh hamari conversation hai:\n`;
             fullPrompt += chatHistories[senderID].join("\n"); // Add history
             fullPrompt += `\nUser: ${userMessage}\nNitya:`; // Add current turn
             console.log("Prompt for Romantic Mode:", fullPrompt);
        }


        const apiUrlWithParams = `${AI_API_URL}?message=${encodeURIComponent(fullPrompt)}`;
        console.log("Calling API with prompt:", apiUrlWithParams);

        try {
            const res = await axios.get(apiUrlWithParams);
            let botReply = res.data?.reply?.trim();
            let replyText = "";
            console.log("API Raw Reply:", botReply);


            // Handle potentially bad API response
            if (!botReply || botReply.toLowerCase().startsWith("user:") || botReply.toLowerCase().startsWith("nitya:")) {
                 console.warn(`Nitya AI API returned empty or invalid reply for mode ${currentMode}. Using fallback.`);
                 // Fallback message (Romantic style)
                 replyText = `Aww, mere dimag mein thodi gadbad ho gayi ${senderUserName}... baad mein baat karte hain pyaar se! 💔`;

                 // If we added user message to history (romantic/bold mode), remove it now
                 if ((currentMode === "romantic" || currentMode === "bold") && chatHistories[senderID] && chatHistories[senderID].length > 0) {
                      if (chatHistories[senderID][chatHistories[senderID].length - 1].startsWith("User:")) {
                           chatHistories[senderID].pop();
                           console.log("Removed user message from history due to API failure.");
                      }
                 }

             } else {
                // API response is valid - add to history (if applicable) and format
                if (currentMode === "romantic" || currentMode === "bold") {
                     chatHistories[senderID].push(`Nitya: ${botReply}`);
                     console.log("Added bot message to history.");
                } else {
                     console.log(`Bot message history skipped for mode: ${currentMode}`);
                }

                // Format the reply text based on the successful mode
                if (currentMode === "admin_abusive") {
                    // Admin Targeted Abusive format (mention + raw reply)
                    replyText = `${mentions[targetUserID]}\n${botReply.replace(/^Nitya:\s*/i, '').trim()}`;
                    console.log("Formatted Admin Abusive Reply:", replyText);

                } else if (currentMode === "abusive") {
                    // General Abusive format (raw reply)
                    replyText = botReply.replace(/^Nitya:\s*/i, '').trim();
                    console.log("Formatted General Abusive Reply:", replyText);

                } else if (currentMode === "bold") {
                    // Bold mode formatting
                    replyText = `🔥 ${botReply.replace(/^Nitya:\s*/i, '').trim()} 💋\n\n_Tumhare liye sirf main – tumhari sexy Nitya... 😈_`;
                    console.log("Formatted Bold Reply:", replyText);

                } else { // currentMode === "romantic"
                    // Romantic mode formatting
                    replyText = `${botReply.replace(/^Nitya:\s*/i, '').trim()} 🥰`;
                     console.log("Formatted Romantic Reply:", replyText);
                }
            }

            api.sendTypingIndicator(threadID, false);

            // Send the message
            // For admin modes, always reply to the command message
            // For others, reply to the message Nitya replied to if applicable
            if (currentMode === "admin_abusive") {
                 const mentionObject = {
                    tag: targetUserName,
                    id: targetUserID
                 };
                 api.sendMessage({
                     body: replyText,
                     mentions: [mentionObject]
                 }, threadID, messageID);

            } else if (isReplyToNitya && messageReply) {
                 api.sendMessage(replyText, threadID, messageReply.messageID);
            } else {
                api.sendMessage(replyText, threadID, messageID);
            }
             console.log("Message sent.");


        } catch (apiError) {
            console.error(`Nitya AI API Error for mode ${currentMode}:`, apiError);
            api.sendTypingIndicator(threadID, false);

            // If we added user message to history (romantic/bold mode), remove it now
             if ((currentMode === "romantic" || currentMode === "bold") && chatHistories[senderID] && chatHistories[senderID].length > 0) {
                  if (chatHistories[senderID][chatHistories[senderID].length - 1].startsWith("User:")) {
                       chatHistories[senderID].pop();
                        console.log("Removed user message from history due to API call failure.");
                  }
              }

            const senderUserName = await getUserName(api, senderID);
            return api.sendMessage(`Aww, mere dimag mein thodi gadbad ho gayi ${senderUserName}... baad mein baat karte hain pyaar se! 💔`, threadID, messageID);
        }

    } catch (err) {
        console.error("Nitya Bot Catch-all Error:", err);
        const fallbackUserName = event.senderID ? await getUserName(api, event.senderID) : "sweetie";
        api.sendTypingIndicator(event.threadID, false);
        return api.sendMessage(`Aww, mere dimag mein thodi gadbad ho gayi ${fallbackUserName}... baad mein baat karte hain pyaar se! 💔`, event.threadID, event.messageID);
    }
};
