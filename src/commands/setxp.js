const { MessageEmbed } = require('discord.js');
const connectToDatabase = require('../utils/connectToDatabase.js');
const announceLevelUp = require('../utils/embed/announceLevelUp.js');

module.exports = {
  name: 'setxp',
  alias: ['setexperience','setlevel','setlvl'],
  admin: true,
  run: async (client, message, command, args, lang, guildInfo) => {

    if (!guildInfo.modules.find((c) => c.name == 'rank')?.enabled) return;

    let newXP = parseInt(args[1]);
    if (isNaN(newXP) || newXP < 0) return message.reply(lang.please_type_a_valid_positive_integer);

    let taggedUser = args[0] || message.member.user.id;
    if (taggedUser.includes('<@!')) taggedUser = taggedUser.substring(3,taggedUser.length-1);
    if (taggedUser.startsWith('<@')) taggedUser = taggedUser.substring(2,taggedUser.length-1);

    try {
      taggedUserObject = await client.users.fetch(taggedUser); // Check if it's a valid user

      let db = await connectToDatabase();
      let guilds = db.db('chrysalis').collection('guilds');
      let guild = await guilds.findOne({id: message.guild.id});
    	let modules = guild.modules;
    	let rank = modules.find((c) => c.name == 'rank');
      let user = rank.users.find(u => u.id == taggedUser);
      if (!user) {
        rank.users.push({id: taggedUser, xp: 0});
        user = rank.users.find(u => u.id == taggedUser);
      }
      let currentLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));
      user.xp = newXP;
      let newLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));
      await guilds.updateOne({id: message.guild.id},{ $set: { modules: modules}});
      db.close();
      if ((currentLevel != newLevel) && rank.announceLevelUp)
    	announceLevelUp(
    		client,
    		taggedUserObject,
    		newLevel,
    		rank.announceLevelUpChannel,
    		guildInfo.color,
    		lang
    	);
      let embed = new MessageEmbed()
        .setTitle(taggedUserObject.username)
        .setDescription(`${lang.level}: \`${Math.trunc((Math.sqrt(5)/5)*Math.sqrt(newXP))}\`\nXP: \`${newXP}\``)
        .setColor(guildInfo.color)
        .setThumbnail(taggedUserObject.displayAvatarURL());
      message.reply({embeds:[embed]});
    } catch (e) {
      message.reply(lang.couldn_t_find_that_user);
    }
  }
}
