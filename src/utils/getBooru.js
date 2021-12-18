const { MessageEmbed } = require('discord.js');
const fetch = require("node-fetch");

module.exports = async function getBooru(client, query, message, color, numberOfPages, lang) {
  if (numberOfPages > 1) randomPage = Math.floor(Math.random() * numberOfPages)+1;
  else randomPage = 1;
  try {
    await fetch('https://manebooru.art/api/v1/json/search/images?q=' + query + "&page=" + randomPage)
      .then(res => res.json())
      .then(async json => {

        // No images found
        if (json.images==null || json.images.length < 1)
        if (message.author)
        return message.reply(lang.no_images_found);
        else return message.editReply(lang.no_images_found);

        // Search in all pages
        imageCount = json.total;
        if (numberOfPages == 1 && imageCount > 50) {
          numberOfPages = Math.trunc(imageCount/50)+1;
          return getBooru(client, query, message, color, numberOfPages, lang);
        }

        // Prepare embed
        let randomImage = json.images[Math.floor(Math.random() * json.images.length)];
        let imageID = randomImage.id;
        let sourceURL = randomImage.source_url;
        const embed = new MessageEmbed()
      		.setAuthor("Manebooru",'https://static.manebooru.art/img/view/2020/8/2/4000004.png',`https://manebooru.art/images/${imageID}`)
      		.setImage(randomImage.view_url)
      		.setColor(color)
      		.setURL(sourceURL && sourceURL != 'https://' ? sourceURL : `https://manebooru.art/images/${imageID}`)
      		.setTitle(lang.image_source)
      		.setDescription(`${lang.requested_by} ${message.member}`)
      		.setFooter(lang.how_to_delete);

        // Send embed
        let sentEmbed;
        if (message.author) sentEmbed = await message.channel.send({embeds:[embed]});
        else sentEmbed = await message.editReply({embeds:[embed]});
        sentEmbed.react("❤️");
        sentEmbed.react("❌");
        sentEmbed.createReactionCollector().on('collect', (r, u) => {
          // Delete on reaction
          if (r.emoji.name != '❌') return;
          if (r.count > 2 || u.id == message.member.user.id) {
            if (sentEmbed.deleted == false) sentEmbed.delete();
            if (message.author && message.deleted == false && message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) message.delete();
          }
        });
      })
  } catch (e) {
    console.log(e)
    if (message.author)
    return message.reply(lang.no_images_found);
    else return message.editReply(lang.no_images_found);
  }
}
