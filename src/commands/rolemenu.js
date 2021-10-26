const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
  name: "rolemenu",
  alias: ["role-menu"],
  admin: true,
  run: async (client, message, command, args, prefix, color, lang) => {

    if (!message.guild.me.permissions.has('MANAGE_ROLES')) return message.reply(lang.manage_roles_permission_required);

    const helpEmbed = new MessageEmbed()
      .setTitle(lang.usage)
      .setDescription(`${prefix}rolemenu roleID roleID roleID...`)
      .setColor(color)

    const roles = [];

    for (role of args.keys()) {
      try {
        roles.push(message.guild.roles.cache.get(args[role]).id);
      } catch (e) {
        // Skip invalid role
      }
    }

    if (roles.length == 0) return message.channel.send({embeds:[helpEmbed]});
    if (roles.length > 25) return message.reply(lang.you_can_only_add_up_to_25_roles_to_the_menu);

    const embed = new MessageEmbed()
      .setTitle(lang.role_menu)
      .setDescription(lang.select_the_roles_that_you_want)
      .setColor(color)

    var rows = []
    rows[0] = roles.slice(0,5)
    rows[1] = roles.slice(5,10)
    rows[2] = roles.slice(10,15)
    rows[3] = roles.slice(15,20)
    rows[4] = roles.slice(20,25)

    var buttonRow = [];

    for (const [index, row] of rows.entries()) {
      if (row.length == 0) break;
      buttonRow[index] = new MessageActionRow()
      for (role of row) {
        await message.guild.roles.fetch();
        if (!message.guild.roles.cache.get(role)) break;
        const button = new MessageButton()
          .setStyle('PRIMARY')
          .setLabel(message.guild.roles.cache.get(role).name)
          .setCustomId(`role-${role}`);
        buttonRow[index].addComponents(button);
      }
    }

    message.channel.send({embeds: [embed], components : buttonRow });

  }
}
