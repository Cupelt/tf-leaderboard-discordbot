const { Client, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, readyClient => {
    const guilds = client.guilds.cache;
    guilds.forEach(guild => guild.leave());

    client.destroy();
});