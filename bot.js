var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var botConfig = require("./package.json");
var fs = require('fs');
var data = require('./data.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
    console.log("------------------------------")

    // Our bot needs to know if it will execute a command
    // so it will listen for messages that start with '!'
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0].toLowerCase();

        args = args.splice(1);
        switch (cmd) {
            // !ping
            case 'ping':
                console.log("I got pinged by: " + user);
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
                break;
            case 'countingme?':
                console.log("Let's see if I'm tracking " + user 
                + " for any words.");
                var words = getUsersWords(user);
                var mes = "";
                if (words != null && Object.keys(words).length > 0) {
                    mes += "Yes, supposedly you say some words a lot. Like:\n";
                    for (word in words) {
                        mes += " - " + word + " (" + words[word] + " times)\n";
                    }
                } else {
                    mes = "No. I can if u want tho UWU";
                }
                bot.sendMessage({
                    to: channelID,
                    message: mes
                })
                break;
            case botConfig.name:
                console.log(user + " aka. " + toRealName(user) 
                + " called in a request!");
                console.log("target: " + args[0]);
                console.log("word: " + args[2]);
                var mes = "";
                if (Object.values(data.people).includes(args[0])) {
                    if (!Object.keys(getUsersWords(user)).includes(args[2])) {
                        getUsersWords(user)[args[2]] = 0;
                    }
                    mes += getUsersWords(user)[args[2]] + " times as of now!"
                } else {
                    mes += "Maybe they do. IDK who TF that is."
                }
                bot.sendMessage({
                    to: channelID,
                    message: mes
                });
                break;
            case 'dontcountme':
                console.log(user + " told me to never count them");
                var mes = "";
                if (Object.keys(data.people).includes(user)) {
                    data.users[toRealName(user)] = {};
                    mes = "Ok " + toRealName(user) 
                    + " I will clear your record."
                } else {
                    mes = "I won't because I wasn't. I don't even know you."
                }
                saveData();
                bot.sendMessage({
                    to: channelID,
                    message: mes
                })
                break;
            case 'dontcountmeever':
                console.log("user: " + user);
                delete data.people[user];
                saveData();
                bot.sendMessage({
                    to: channelID,
                    message: "Ok. I've forgotten you even exist."
                })
                break;
            case 'names':
                console.log("Listed the names I know.");
                var mes = "So far I know that:\n";
                for (person in data.people) {
                    mes += " - " + person + "'s name is " + data.people[person] 
                    + "\n";
                }
                bot.sendMessage({
                    to: channelID,
                    message: mes
                });
                break;
            case 'help':
                console.log("Was asked for help. Tried my best *~~*");
                bot.sendMessage({
                    to: channelID,
                    message: "My commands are:\
                    \n - __'!help'__ - Congrats! You're already here.\
                    \n- __'!ping'__ - see if I'm working\
                    \n - __'!countingMe?'__ - See If I'm keeping track of how\
 many times you use a certain word\
                    \n - __'!sprocket (person's actual first name) says (word) \
a lot'__ - I'll keep track of the given person's use of that\
word *and let them know when they use it =P~~ ;)*\
                    \n - __'!dontCountMe'__ - I'll forget all the words you're\
being tracked for *pinky promise*\
                    \n - __'!dontCountMeEver'__ I will forget your name *the \
one steven hard-coded in* and never allow anyone to track your word usage \
again!\
                    \n - __'!names'__ - I'll give you a list of the names \
I know."
                });
            // Add other commands here...
        }
    }
    
    if (Object.keys(data.users).includes(toRealName(user))) {
        for (word in getUsersWords(user)) {
            times = message.match(word);
            if (times !== null) {
                console.log("word " + word)
                console.log("checking for: " + word + "\nfound: " + times.length);
                data.users[toRealName(user)][word] += times.length;
                bot.sendMessage({
                    to: channelID,
                    message: "Another " + word + "! That makes for " 
                    + data.users[toRealName(user)][word] + "!"
                })
            }
        }
        saveData()
    }
    console.log("------------------------------")
});

function saveData() {
    fs.writeFile('./data.json', JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
    });
}

function toRealName(alias) {
    return data.people[alias];
}

function getUsersWords(alias) {
    return data.users[toRealName(alias)];
}

console.log("We're in business!")