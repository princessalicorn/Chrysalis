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

module.exports = async function fetchImage(client, query, message, color, numberOfPages, lang) {
  let randomPage = numberOfPages > 1 ? Math.floor(Math.random() * numberOfPages)+1 : 1;
  try {
    await fetch(`https://manebooru.art/api/v1/json/search/images?q=${query}&page=${randomPage}`)
      .then(res => res.json())
      .then(async json => {

        // Search in all pages
        if (numberOfPages == 1 && json.total > 50) {
          numberOfPages = Math.trunc(json.total/50)+1;
          return fetchImage(client, query, message, color, numberOfPages, lang);
        }

        // Embed message
        let randomImage = json.images[Math.floor(Math.random() * json.images.length)];
        let imageID = randomImage.id;
        let sourceURL = randomImage.source_url;
        let embed = new MessageEmbed()
      		.setAuthor({
            name: 'Manebooru',
            url: `https://manebooru.art/${imageID}`,
            iconURL: 'https://static.manebooru.art/img/view/2020/8/2/4000004.png'
          })
      		.setImage(randomImage.view_url)
      		.setColor(color)
      		.setURL(sourceURL && sourceURL != 'https://' ? sourceURL : `https://manebooru.art/images/${imageID}`)
      		.setTitle(lang.image_source)
      		.setDescription(`${lang.requested_by} ${message.member}`);
        let row = new MessageActionRow().addComponents(new MessageButton({
          label: lang.how_to_delete,
          customId: `report-https://manebooru.art/images/${imageID}/reports/new${message.author ? `-${message.id}` : ''}`,
          style: 'DANGER'
        }));
        if (message.author) await message.channel.send({embeds:[embed],components:[row]});
        else await message.editReply({embeds:[embed],components:[row]});
      })
  } catch (e) {
    if (message.author) message.reply(lang.no_images_found);
    else message.editReply(lang.no_images_found);
  }
}
