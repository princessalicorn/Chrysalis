const { MessageEmbed } = require('discord.js');
const fetch = require("node-fetch");
var lang;

module.exports = {
  name: "booru",
  alias: ["manebooru","brony"],
  admin: false,
  run: async (client, message, command, args, prefix, color, langv, modules) => {

    // Return if client can't react
    if (!message.channel.permissionsFor(client.user.id).has('VIEW_CHANNEL') || !message.channel.permissionsFor(client.user.id).has('ADD_REACTIONS')) return;

    lang = langv;
    var query;
    if (args.length>0) {
      if (message.author) query = message.content.slice(prefix.length+command.length+1);
      else query = args[0];
    }
    const filter = modules.find((c) => c.name == 'booru').filter;
    if (query!=null) {
      query = `safe,${query}&filter_id=${filter}`;
    } else {
      query = `safe&filter_id=${filter}`;
    }
    query = `${query}&per_page=50`;
    getBooru(client, query, message, color, 1);
  }
}

async function getBooru(client, query, message, color, numberOfPages) {
  if (numberOfPages > 1) randomPage = Math.floor(Math.random() * numberOfPages)+1;
  else randomPage = 1;
  try {
    await fetch('https://manebooru.art/api/v1/json/search/images?q=' + query + "&page=" + randomPage)
      .then(res => res.json())
      .then(json => {
        if (json.images==null || json.images.length < 1)
        if (message.author)
        return message.reply(lang.no_images_found);
        else return message.editReply(lang.no_images_found);
        imageCount = json.total;
        if (numberOfPages == 1 && imageCount > 50) {
          numberOfPages = Math.trunc(imageCount/50)+1;
          return getBooru(client, query, message, color, numberOfPages);
        }

        randomImage = json.images[Math.floor(Math.random() * json.images.length)];
        imageID = randomImage.id;
        imageURL = randomImage.view_url;
        sourceURL = randomImage.source_url;
        postBooru(client, query, message, imageID, imageURL, sourceURL, imageCount, color);
      })
  } catch (e) {
    if (message.author)
    return message.reply(lang.no_images_found);
    else return message.editReply(lang.no_images_found);
  }
}

async function postBooru(client, query, message, imageID, imageURL, sourceURL, imageCount, color) {
  const embed = new MessageEmbed()
		.setAuthor("Manebooru","https://pbs.twimg.com/profile_images/1298657279789629440/wzkZYACK_400x400.jpg",`https://manebooru.art/images/${imageID}`)
		.setImage(imageURL)
		.setColor(color)
		.setURL(sourceURL && sourceURL != 'https://' ? sourceURL : `https://manebooru.art/images/${imageID}`)
		.setTitle(lang.image_source)
		.setDescription(`${lang.requested_by} ${message.member}`)
		.setFooter(lang.how_to_delete);

  try {
    if (message.author) sentEmbed = await message.channel.send({embeds:[embed]});
    else sentEmbed = await message.editReply({embeds:[embed]});
    sentEmbed.react("❤️");
    sentEmbed.react("❌");
    sentEmbed.createReactionCollector().on('collect', (r, u) => {
      if (r.emoji.name != '❌') return;
      if (r.count > 2 || u.id == message.member.user.id) {
        if (sentEmbed.deleted == false) sentEmbed.delete();
        if (message.author && message.deleted == false && message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) message.delete();
      }
    });
  } catch (e) {
    if (imageCount > 1) getBooru(client, query, message, color, 1);
    else if (message.author)
    return message.reply(lang.no_images_found);
    else return message.editReply(lang.no_images_found);
  }
}
