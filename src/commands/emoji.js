const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'emoji',
  alias: ['jumbo'],
  run: async (client, message, command, args, lang, guildInfo) => {

    for (guild of client.guilds.cache) await guild[1].emojis.fetch();
    let emoji = (args[0]?.split(':')[2]) ? client.emojis.resolve(args[0].split(':')[2].replace('>','')) : client.emojis.cache.find((e) => e.name === args[0]?.split(':')[1]);
    if (!emoji) return message.author ? message.reply(lang.couldn_t_find_that_emoji) : message.editReply({content:lang.couldn_t_find_that_emoji});

    let embed = new MessageEmbed()
    .setTitle(lang.download_emoji)
    .setURL(emoji.url)
    .setImage(emoji.url)
    .setColor(guildInfo.color);
    if (message.author) message.channel.send({embeds:[embed]});
    else message.editReply({embeds:[embed]});

  }
}
