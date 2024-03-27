const { Client, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
require('dotenv').config()

client.once(Events.ClientReady, readyClient => {
    const guilds = client.guilds.cache;
    guilds.forEach(guild => guild.leave());

    console.log("exit succesfuly done.");

    client.destroy();
});

client.login(process.env.TOKEN);

