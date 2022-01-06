const welcomeCard = require('../utils/canvas/welcomeCard.js');

module.exports = {
  name: 'welcome',
  alias: ['welcome-card','welcome-image','greeting','greeting-image','greeting-card'],
  admin: true,
  run: async (client, message, command, args, lang, guildInfo) => {

    if (!message.channel.permissionsFor(client.user.id).has('ATTACH_FILES')) return message.reply(lang.attach_files_permission_missing);

    let taggedUser = args[0] || message.member.user.id;

    let user = message.guild.members.cache.get(taggedUser)?.user;
    if (!user) {
      if (taggedUser.includes('<@!')) taggedUser = taggedUser.substring(3,taggedUser.length-1);
      if (taggedUser.startsWith('<@')) taggedUser = taggedUser.substring(2,taggedUser.length-1);
      try {
        user ??= await client.users.fetch(taggedUser);
      } catch (e) {
        if (message.author) return message.reply(lang.couldn_t_find_that_user);
        else return message.editReply(lang.couldn_t_find_that_user);
      }
    }

    let welcome = guildInfo.modules.find((c) => c.name == 'welcome');
    welcomeCard(lang, welcome.background, message.channel, user, welcome.message || 'default');

  }
}
