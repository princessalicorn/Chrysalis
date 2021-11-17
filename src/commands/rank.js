const canvacord = require('canvacord');
const { MessageAttachment } = require('discord.js')
const connectToDatabase = require('../utils/connectToDatabase.js');

module.exports = {
  name: "rank",
  alias: ["level"],
  admin: false,
  run: async (client, message, command, args, prefix, color, lang) => {

    const guildID = message.guild.id
    const channelID = message.channel.id

    taggedUser = args[0];

    if (taggedUser == null || taggedUser == '') taggedUser = message.member.user.id;
    else {
      if (taggedUser.includes("<@!")) taggedUser = taggedUser.substring(3,taggedUser.length-1);
      if (taggedUser.startsWith("<@")) taggedUser = taggedUser.substring(2,taggedUser.length-1);
    }

    try {
      taggedUserObject = await client.users.fetch(taggedUser); // Check if it's a valid user
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
        await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
        rank = modules.find((c) => c.name == 'rank');
      }
      db.close();
      if (!rank.enabled) return;
      let user = rank.users.find(u => u.id == taggedUser);
      if (user == null) {
        rank.users.push({id: taggedUser, xp: 0});
        user = rank.users.find(u => u.id == taggedUser);
      }
      let userLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));
      let highscores = rank.users.sort((a, b) => (a.xp < b.xp) ? 1 : -1);
      const rankCard = new canvacord.Rank()
          .setAvatar(await taggedUserObject.displayAvatarURL({format: 'png'})+ "?size=1024")
          .setUsername(taggedUserObject.username)
          .setDiscriminator(taggedUserObject.discriminator)
          .setRank(highscores.indexOf(user)+1)
          .setLevel(userLevel)
          .setCurrentXP(user.xp)
          .setRequiredXP((userLevel+1)*(userLevel+1)*5)
          .setStatus('offline')
          .setProgressBar("#FFFFFF", "COLOR")
      rankCard.build()
          .then(data => {
              const attachment = new MessageAttachment(data, "rank.png");
              if (message.author) message.channel.send({files: [attachment]});
              else message.editReply({files: [attachment]});
          });
    } catch (e) {
      console.log(e)
      if (message.author) message.reply(lang.couldn_t_find_that_user);
      else message.editReply(lang.couldn_t_find_that_user);
    }
  }
}
