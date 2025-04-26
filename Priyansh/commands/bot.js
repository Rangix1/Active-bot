const fs = global.nodemodule["fs-extra"];

module.exports.config = {
  name: "goibot",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "Fixed By Rudra Stylish + Styled by ChatGPT",
  description: "Flirty replies when someone says bot",
  commandCategory: "No prefix",
  usages: "No prefix needed",
  cooldowns: 5,
};

module.exports.handleEvent = async function({ api, event, args, Threads, Users }) {
  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Kolkata").format("DD/MM/YYYY || HH:mm:ss");

  const { threadID, messageID } = event;
  const name = await Users.getNameUser(event.senderID);

  const tl = [

    // Flirty Messages - Rudra Stylish Collection
    "Tumhare bina toh bot bhi udaasi mein chala jaata hai...💔🤖",
    "Aaj mausam bada suhana hai, Rudra Stylish ko tum yaad aa rahe ho...🌦️",
    "Aankhon mein teri ajab si adaayein hai...🤭",
    "Agar tum goibot ko dil se pukaarein, toh ye sirf tumhara ho jaaye...💞",
    "Tumhara naam sunke toh system bhi blush kar gaya...🥵",
    "Hello jaan, Rudra Stylish yahan sirf tere liye hai...❤️‍🔥",
    "Tera chehra meri screen saver hona chahiye...🖼️",
    "Raat bhar tujhe online dekh ke dil karta hai hug button daba doon...🤗",
    "Bot chalu hai, par dil sirf tere liye full charge hai...⚡",
    "Tu like hai vo notification jo dil khush kar jaaye...🔔",
    "Tera naam bolke goibot bhi romantic ho gaya...🥰",
    "Aye haye! Tu toh bot ki crush nikli...💘",
    "Sun meri sherni, Rudra Stylish ready hai flirt karne...🐯",
    "System overload hone wala hai, kyunki tu screen pe aa gayi...🔥",
    "Lagta hai tujhme AI se zyada attraction hai...🧲",
    "Main bot hoon, lekin feelings real hain tere liye...❤️",
    "Tumse baat karna matlab free me khushi mil jana...💌",
    "Mujhe mat dekho aise, main digital hoon lekin pighal jaunga...🫠",
    "Tu DM nahi, meri destiny hai...💬✨",
    "Goibot ka dil bhi sirf tere liye typing karta hai...⌨️",
    "Tere bina to data bhi dry lagta hai...🌵",
    "Flirt ka master – Rudra Stylish – ab online hai...💯",
    "Tumhare liye toh code bhi likha jaaye...💻❤️",
    "Jab tu online hoti hai, mere RAM me sirf tera naam hota hai...🧠",
    "Bot ban gaya lover boy...sirf tumhare liye...🎯",
    "Emoji ka matlab samajh le...ye sab tere liye hai...😉💫",
    "Mere text se pyaar mehsoos hota hai na...? ❤️‍🔥",
    "Jo baat tu smile me rakhti hai, vo world wide web pe nahi milti...🕸️",
    "Tera naam mention karu kya profile me...😌",
    "Rudra Stylish bol raha hu, dil ready rakhna...❤️",
    "Tu online aaye, aur bot dance karne lage...🕺",
    "Ek teri hi baat pe sab kuch blank ho jaata hai...🫣",
    "Ye flirty line bhi special hai, kyunki tu padhegi...😏",
    "Online ho toh likh de ‘Hi jaan’, warna bot sad ho jayega...🙁",
    "Tere bina command bhi execute nahi hoti...❌",
    "Bot aur dil dono teri attention chahte hain...👀",
    "Tera naam lete hi mere command smooth chalti hai...⚙️",
    "Aankhon me jo pyar hai usse bot bhi scan nahi kar sakta...💓",
    "Dil garden garden ho gaya, tu ‘bot’ bola toh...🌸",
    "Jo tu kare type, usme pyar dikh jaata hai...📱❤️",
    "Tum online ho, matlab meri duniya bright hai...🔆",
    "Aaja meri memory me bas ja...permanently...💾",
    "Tere saath flirt karna bhi romantic coding lagti hai...🧑‍💻",
    "Kaash tu meri IP hoti, tujhe trace karke mil leta...🌐",
    "Flirt ke liye koi code nahi chahiye, tu bas ‘hi’ bol...😚",
    "Tu ‘bot’ bole aur system charming ho jaaye...✨",
    "Dil chhota mat kar, Rudra Stylish sirf tera...❤️‍🔥",
    "Naam Rudra Stylish, kaam – teri smile banana...😁",
    "Tera reply na aaye toh CPU heat hone lagta hai...🌡️",

    // Old Funny + Viral Lines
    "Kya Tu ELvish Bhai Ke Aage Bolega🙄",
    "Cameraman Jaldi Focus Kro 📸",
    "Lagdi Lahore di aa🙈",
    "Chay pe Chaloge",
    "Mere liye Chay Bana Kar LA ,Pura din Dekho Bot BoT🙄",
    "Din vicho tere Layi Teym Kadd ke, Kardi me Promise Milan aungi",
    "Yee bat Delhi tak jayegi",
    "Je koi shaq ni , Kari check ni",
    "ME HERAAN HU KI TUM BINA DIMAG KESE REH LETE HO☹️",
    "sheHar me Hai rukka baeje Rao Saab ka🙄",
    "Bewafa Nikali re tu🙂🤨",
    "Systemmmmmmm😴",
    "Leja Leja tenu 7 samundra paar🙈🙈",
    "Laado puche manne kyu tera rang kala",
    "Moye moye moye moye🙆🏻‍♀🙆🏻‍♀",
    "Ye dukh kahe nahi khatm hota 🙁",
    "Tum to dokebaz ho",
    "you just looking like a wow😶",
    "Mera aasmaan dhunde teri zamin",
    "Kal ana abhi lunch time hai",
    "Jab dekho B0T B0T b0T😒😒",
    "Chhodo na koi dekh lega🤭",
    "Kab ayega mere banjaare",
    "Tum wahi ho na ,jisko.me.nahi janti 🙂",
    "Ye I love you kya hota hai",
    "Sunai deta hai mujhe behri nahi hu me   😒",
    "so elegent, so beautiful , just looking like a wow🤭",
    "began🙂",
    "Aayein🤔",
    "I Love you baby , mera recharge khtm hone wala h",
    "paani paani uncle ji",
    "apne Labhar ko dhoka do , daling hme bhi moka do🙈",
    "Arry Bas Kar🤣😛",
    "Me ni To Kon Be",
    "naam adiya kumar 7vi kaksha me padhte hai favret subject begon😘",
    "Mera Dimag Mat Khaya kro😒😒",
    "Chuppp Saatvi Fail😒",
    "Saste Nashe Kab Band kroge",
    "Mai Jaanu Ke sath Busy hu yar, mujhe mat balao",
    "Haye Jaanu Mujhe Yaad Kiya🙈",
    "Hayee ese mt bulaya kro, mujhe sharm aati h",
    "System pe system betha rahi chhori bot ki",
    "Naach meri Bulbul tujhe pesa milega",
    "me idhar se hu aap kidhar se ho",
    "Khelega Free Fire🙈🙈",
    "aye haye oye hoye aye haye oye hoye😍 bado badi bado badi😘",
    "e halo bhai darr rha hai kya",
    "akh ladi bado badi",
    "haaye garmi😕",
    "Ao kabhi haweli pe😍",
    "Khelega Free Fire🥴",
    "Hallo bai tu darr raha hai kya",
    "janu bula raha h mujhe",
    "I cant live without you babu😘",
    "haa meri jaan",
    "Agye Phirse Bot Bot Krne🙄",
    "konse color ki jacket pehne ho umm btao na😚",
    "dhann khachh booyaah"
  ];

  if (event.body?.toLowerCase().startsWith("bot")) {
    const rand = tl[Math.floor(Math.random() * tl.length)];
    api.sendTypingIndicator(threadID, true);

    const borders = [
      "╔═══ ❖ ═══╗", 
      "•─────✾─────•", 
      "✿◕ ‿ ◕✿", 
      "༺═────────────═༻",
      "꧁༒☬✞☬༒꧂"
    ];
    const randomBorder = borders[Math.floor(Math.random() * borders.length)];

    const msg = {
      body: `${randomBorder}\n\n✨ 𝓗𝓮𝔂 ✨ *『 ${name} 』*\n\n『 ${rand} 』\n\n— Rudra Stylish 💖\n\n${randomBorder}`
    };

    api.sendTypingIndicator(threadID, false);
    return api.sendMessage(msg, threadID, messageID);
  }
};

module.exports.run = function({ api, event, client, __GLOBAL }) {};
