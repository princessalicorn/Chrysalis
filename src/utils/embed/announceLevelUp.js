const { MessageEmbed } = require('discord.js');

module.exports = async (client, user, level, channelID, color, lang) => {
	if (channelID == '') return;
	let channel = client.channels.cache.find(channel => channel.id == channelID);
	if (channel != null) {
		if (!channel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return;
		let embed = new MessageEmbed()
			.setTitle(`${user.username}`)
			.setDescription(lang.levelup.replaceAll('{level}',level))
			.setColor(color)
			.setThumbnail(user.displayAvatarURL());
		channel.send({content: `${user}`, embeds:[embed]});
	}
}
