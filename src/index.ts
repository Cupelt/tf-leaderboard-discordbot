import { Client, Collection, GatewayIntentBits, Events, SlashCommandBuilder } from "discord.js";
import logger from "./utils/logger";
import { config } from "dotenv";
import { SlashCommand } from "./@types/client";
import { readdirSync } from "fs";
import { join } from "path";
config()

const client: Client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ] 
});

client.commands = new Collection<string, SlashCommand>;

const handlersDir = join(__dirname, "./handlers")
readdirSync(handlersDir).forEach(handler => {
    if (!handler.endsWith(".js") && !handler.endsWith(".ts")) return;
    require(`${handlersDir}/${handler}`)(client)
})

client.login(process.env.TOKEN)