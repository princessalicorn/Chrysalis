const { MessageEmbed } = require('discord.js');

module.exports = async (message, color, args, action) => {

  let taggedUser = args[0] || message.member.id;

  let author = message.member.nickname || message.member.user.username;
  let onSelf = false;
  let onChrysalis = false;

  if (taggedUser.startsWith('<@!')) taggedUser = taggedUser.substring(3,taggedUser.length-1);
  if (taggedUser.startsWith('<@')) taggedUser = taggedUser.substring(2,taggedUser.length-1);
  try {
    targetUser = await message.guild.members.cache.get(taggedUser);
    color = targetUser.displayHexColor == '#000000' ? color : targetUser.displayHexColor;
    if (targetUser.id == message.client.user.id) onChrysalis = true;
    if (targetUser.id == message.member.id) onSelf = true;
    targetUser = targetUser.nickname || targetUser.user.username;
  } catch (e) {
    targetUser = args.join(' ');
  }

  if (targetUser == '@everyone' || targetUser == '@here' || targetUser == '@everypony') targetUser = 'everypony';

  let embed = new MessageEmbed().setColor(color);

  if (onSelf) embed
    .setTitle(action.onSelf.text.replace(`{0}`,author))
    .setImage(pickRandomElement(action.onSelf.gifs));
  else
  if (onChrysalis && action.onChrysalis) embed
    .setTitle(action.onChrysalis.text.replace(`{0}`,author))
    .setImage(pickRandomElement(action.onChrysalis.gifs));
  else
  if (targetUser == 'everypony' && action.onEverypony) embed
    .setTitle(action.onEverypony.text.replace(`{0}`,author))
    .setImage(pickRandomElement(action.onEverypony.gifs));
  else embed
    .setTitle(action.text.replace('{0}',author).replace('{1}',targetUser))
    .setImage(pickRandomElement(action.gifs));

  return message.author ? message.channel.send({embeds:[embed]}) : message.editReply({embeds:[embed]});

}

function pickRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
