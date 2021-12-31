const { MessageEmbed } = require('discord.js');

module.exports = async (client, user, level, channelID, color, lang) => {
	let channel = client.channels.cache.find(c => c.id == channelID);
	if (channel) {
		if (!channel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return;
		let embed = new MessageEmbed()
			.setTitle(`${user.username}`)
			.setDescription(lang.levelup.replaceAll('{level}',level))
			.setColor(color)
			.setThumbnail(user.displayAvatarURL());
		channel.send({content: `${user}`, embeds:[embed]});
	}
}
