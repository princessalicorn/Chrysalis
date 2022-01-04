const connectToDatabase = require('../utils/connectToDatabase.js');
const { MessageEmbed } = require('discord.js');
const fields = ['color','bgURL'];

module.exports = {
  name: 'profile',
  alias: ['profile','editprofile'],
  ephemeral: true,
  run: async (client, message, command, args, lang, guildInfo) => {

    let embed = new MessageEmbed()
      .setTitle(lang.profile_fields_title)
      .setDescription(fields.join('\n'))
      .setColor(guildInfo.color);

    let newColor;
    let newBG;

    if (message.author) {
      if (!args[0] || fields.indexOf(args[0])<0) return message.reply({embeds:[embed]});
      if (!args[1]) return message.reply(lang.please_specify_a_new_value);
      if (args[0]==='color') newColor = args[1];
      if (args[0]==='bgURL') newBG = args[1];
    } else {
      newColor = message.options.get(lang.commands.find((c)=>c.name=='profile').options[0].name)?.value;
      newBG = message.options.get(lang.commands.find((c)=>c.name=='profile').options[1].name)?.value;
    }

    if (newColor) {
      newColor = newColor.replaceAll('#','');
      if (newColor.length == 3) newColor = newColor.repeat(2);
      if (newColor.length>6) newColor = newColor.slice(0,6);
      newColor = `#${newColor}`;
      try {
        embed.setColor(newColor);
      } catch (e) {
        return message.author ? message.reply({content:lang.invalid_color}) : message.editReply({content:lang.invalid_color});
      }
    }

    if (!newColor && !newBG) return message.editReply(lang.please_specify_a_new_value);

    let db = await connectToDatabase();
    let users = db.db('chrysalis').collection('users');
    let userPrefs = await users.findOne({id:message.member.user.id});
    if (!userPrefs) {
      await users.insertOne({id:message.member.user.id});
      userPrefs = await users.findOne({id:message.member.user.id});
    }
    if (newColor) await users.updateOne({id: message.member.user.id},{ $set: { color: newColor}});
    if (newBG) await users.updateOne({id: message.member.user.id},{ $set: { bgURL: newBG}});
    db.close();

    let result = new MessageEmbed()
      .setTitle(lang.profile_updated)
      .setImage(newBG || userPrefs.bgURL)
      .setColor(newColor || userPrefs.color || guildInfo.color);
    return message.author ? message.reply({embeds:[result]}) : message.editReply({embeds:[result]});

  }
}
