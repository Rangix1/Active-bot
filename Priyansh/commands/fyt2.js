Module.exports.config = {
    name: "fyt2", // *** Naya naam rakha hai "fyt2" ***
    version: "1.0.0",
    hasPermssion: 2, // *** Tumhare codes wala typo "hasPermssion" use kiya hai ***
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 + Google Gemini", // Credits add/update kiye
    description: "Initiate a war and target a user by replying with their mention.", // Description update ki
    commandCategory: "wargroup", // fyt jaisi category rakhi hai
    usages: "fyt2", // Command mein mention nahi chahiye shuru mein
    cooldowns: 7, // fyt jitna cooldown rakha hai
    dependencies: {
        // "fs-extra": "", // Is code mein use nahi ho rahe
        // "axios": ""     // Is code mein use nahi ho rahe
    }
};

// Galiyan list (full list)
const galiyan = [
   `Teri maa ki chut mein ganna ghusa ke juice nikal dun, kutte ke pille tere jaise pe to thook bhi na phekhu main, aukat dekh ke muh khol haramkhor!`,
   `Bhosdike, tere jaise chhoti soch wale chhapriyo ka toh main churan banake nasha kar jaun, maa chod pagal aadmi!`,
   `Tere baap ka naak kaat diya kal, aur teri maa toh bolti thi beta engineer banega, chutiya nikla!`,
   `Teri gaand mein rocket daalke chand tak bhejdu, vahan jakar aliens ko bhi chutiya bana ke aaega tu.`,
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

// run function: Conversation initiate karega
// fyt structure wala signature use kiya hai (Users argument ke saath)
module.exports.run = async function({ api, args, Users, event, permission }) { // permission include kiya
    const { threadID, senderID, messageID } = event;

    // Permission check (using hasPermssion typo)
    if (permission !== 2) {
        return api.sendMessage("Sirf admin hi is command ko chala sakta hai.", threadID, messageID);
    }

    // Bot ka pehla message: Naam poochhega aur reply ka wait karega
    const promptMessage = await api.sendMessage("Kisko war shuru karna hai? Uska naam mention karo aur is message par reply karo:", threadID, (error, info) => {
        if (error) {
            console.error("Error sending reply prompt:", error);
            return api.sendMessage("War shuru karne mein problem hui.", threadID, messageID);
        }

        // --- Listener Setup ---
        // Yahan bot reply ka wait karega. Listener setup framework par depend karta hai.
        // Ek common tareeka listener ko messageID se jodna hota hai.
        // Yeh ek conceptual listener setup hai:

        // api.listenMessege is a hypothetical function provided by the framework
        // which might pass the reply event to the provided callback function.
        const listener = api.listenMessege(async (replyEvent) => {
            const { threadID: replyThreadID, senderID: replySenderID, body: replyBody, messageID: replyMessageID, mentions: replyMentions, type: replyType, messageReply } = replyEvent;

            // Check karein ki yeh reply sahi thread se, sahi user se, aur hamare prompt message ka reply hai ya nahi
            // messageReply object mein original message ki details hoti hain jiska reply kiya gaya hai
            if (replyThreadID === threadID && replySenderID === senderID && messageReply?.messageID === info.messageID) {

                // --- Reply Process Karna ---
                let targetMentionID = null;
                let targetName = null;

                // Dekhein kya reply mein mention hai
                if (replyMentions && Object.keys(replyMentions).length > 0) {
                    targetMentionID = Object.keys(replyMentions)[0]; // Pehle mention kiye hue user ki ID lein
                    // Mention ka naam lein, "@" hata kar
                    targetName = replyMentions[targetMentionID].replace("@", "") || "target"; // Fallback
                } else {
                    // Agar reply mein mention nahi hai, to invalid reply
                    api.sendMessage("Reply mein kripya us user ko mention karein jisko war shuru karna hai.", threadID);
                    // Listener ko hata dein
                    api.unlistenMessege(listener); // Stop listening
                    return; // Processing band karein
                }

                // --- Agar valid target mil gaya, to Gali Burst shuru karein ---

                api.sendMessage(`Ok, ${targetName} ke liye war shuru kar raha hoon! 🔥`, threadID); // Confirmation message

                // Function jo random gali select karke mentioned user ko bhejega delay ke baad
                const sendRandomGali = (delay) => {
                    setTimeout(() => {
                        const gali = galiyan[Math.floor(Math.random() * galiyan.length)];
                         api.sendMessage({
                            body: `${targetName}, ${gali}`, // Gali + Target Name
                            mentions: [{ id: targetMentionID, tag: targetName }] // Mentioning user
                        }, threadID); // Naya message bhej rahe hain
                    }, delay);
                };

                // Kitni galiyan bhejni hain aur kitne delay par (Adjust kar sakte ho)
                const numberOfBursts = 7; // 7 galis
                const delayBetweenBursts = 3500; // 3.5 seconds delay

                for (let i = 0; i < numberOfBursts; i++) {
                    sendRandomGali(i * delayBetweenBursts);
                }

                // --- Listener Clean up ---
                api.unlistenMessege(listener); // Gali burst shuru hone ke baad listener hata dein

            } else {
                 // Agar reply sahi prompt ka nahi hai ya sahi user ka nahi hai, ignore karein
                 // Listener active rahega jab tak sahi reply na mile ya timeout na ho (agar framework mein timeout hai)
            }
        }); // Listener setup band hua

        // Listener ab active hai, run function apna kaam khatam kar chuka hai.

    }, messageID); // Bot ke message ko original command se link karein (agar zaroorat ho framework ke liye)
};

// handleEvent: Khali ya use nahi hoga is flow mein
module.exports.handleEvent = async function({ api, event }) {
    // Yeh module users ke normal messages par react nahi karta.
};
