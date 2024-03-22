const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const logger = require("./logger")
require('dotenv').config();

module.exports = {
    register() {
        const commands = [];
        const foldersPath = path.join(__dirname, 'commands');
        const commandFolders = fs.readdirSync(foldersPath);

        for (const folder of commandFolders) {
            if (folder.indexOf('test') === 0) continue;

            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
            
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath)
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                } else {
                    logger.info(`[WARNING] The command at ${filePath} is missing a require "data" or "execute" property`);
                }
            }
        }

        const rest = new REST().setToken(process.env.TOKEN);

        (async () => {
            try {
                logger.info(`Started refreshing ${commands.length} application (/) commands.`);

                const data = await rest.put(
                    Routes.applicationCommands(process.env.CLIENT_ID),
                    { body: commands }
                );

                logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) {
                logger.error(error);
            }
        })();
    }
}