const { MessageEmbed } = require('discord.js');
const connectToDatabase = require('../utils/connectToDatabase.js');
const announceLevelUp = require('../utils/announceLevelUp.js');

module.exports = {
  name: "setxp",
  alias: ["setexperience","setlevel","setlvl"],
  admin: true,
  run: async (client, message, command, args, prefix, color, lang) => {

    taggedUser = args[0];
    newXP = parseInt(args[1]);

    if (taggedUser == null || taggedUser == '') return message.reply(lang.couldn_t_find_that_user);
    if (taggedUser.includes("<@!")) taggedUser = taggedUser.substring(3,taggedUser.length-1);
    if (taggedUser.startsWith("<@")) taggedUser = taggedUser.substring(2,taggedUser.length-1);

    if (isNaN(newXP) || newXP < 0) return message.reply(lang.please_type_a_valid_positive_integer);

    try {
      taggedUserObject = await client.users.fetch(taggedUser); // Check if it's a valid user

      const guildID = message.guild.id;

      const db = await connectToDatabase();
      const guilds = db.db("chrysalis").collection("guilds");
      const guild = await guilds.findOne({id: guildID});
    	if (guild == null) return db.close();
    	const modules = guild.modules;
      if (modules==null) return db.close();
    	let rank = modules.find((c) => c.name == 'rank');
      if (rank == null) {
        const defaultModules = require('./defaultModules.json').modules;
        moduleModel = defaultModules.find((m) => m.name == 'rank');
        modules.push(moduleModel);
        rank = modules.find((c) => c.name == 'rank');
      }
      if (!rank.enabled) return db.close();
      let user = rank.users.find(u => u.id == taggedUser);
      if (user == null) {
        rank.users.push({id: taggedUser, xp: 0});
        user = rank.users.find(u => u.id == taggedUser);
      }
      let currentLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));
      user.xp = newXP;
      let newLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));
      await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
      db.close();
      if ((currentLevel != newLevel) && rank.announceLevelUp)
    	announceLevelUp(
    		client,
    		taggedUserObject,
    		newLevel,
    		rank.announceLevelUpChannel,
    		color,
    		lang
    	);
      let embed = new MessageEmbed()
        .setTitle(taggedUserObject.username)
        .setDescription(`${lang.level}: \`${Math.trunc((Math.sqrt(5)/5)*Math.sqrt(newXP))}\`\nXP: \`${newXP}\``)
        .setColor(color)
        .setThumbnail(taggedUserObject.displayAvatarURL());
      message.reply({embeds:[embed]});
    } catch (e) {
      console.log(e)
      message.reply(lang.couldn_t_find_that_user);
    }
  }
}
