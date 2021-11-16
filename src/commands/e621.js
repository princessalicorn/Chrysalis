const { MessageEmbed } = require('discord.js');
const fetch = require("node-fetch");
var lang;

module.exports = {
  name: "e621",
  alias: ["furry","yiff"],
  admin: false,
  nsfw: true,
  run: async (client, message, command, args, prefix, color, langv) => {

    // Return if client can't react
    if (!message.channel.permissionsFor(client.user.id).has('VIEW_CHANNEL') || !message.channel.permissionsFor(client.user.id).has('ADD_REACTIONS')) return;

    lang = langv;
    var query;
    if (args.length>0) {
      if (message.author) query = message.content.slice(prefix.length+command.length+1).split(' ').join('+');
      else query = args[0].replaceAll(' ', '+');
    }
    if (query == null) query = 'limit=50'
    else query = `tags=${query}&limit=50`;
    getYiff(client, query, message, color, 1);
  }
}

async function getYiff(client, query, message, color, numberOfPages) {
  if (numberOfPages > 1) randomPage = Math.floor(Math.random() * numberOfPages)+1;
  else randomPage = 1;
  try {
    await fetch(`https://e621.net/posts.json?${query}&page=${randomPage}`, {
      headers: {
        "User-Agent": "Chrysalis (programmerpony)"
      }
    })
      .then(res => res.json())
      .then(json => {
        if (json.posts==null || json.posts.length < 1)
        if (message.author)
        return message.reply(lang.no_images_found);
        else return message.editReply(lang.no_images_found);
        imageCount = 50; // No way to count pages for now
        // If you're too horny and 50 images aren't enough, type more tags.

        randomImage = json.posts[Math.floor(Math.random() * json.posts.length)];
        imageID = randomImage.id;
        imageURL = randomImage.file.url;
        sourceURL = randomImage.sources[0];
        postYiff(client, query, message, imageID, imageURL, sourceURL, imageCount, color);
      })
  } catch (e) {
    if (message.author)
    return message.reply(lang.no_images_found);
    else return message.editReply(lang.no_images_found);
  }
}

async function postYiff(client, query, message, imageID, imageURL, sourceURL, imageCount, color) {
  try {
    if (message.author) sentLink = await message.channel.send(`${lang.how_to_delete}\nhttps://e621.net/posts/${imageID}`);
    else sentLink = await message.editReply(`${lang.how_to_delete}\nhttps://e621.net/posts/${imageID}`);
    sentLink.react("❤️");
    sentLink.react("❌");
    sentLink.createReactionCollector().on('collect', (r, u) => {
      if (r.emoji.name != '❌') return;
      if (r.count > 2 || u.id == message.member.user.id) {
        if (sentLink.deleted == false) sentLink.delete();
        if (message.author && message.deleted == false && message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) message.delete();
      }
    });
  } catch (e) {
    if (imageCount > 1) getYiff(client, query, message, color, 1);
    else if (message.author)
    return message.reply(lang.no_images_found);
    else return message.editReply(lang.no_images_found);
  }
}
