const { Events } = require('discord.js');
const { register } = require('../command_register')

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
        register();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};