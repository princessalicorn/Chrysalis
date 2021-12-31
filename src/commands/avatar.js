const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'avatar',
  alias: ['pfp'],
  run: async (client, message, command, args, lang, guildInfo) => {

    let taggedUser = args[0] || message.member.user.id;
    if (taggedUser.includes('<@!')) taggedUser = taggedUser.substring(3,taggedUser.length-1);
    if (taggedUser.startsWith('<@')) taggedUser = taggedUser.substring(2,taggedUser.length-1);
    try {
      taggedUser = await message.guild.members.fetch(taggedUser)
    } catch (e) {
      try {
        taggedUser = await client.users.fetch(taggedUser);
      } catch (e) {
        if (message.author) return message.reply(lang.couldn_t_find_that_user);
        else return message.editReply({content:lang.couldn_t_find_that_user})
      }
    }


    // If tagged user is Chrysalis, send profile picture artwork source
    const artwork = 'https://www.deviantart.com/mirroredsea/art/Chrysalis-718716441';
    if (taggedUser.id == client.user.id)
    if (message.author) return message.channel.send(artowrk);
    else return message.editReply(artwork);

    let avatarembed = new MessageEmbed()
    .setTitle(lang.avatar.replace('{0}', taggedUser.displayName || taggedUser.username))
    .setImage(`${taggedUser.displayAvatarURL()}?size=1024`)
    .setColor((taggedUser.displayHexColor && taggedUser.displayHexColor != '#000000') ? taggedUser.displayHexColor: guildInfo.color)
    if (message.author) return message.channel.send({embeds:[avatarembed]});
    else return message.editReply({embeds:[avatarembed]});

  }
}
