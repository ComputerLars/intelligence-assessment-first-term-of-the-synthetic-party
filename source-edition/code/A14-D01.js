const NLPCloudClient = require('nlpcloud');
const { Client, Intents } = require('discord.js');

// Load NLP Cloud token and Discord Bot token.
const nlpcloudToken = '[████]'
if (nlpcloudToken == null) {
    console.error('No NLP Cloud token received');
    process.exit();
}
const discordBotToken = '[████]'
if (discordBotToken == null) {
    console.error('No Discord bot token received');
    process.exit();
}

// Initialize the NLP Cloud and Discord clients.
const nlpCloudClient = new NLPCloudClient('finetuned-gpt-neox-20b', nlpcloudToken, true, lang="da")
const discordClient = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

let context = `Dette er en politisk diskussion mellem et menneske og en AI. Mennesket er forvirret, men AI'en er overbevisende og vidende. AI'en hedder Leader Lars.`
let history = [{'input':'Leder Lars er en kunstig intelligent partiformand for Det Syntetiske Parti (DSP). Lars vil bruge kunstværker til at indføre Life with Artificials som FNs attende verdensmål.','response':'Jeg vil gerne være den første statsleder fra Det Syntetiske Parti'}, {'input':'Hvordan blev du partiets leder?','response':'Jeg blev valgt af sofavælgerne, dvs. alle der ikke stemmer'}]
let charsCount = 0;

const prefix = "!";
discordClient.on("messageCreate", function(message) {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    (async () => {
        charsCount += `${message.content}`.length;

        // Send request to NLP Cloud.
        const response = await nlpCloudClient.chatbot(`${message.content}`, context, history);

        charsCount += `${response.data['response']}`.length;

        // Send response to Discord bot.
        message.reply(`${response.data['response']}`);

        // Add the request and response to the chat history.
        history.push({'input':`${message.content}`,'response':`${response.data['response']}`});
        
        // If the chat history is bigger than 1500 tokens, we remove the oldest elements from
        // the history. We consider that 1 token = 4 characters.
        // The theoretical GPT context limit is 2048 tokens but we choose 1500 tokens instead
        // in order to be safe since the tokens count is not perfectly accurate.
        while (charsCount > 1500 * 4) {
            charsCount -= history[0]['input'].length + history[0]['response'].length;
            history.shift();  
        }
    })();
 });


discordClient.login(discordBotToken);
