// Code modifying the original fyt.js file for conversation flow (no mentions, plain text name) - AGAIN

Module.exports.config = {
    name: "fyt", // *** Keeping the original fyt name ***
    version: "1.0.3", // Version update
    hasPermssion: 2, // *** Keeping the typo ***
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 + Google Gemini", // Added credits
    description: "Initiate a war by replying with the target's name (no mention).", // Updated description
    commandCategory: "wargroup", // Keeping as wargroup
    usages: "fyt", // No mention needed in initial command
    cooldowns: 7, // Keeping cooldown
    dependencies: {
        "fs-extra": "", // Keeping dependencies
        "axios": ""     // Keeping dependencies
    }
};

// Galiyan list (full list) - ADDING THIS TO THE FYT CODE
const galiyan = [
   `Teri maa ki chut mein ganna ghusa ke juice nikal dun, kutte ke pille tere jaise pe to thook bhi na phekhu main, aukat dekh ke muh khol haramkhor!`,
   `Bhosdike, tere jaise chhoti soch wale chhapriyo ka toh main churan banake nasha kar jaun, maa chod pagal aadmi!`,
   `Tere baap ka naak kaat diya kal, aur teri maa toh bolti thi beta engineer banega, chutiya nikla!`,
   `Teri gaand mein rocket daalke chand tak bhej du, vahan jakar aliens ko bhi chutiya bana ke aaega tu.`,
   `Abe chutmarani ke ladke, tu aaya firse gaand maraane? Tere liye toh gali bhi chhoti padti hai re behanchod!`,
   `Tere muh mein gobar bhar ke usko milkshake bana ke tujhe piladu, bhonsdi ke tere liye toh Safai Abhiyan chalani padegi.`,
   `Jab tu paida hua toh doctor ne bola tha, isko zinda chod diya toh samaj barbaad ho jaega, lekin teri maa boli — gaand mara ke paida kiya hai, zinda chhod!`,
   `Tere jaise chutiye ko toh gaali dena bhi beizzati hai gaali ki, phir bhi sun — teri maa ka bhosda, baap ka lund!`,
   `Tujhpe toh jis din bhagwan ka prakop aaya na, saala gaand se dhua nikal jaega, fir bhi tu sudhrega nahi be nalayak!`,
   `Abe teri maa ki aankh, tujhme toh gaand bhi nahi hai chaatne layak, aur attitude aisa jaise Elon Musk ka driver ho!`,
   `Oye bhadwe, teri maa ka bhosda aur baap ki gaand mein dhol bajaun, itna chutiya hai tu ki jaise haryana ke sabse bade bewakoof ka prototype ho.`,
   `Tere jaise nalayak ko dekh ke bhagwan bhi sochta होगा ki kyu banaya is haramkhor ko, kutti ke pyar se paida hua hai tu, chappal se pitega!`,
   `Gaand mein mirchi bhar ke chakki chalau tera, teri maa chillaegi – maaro mujhe maaro – aur tu side me selfie le raha hoga behanchod!`,
   `Tere ghar mein shadi hui thi ya buffalo fight thi? Aisi shakal hai teri jaise 3rd hand condom ka side effect ho.`,
   `Tere baap ki moochh pakad ke kheenchu itna ki usse kite udaun, aur tujhe tere nange bhitar ghusa ke global warming ka reason bana du.`,
   `Abe kutte, tujhme toh dimaag itna kam hai ki mobile mein airplane mode on karke sochta hai flight chal rahi hai, chutiya kahin ka!`,
   `Tere jaise chhapriyo ke liye toh WhatsApp ne "Block" ka option banaya था, warna sabki gaand phat jaati daily teri bakchodi sun ke.`,
   `Jab tu paida hua tha tab doctor ne bola tha – abey isko zinda chod diya toh galti ho jaegi, lekin teri maa boli – mujhe aur bhi chutiya chahiye!`,
   `Abe laude, tujhme toh jitni akal bhi nahi ki bhains ke aage been bajaye bina bhi nachna shuru kar de, tera brain toh Gaadi ke silencer me chala gaya.`,
   `Tu gaaliyon ke layak bhi nahi, tu toh us toilet paper jaisa hai jo har kisi ne liya bhi aur faad bhi diya – fir bhi zinda hai.`,
   `Jab tu bolta hai na, toh lagta hai kisi ne gaand mein flute daal di ho, itna irritating awaz hai – mute karne ka man karta hai tujhe dekhte hi.`,
   `Abe behanchod, tujhe dekhta hoon toh lagta hai jaise kisi ne chawal se laptop banane ki koshish ki ho – bekaar, slow, aur useless.`
];


// run function: Initiates the conversation (asks for name)
// Modifying the original fyt run function structure
module.exports.run = async function({ api, args, Users, event, permission }) { // Includes permission, Users
    const { threadID, senderID, messageID } = event;

    // Permission check (using hasPermssion typo from config)
    if (permission !== 2) { // permission variable should work with hasPermssion typo in config
        return api.sendMessage("Sirf admin hi is command ko chala sakta hai.", threadID, messageID);
    }

    // Remove original mention check and setTimeout blocks from here

    // Bot's initial message: Ask for the target's name (plain text)
    // info object contains details of the message sent by the bot, needed for listener
    const promptMessage = await api.sendMessage("Kisko thokna hai? Uska naam reply mein likho:", threadID, (error, info) => {
        if (error) {
            console.error("Error sending reply prompt:", error);
            return api.sendMessage("War shuru karne mein problem hui.", threadID, messageID);
        }

        // --- Listener Setup ---
        // Set up a listener for the next message from the same user in the same thread
        // which is a reply to the bot's prompt message
        const listener = api.listenMessege(async (replyEvent) => {
            const { threadID: replyThreadID, senderID: replySenderID, body: replyBody, messageID: replyMessageID, messageReply } = replyEvent;

            // Check if it's a valid reply to our prompt from the correct user/thread
            if (replyThreadID === threadID && replySenderID === senderID && messageReply?.messageID === info.messageID) {

                // --- Process the Reply ---
                const targetName = replyBody?.trim(); // Get the plain text name from the reply body

                if (!targetName || targetName.length === 0) {
                    // If reply was empty or just whitespace
                    api.sendMessage("Kripya reply mein uska naam likhein jisko thokna hai.", threadID);
                    // Stop listening on invalid reply
                    api.unlistenMessege(listener);
                    return; // Stop processing
                }

                // --- If a valid name is provided, start the Gali Burst ---

                api.sendMessage(`Ok, ${targetName} ki thukai shuru! 🔥`, threadID); // Confirmation message

                // Function to send a random gali using the provided name (plain text)
                const sendRandomGali = (delay) => {
                    setTimeout(() => {
                        const gali = galiyan[Math.floor(Math.random() * galiyan.length)];
                         api.sendMessage({
                            body: `${targetName}, ${gali}`, // *** Gali + Plain Text Name (No mention tag) ***
                            // *** No mentions array included here ***
                         }, threadID); // Send as a new message
                    }, delay);
                };

                // Send multiple galis with delays (Adjust delays/number)
                // Using a fixed delay for a more consistent burst
                const numberOfBursts = 7; // Send 7 galis
                const delayBetweenBursts = 3500; // 3.5 seconds delay between each gali

                for (let i = 0; i < numberOfBursts; i++) {
                    sendRandomGali(i * delayBetweenBursts);
                }

                // --- Listener Clean up ---
                api.unlistenMessege(listener); // Stop listening after the burst is initiated

            }
            // Ignore replies that are not to our specific prompt or from the same user
        }); // Listener setup ends here

        // The listener is now active, waiting for the reply.
        // The run function finishes after setting up the listener.

    }, messageID); // Link the bot's prompt to the original command message


    // The original setTimeout blocks from fyt are removed from here.
    // Example of original fyt block:
    // setTimeout(() => {a({body: "73R! 83H4N K4 9HUD4 M4RO9 ! G4NDU K4 BACHA 😝😝😝❤️😂😂TERI AMA KI KALI GAND MAROU 😂😂 CONDOMS LGA KY 😂😂😂❤️"});}, 3000);
};

// handleEvent: Empty (assuming original fyt didn't have one or it was empty)
module.exports.handleEvent = async function({ api, event }) {
    // This module does not react to messages over time.
};
