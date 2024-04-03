import { ActivityType, Client, Events } from "discord.js";
import { BotEvent } from "../@types/client";
import logger from "../utils/logger";

const event : BotEvent = {
    name: Events.ClientReady,
    once: true,
    execute: (client : Client) => {
        logger.info(`Logged in as ${client.user?.tag}`);

        client.user?.setPresence({
			activities: [{
				name: 'Hacking TheFinals Protocol',
				type : ActivityType.Competing
			}],
			status: 'online'
		})
    }
}

export default event;