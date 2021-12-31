const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
  name: 'help',
  alias: ['commands','ayuda','cmds'],
  run: async (client, message, command, args, lang, guildInfo) => {

    const helpModules = client.commands.filter(c => !c.admin && c.name!='help').map(c => c.name);

    let helpEmbed = [];
    let i = 0;
    let rankEnabled = guildInfo.modules.find((c) => c.name == 'rank')?.enabled;
    for (moduleName of helpModules) {
      helpModule = guildInfo.modules.find((c) => c.name == moduleName);
      if (helpModule?.enabled || (moduleName == 'leaderboard' && rankEnabled)) {
        if (helpEmbed[i]?.fields.length == 5) i++;
        helpEmbed[i] ??= new MessageEmbed().setColor(guildInfo.color).setTitle(`__**${lang.user_commands}**__`);
        helpEmbed[i].addField('`'+guildInfo.prefix+lang.help.user[moduleName][0]+'`'+ (lang.help.user[moduleName][2] ? ' ⚠' : ''),lang.help.user[moduleName][1]);
      }
    }

    if (helpEmbed.length > 1) {
      let leftButton = new MessageButton()
        .setStyle('SECONDARY')
        .setLabel('<')
        .setCustomId('left')
        .setDisabled(true);
      let rightButton = new MessageButton()
        .setStyle('SECONDARY')
        .setLabel('>')
        .setCustomId('right');
      let sentEmbed = await message.channel.send({embeds:[helpEmbed[0]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
      let filter = (interaction) => interaction.user.id === message.author.id;
      let collector = sentEmbed.createMessageComponentCollector({filter,  time: 120000 });
      let currentPage = 0;
      collector.on('collect', async (i) => {
        if (i.customId == 'left') {
          if (currentPage > 0) currentPage--;
          leftButton.setDisabled(currentPage == 0);
          rightButton.setDisabled(false);
        } else {
          if (currentPage < helpEmbed.length - 1) currentPage++;
          rightButton.setDisabled(currentPage == helpEmbed.length - 1);
          leftButton.setDisabled(false);
        }
        try {
          await i.update({
            embeds: [helpEmbed[currentPage]],
            components: [new MessageActionRow().addComponents([leftButton, rightButton])]
          });
        } catch (e) {}
      });
      collector.on('end', async (collected, reason) => {
        if (reason == 'time') {
          leftButton.setDisabled(true);
          rightButton.setDisabled(true);
          try {
            await sentEmbed.edit({
              embeds: [helpEmbed[currentPage].setFooter({text:lang.help_time_out})],
              components: [new MessageActionRow().addComponents([leftButton, rightButton])]
            });
          } catch (e) {}
        }
      });
    } else message.channel.send({embeds:[helpEmbed[0]]});

    if (message.member.permissions.has('ADMINISTRATOR')) {
      let adminHelpEmbed = [];
      let i = 0;
      for (ch of lang.help.admin) {
        if (adminHelpEmbed[i]?.fields.length == 5) i++;
        adminHelpEmbed[i] ??= new MessageEmbed().setColor(guildInfo.color).setTitle(`__**${lang.admin_commands}**__`);
        adminHelpEmbed[i].addField('`'+guildInfo.prefix+ch[0]+'`',ch[1]);
      }
      let leftButton = new MessageButton()
        .setStyle('SECONDARY')
        .setLabel('<')
        .setCustomId('left')
        .setDisabled(true);
      let rightButton = new MessageButton()
        .setStyle('SECONDARY')
        .setLabel('>')
        .setCustomId('right');
      let sentEmbed = await message.channel.send({embeds:[adminHelpEmbed[0]], components: [new MessageActionRow().addComponents([leftButton, rightButton])]});
      let filter = (interaction) => interaction.user.id === message.author.id;
      let collector = sentEmbed.createMessageComponentCollector({filter,  time: 120000 });
      let currentPage = 0;
      collector.on('collect', async (i) => {
        if (i.customId == 'left') {
          if (currentPage > 0) currentPage--;
          leftButton.setDisabled(currentPage == 0);
          rightButton.setDisabled(false);
        } else {
          if (currentPage < adminHelpEmbed.length - 1) currentPage++;
          rightButton.setDisabled(currentPage == adminHelpEmbed.length - 1);
          leftButton.setDisabled(false);
        }
        try {
          await i.update({
            embeds: [adminHelpEmbed[currentPage]],
            components: [new MessageActionRow().addComponents([leftButton, rightButton])]
          });
        } catch (e) {}
      });
      collector.on('end', async (collected, reason) => {
        if (reason == 'time') {
          leftButton.setDisabled(true);
          rightButton.setDisabled(true);
          try {
            await sentEmbed.edit({
              embeds: [adminHelpEmbed[currentPage].setFooter({text:lang.help_time_out})],
              components: [new MessageActionRow().addComponents([leftButton, rightButton])]
            });
          } catch (e) {}
        }
      });
    }
  }
}
