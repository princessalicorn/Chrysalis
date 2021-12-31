const { MessageEmbed } = require('discord.js');
const connectToDatabase = require('../utils/connectToDatabase.js');

module.exports = {
  name: 'prefix',
  alias: ['setprefix','changeprefix','prefixset','set-prefix','change-prefix'],
  admin: true,
  run: (client, message, command, args, lang, guildInfo) => {

    if (!args[0]) return message.channel.send(lang.the_current_prefix_is.replace('{0}', guildInfo.prefix))

    message.channel.send(lang.change_prefix_to.replace('{0}', args[0])).then(confMsg => {
      confMsg.react('✅');
      confMsg.react('❌');
      let filter = (reaction, user) => user.id === message.author.id;
      let collector = confMsg.createReactionCollector({filter,  time: 15000 });
      collector.on('collect', r => {
        switch (r.emoji.name) {
          case '✅':
            updatePrefix(message, args[0], lang);
            confMsg.delete();
          break;
          case '❌':
            confMsg.delete();
            break;
        }
      });
      collector.on('end', (collected, reason) => {
        if (reason == 'time') {
          try {
            confMsg.delete();
            message.delete();
          } catch (e) {}
        }
      });
    });
  }
}

async function updatePrefix(message, newPrefix, lang) {
  let db = await connectToDatabase();
  let guilds = db.db('chrysalis').collection('guilds');
  let guild = await guilds.findOne({id: message.guild.id});
  await guilds.updateOne({id: message.guild.id},{ $set: { prefix: newPrefix}});
  db.close();
  message.channel.send(lang.prefix_was_changed_to.replace('{0}', newPrefix));
}
