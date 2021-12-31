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
          customId: message.author ? `delete-${message.id}` : 'delete',
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
