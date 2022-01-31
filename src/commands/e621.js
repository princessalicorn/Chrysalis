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

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  name: 'e621',
  alias: ['furry','yiff'],
  nsfw: true,
  run: async (client, message, command, args, lang, guildInfo) => {
    try {
      // No way to count pages for now, sorry.
      // If you're too horny and 320 images aren't enough, type more tags.
      await fetch(`https://e621.net/posts.json?${args.length>0 ? `tags=${message.author ? args.join('+') : args[0].replaceAll(' ', '+')}&limit=320` : 'limit=320'}`, {
        headers: {
          'User-Agent': 'Chrysalis (programmerpony)'
        }
      }).then(res => res.json()).then(async json => {
        randomImage = json.posts[Math.floor(Math.random() * json.posts.length)];
        imageID = randomImage.id;
        imageURL = randomImage.file.url;
        sourceURL = randomImage.sources[0];
        let row = new MessageActionRow().addComponents(new MessageButton({
          label: lang.how_to_delete,
          customId: `report-https://e621.net/tickets/new?disp_id=${imageID}&type=post${message.author ? `-${message.id}` : ''}`,
          style: 'DANGER'
        }));
        return message.author ? message.channel.send({content:`https://e621.net/posts/${imageID}`,components:[row]}) : message.editReply({content:`https://e621.net/posts/${imageID}`,components:[row]});
      });
    } catch (e) {
      return message.author ? message.reply(lang.no_images_found) : message.editReply(lang.no_images_found);
    }
  }
}
