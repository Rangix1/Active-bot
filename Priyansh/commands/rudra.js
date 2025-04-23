Module.exports.config = {
    name: "rudra", // *** Command ka naam badal kar "rudra" rakha hai ***
    version: "3.0.2", // Version update kiya
    hasPermssion: 2, // *** Tumhare fyt aur original code wala typo "hasPermssion" use kiya hai ***
    credits: "Rudra + Lazer DJ Meham + Google Gemini",
    description: "Send bursts of galis to a mentioned user.", // Description wahi rakhi hai
    commandCategory: "group", // Category Group rakhi hai
    usages: "rudra @user", // *** Usage bhi update kiya hai naye naam ke saath ***
    cooldowns: 7, // fyt jitna cooldown rakha hai
    dependencies: {
        // "fs-extra": "", // Is code mein use nahi ho rahe
        // "axios": ""     // Is code mein use nahi ho rahe
    }
};

// Galiyan list (jaisi tumne di thi)
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

// Koi state variables nahi hain tracking ke liye

// run function: Command handle karega aur gali burst karega
// fyt structure wala signature use kiya hai (Users argument ke saath)
module.exports.run = async function({ api, args, Users, event, permission }) { // permission include kiya
    const { threadID, messageID, mentions } = event;

    // Permission check (using hasPermssion typo)
    if (permission !== 2) { // permission variable should work with hasPermssion typo in config
        return api.sendMessage("Sirf admin hi is command ko chala sakta hai.", threadID, messageID);
    }

    // Check karein ki mention kiya hai ya nahi
    const mentionID = Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : null;

    if (!mentionID) {
        // Agar mention nahi kiya toh usage batao
        return api.sendMessage(`Kisko gali deni hai? Mention toh karo! Usage: ${global.config.PREFIX}rudra @user`, threadID, messageID); // *** Usage message update kiya naye naam ke saath ***
    }

    // Mention kiye hue user ka naam lein (event.mentions se)
    const mentionName = mentions[mentionID].replace("@", "") || "bhosdike"; // Fallback naam

    // Confirmation message command dene wale ko
    api.sendMessage(`Ok, ${mentionName} ki class lagate hain! 🔥`, threadID, messageID);

    // Function jo random gali select karke mentioned user ko bhejega delay ke baad
    const sendRandomGali = (delay) => {
        setTimeout(() => {
            const gali = galiyan[Math.floor(Math.random() * galiyan.length)];
             api.sendMessage({
                body: `${mentionName}, ${gali}`, // Gali + Mention Name
                mentions: [{ id: mentionID, tag: mentionName }]
            }, threadID); // Naya message bhej rahe hain
        }, delay);
    };

    // Kitni galiyan bhejni hain aur kitne delay par (Yeh adjust kar sakte ho)
    const numberOfBursts = 7; // 7 galis bhejte hain
    const delayBetweenBursts = 3500; // Har gali ke beech 3.5 seconds ka delay

    for (let i = 0; i < numberOfBursts; i++) {
        sendRandomGali(i * delayBetweenBursts);
    }
};

// handleEvent: Empty, kyunki sara logic run function mein hai
module.exports.handleEvent = async function({ api, event }) {
    // Yeh module user ke messages par react nahi karta over time.
};
