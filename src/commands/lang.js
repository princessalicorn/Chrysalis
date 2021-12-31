const { MessageEmbed } = require('discord.js');
const reloadSlashCommands = require('../utils/reloadSlashCommands.js');
const connectToDatabase = require('../utils/connectToDatabase.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'lang',
  alias: ['setlang','language','setlanguage'],
  admin: true,
  run: (client, message, command, args, lang, guildInfo) => {
    let validLangs = fs.readdirSync(path.resolve(__dirname, '../lang/')).filter((f) => f.endsWith('.json')).map(f => f.slice(0,f.indexOf('.json')));
    if (validLangs.indexOf(args[0])>-1) return changeLang(client, message, args[0]);
    let embed = new MessageEmbed()
      .setTitle(lang.available_languages)
      .setColor(guildInfo.color)
      .setDescription(validLangs.join('\n'));
    return message.author ? message.channel.send({embeds:[embed]}): message.editReply({embeds:[embed]});
  }
}

async function changeLang(client, message, newLang) {
  let guildID = message.guild.id;
  let db = await connectToDatabase();
  let guilds = db.db('chrysalis').collection('guilds');
  let guild = await guilds.findOne({id: guildID});
  await guilds.updateOne({id: guildID},{ $set: { lang: newLang}});
  db.close();
  guild.lang = newLang;
  reloadSlashCommands(client, message.guild, guild);
  message.channel.send(require(`../lang/${newLang}.json`).new_lang_message);
}
