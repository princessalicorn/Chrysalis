const { MessageEmbed } = require('discord.js');
const connectToDatabase = require('../utils/connectToDatabase.js');

module.exports = {
  name: 'bannedwords',
  alias: ['addword','addwords','delword','deleteword','removeword','delwords','deletewords','removewords','listwords','wordslist','wordlist'],
  admin: true,
  run: (client, message, command, args, lang, guildInfo) => {

    let list = guildInfo.modules.find((c) => c.name == 'bannedwords')?.words;

    switch (command) {
      case 'addword':
      case 'addwords':
        addWords(message, command, args, guildInfo.color, lang, list, guildInfo.modules);
        break;
      case 'delword':
      case 'deleteword':
      case 'removeword':
      case 'delwords':
      case 'deletewords':
      case 'removewords':
        delWords(message, command, args, guildInfo.color, lang, list, guildInfo.modules);
        break;
      case 'listwords':
      case 'wordslist':
      case 'wordlist':
      case 'bannedwords':
        listWords(message, guildInfo.color, lang, list);
        break;
    }
  }
}

async function listWords(message, color, lang, list) {
  let embed = new MessageEmbed()
  .setTitle(lang.blocked_words)
  .setColor(color)
  if (list.length>0) embed.addField(lang.list,list.join('\n'));
  message.channel.send({embeds:[embed]});
}

async function addWords(message, command, args, color, lang, list, modules) {

  let words = [];
  if (command.endsWith('s')) words.push(args.join(' '));
  else for (word of args) if (list.indexOf(word) == -1) words.push(word);
  let parsedWords = [...new Set(words)];

  if (parsedWords == '') return message.reply(lang.no_new_words_added);

  let bannedwords = modules.find((c) => c.name == 'bannedwords');
  bannedwords.words = bannedwords.words.concat(parsedWords);
  let db = await connectToDatabase();
  let guilds = db.db('chrysalis').collection('guilds');
  await guilds.updateOne({id: message.guild.id},{ $set: { modules: modules}});
  db.close();

  let embed = new MessageEmbed()
    .setTitle(lang.word_s_blocked)
    .addField(lang.word_s,parsedWords.join('\n'))
    .addField(lang.word_s_blocked_by,`${message.author}`)
    .setColor(color)
  message.channel.send({embeds:[embed]});

}

async function delWords(message, command, args, color, lang, list, modules) {

  let words = [...new Set(args)];
  args = args.join(' ');
  let unbannedWords = [];
  if (command.endsWith('s') && list.indexOf(args) > -1) unbannedWords.push(args);
  else for (word of words) if (list.indexOf(word) > -1) unbannedWords.push(word);

  if (unbannedWords == '') return message.reply(lang.no_words_were_removed);

  let bannedwords = modules.find((c) => c.name == 'bannedwords');
  for (unbannedWord of unbannedWords) bannedwords.words.splice(bannedwords.words.indexOf(unbannedWord),1);
  let db = await connectToDatabase();
  let guilds = db.db('chrysalis').collection('guilds');
  await guilds.updateOne({id: message.guild.id},{ $set: { modules: modules}});
  db.close();

  let embed = new MessageEmbed()
    .setTitle(lang.word_s_unblocked)
    .addField(lang.word_s, unbannedWords.join('\n'))
    .addField(lang.word_s_unblocked_by,`${message.author}`)
    .setColor(color)
  message.channel.send({embeds:[embed]});

}
