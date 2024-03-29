const { Events, ActivityType } = require('discord.js');
const { register } = require('../command_register');
const logger = require("../logger");

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
        register();
		logger.info(`Ready! Logged in as ${client.user.tag}`);

		client.user.setPresence({
			activities: [{
				name: 'Hacking TheFinals Protocol',
				type : ActivityType.Competing
			}],
			status: 'online'
		})
	},
};