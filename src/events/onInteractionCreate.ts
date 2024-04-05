import { Events, Interaction } from "discord.js";
import { BotEvent } from "../@types/client";
import logger from "../utils/logger";
import { forEachLeadingCommentRange } from "typescript";

const event: BotEvent = {
    name: Events.InteractionCreate,
    execute: async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            logger.error(`No command matching ${interaction.commandName} was found`);
            return;
        }

        if (interaction.isAutocomplete()) {
            try {
                await command.autocomplete?.(interaction);
            } catch (error: any) {
                logger.error(error.stack);
            } finally {
                return;
            }
        }

        try {
            await command.execute(interaction);
        } catch(error: any) {
            logger.error(error.stack);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}

export default event;