import { Client, Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest"
import { readdirSync } from "fs";
import { join } from "path";
import { SlashCommand } from "../@types/client";
import logger from "../utils/logger"


module.exports = (client : Client) => {
    const global_slash_commands : SlashCommandBuilder[] = []

    let global_commands_dir = join(__dirname,"../commands/global")

    readdirSync(global_commands_dir).forEach(file => {
        if (!file.endsWith(".js") && !file.endsWith(".ts")) return;
        let command : SlashCommand = require(`${global_commands_dir}/${file}`).default
        global_slash_commands.push(command.data)
        client.commands.set(command.data.name, command)

        logger.info(`Successfully loaded command ${command.data.name}`)
    })

    const rest = new REST({version: "10"}).setToken(process.env.TOKEN);

    rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: global_slash_commands.map(command => command.toJSON())
    })
    .then((data : any) => {
        logger.info(`Successfully registed ${data.length} global_command(s)`)
    }).catch(e => {
        logger.error(e);
    })
}