const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'roleinfo',
  alias: ['role-info','ri'],
  run: async (client, message, command, args, lang, guildInfo) => {

    if (!args[0]) return message.reply(lang.unkown_role);

    await message.guild.members.fetch();
    await message.guild.roles.fetch();

    let requestedRole = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(args.join(' ').toLowerCase()));
    requestedRole ??= message.guild.roles.cache.find(role => role.id == args[0]);
    requestedRole ??= message.guild.roles.cache.find(role => role.id == args[0].substring(3,args[0].length-1));

    if (!requestedRole) return message.reply(lang.unkown_role);

    let created = Math.trunc(requestedRole.createdTimestamp / 1000);
    let embed = new MessageEmbed()
      .setDescription(`__**${lang.role_info}**__`)
      .setColor(requestedRole.hexColor)
      .addField(lang.name, `${requestedRole}`)
      .addField(lang.role_id, `${requestedRole.id}`)
      .addField(lang.color, requestedRole.hexColor)
      .addField(lang.member_count, requestedRole.members.size.toString())
      .addField(lang.date_created, `<t:${created}:F> (<t:${created}:R>)`);

    if (message.author) message.channel.send({embeds:[embed]});
    else message.editReply({embeds:[embed]});

  }
}
