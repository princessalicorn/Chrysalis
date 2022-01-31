/*

 Copyright (C) 2022 programmerpony

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

const connectToDatabase = require('../utils/connectToDatabase.js');
const { MessageEmbed } = require('discord.js');
const Canvas = require('canvas');
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
      newColor = `#${newColor.replaceAll('#','').repeat(6).slice(0,6)}`;
      try {
        embed.setColor(newColor);
      } catch (e) {
        return message.author ? message.reply({content:lang.invalid_color}) : message.editReply({content:lang.invalid_color});
      }
    }

    if (newBG) {
      try {
        await Canvas.loadImage(newBG);
      } catch (e) {
        return message.author ? message.reply({content:lang.unsupported_image_type}) : message.editReply({content:lang.unsupported_image_type});
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
