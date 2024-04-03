import { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { BotEvent } from "../@types/client";
import logger from "../utils/logger";

module.exports = (client: Client) => {
    let eventsDir = join(__dirname, "../events")

    let event_count = 0;
    readdirSync(eventsDir).forEach(file => {
        if (!file.endsWith(".js") && !file.endsWith(".ts")) return;
        let event: BotEvent = require(`${eventsDir}/${file}`).default
        event.once ?
            client.once(event.name, (...args) => event.execute(...args))
            :
            client.on(event.name, (...args) => event.execute(...args))
        logger.info(`Successfully loaded event ${event.name}`)

        event_count++;
    })

    logger.info(`Successfully loaded ${event_count} event(s)`)
}