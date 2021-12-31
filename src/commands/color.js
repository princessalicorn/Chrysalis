const { MessageEmbed } = require('discord.js');
const connectToDatabase = require('../utils/connectToDatabase.js');

module.exports = {
  name: 'color',
  alias: ['setcolor','changecolor','set-color','change-color'],
  admin: true,
  run: (client, message, command, args, lang, guildInfo) => {

    // Current color
    if (!args[0]) return message.channel.send({embeds:[new MessageEmbed().setTitle(lang.current_color).setDescription(guildInfo.color).setColor(guildInfo.color)]});

    let requestedColor = args[0].replaceAll('#','');
    if (requestedColor.length == 3) requestedColor = requestedColor.repeat(2);
    requestedColor = `#${requestedColor}`;
    let embed = new MessageEmbed().setTitle(lang.change_color_to.replace('{0}', requestedColor));
    try {
      embed.setColor(requestedColor);
    }
    catch (e) {
      return message.reply(lang.invalid_color);
    }
    message.channel.send({embeds:[embed]}).then(confMsg => {
      confMsg.react('✅');
      confMsg.react('❌');
      let filter = (reaction, user) => user.id === message.author.id;
      let collector = confMsg.createReactionCollector({filter,  time: 15000 });
      collector.on('collect', r => {
        switch (r.emoji.name) {
          case '✅':
            updateColor(message, requestedColor, lang);
            confMsg.delete();
            break;
          case '❌':
            confMsg.delete();
            break;
        }
      });
      collector.on('end', (collected, reason) => {
        if (reason == 'time') try {
          confMsg.delete();
          message.delete();
        } catch (e) {}
      });
    });
  }
}

async function updateColor(message, newColor, lang) {
  let db = await connectToDatabase();
  let guilds = db.db('chrysalis').collection('guilds');
  let guild = await guilds.findOne({id: message.guild.id});
  await guilds.updateOne({id: message.guild.id},{ $set: { color: newColor}});
  db.close();
  let embed = new MessageEmbed()
  .setTitle(lang.color_was_changed_to.replace('{0}',newColor))
  .setColor(newColor)
  message.channel.send({embeds:[embed]});
}
