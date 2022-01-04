const connectToDatabase = require('../utils/connectToDatabase.js');
const rankCard = require('../utils/embed/rankCard.js');
const { MessageAttachment } = require('discord.js');

module.exports = {
  name: 'rank',
  alias: ['level'],
  run: async (client, message, command, args, lang, guildInfo) => {

    taggedUser = args[0] || message.member.user.id;
    if (taggedUser.includes('<@!')) taggedUser = taggedUser.substring(3,taggedUser.length-1);
    if (taggedUser.startsWith('<@')) taggedUser = taggedUser.substring(2,taggedUser.length-1);

    try {
      taggedUserObject = await client.users.fetch(taggedUser); // Check if it's a valid user
    	let rank = guildInfo.modules.find((c) => c.name == 'rank');
      let user = rank.users.find(u => u.id == taggedUser);
      if (!user) {
        rank.users.push({id: taggedUser, xp: 0});
        user = rank.users.find(u => u.id == taggedUser);
      }
      let userLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));
      let highscores = rank.users.sort((a, b) => (a.xp < b.xp) ? 1 : -1);

      let db = await connectToDatabase();
      let users = db.db('chrysalis').collection('users');
      let userPrefs = await users.findOne({id:user.id});
      db.close();

      await rankCard(
        taggedUserObject,
        userPrefs?.color || '#4f9068',
        userPrefs?.bgURL,
        highscores.indexOf(user)+1,
        userLevel,
        user.xp-(userLevel*userLevel*5),
        ((userLevel+1)*(userLevel+1)*5)-(userLevel*userLevel*5),
        user.xp,
        message,
        lang
      );

    } catch (e) {
      if (message.author) message.reply(lang.couldn_t_find_that_user);
      else message.editReply(lang.couldn_t_find_that_user);
    }
  }
}
