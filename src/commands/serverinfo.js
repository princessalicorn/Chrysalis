const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  alias: ['server-info','server','si'],
  run: async (client, message, command, args, lang, guildInfo) => {
    let created = Math.trunc(message.guild.createdTimestamp / 1000);
    let icon = message.guild.iconURL({size:1024});
    let embed = new MessageEmbed()
      .setColor(guildInfo.color)
      .setAuthor({name: message.guild.name, iconURL: icon})
      .setThumbnail(icon)
      .setDescription(`__**${lang.server_info}**__`)
      .addField(lang.server_owner,`${await message.guild.fetchOwner()}`,true)
      .addField(lang.server_id,message.guild.id,true)
      .addField(lang.member_count, message.guild.memberCount.toString(),true)
      .addField(lang.roles, (message.guild.roles.cache.size-1).toString(),true)
      .addField(lang.channels, message.guild.channels.cache.size.toString(),true)
      .addField(lang.server_boosts, message.guild.premiumSubscriptionCount.toString(),true)
      .addField(lang.date_created, `<t:${created}:F> (<t:${created}:R>)`);
    if (message.author) message.channel.send({embeds:[embed]});
    else message.editReply({embeds:[embed]});
  }
}
