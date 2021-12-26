const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fetch = require("node-fetch");

module.exports = {
  name: "e621",
  alias: ["furry","yiff"],
  admin: false,
  nsfw: true,
  run: async (client, message, command, args, prefix, color, lang) => {

    let query;
    if (args.length>0) {
      if (message.author) query = message.content.slice(prefix.length+command.length+1).split(' ').join('+');
      else query = args[0].replaceAll(' ', '+');
    }
    if (query == null) query = 'limit=50';
    else query = `tags=${query}&limit=50`;
    getYiff(client, query, message, color, 1, lang);
  }
}

async function getYiff(client, query, message, color, numberOfPages, lang) {
  if (numberOfPages > 1) randomPage = Math.floor(Math.random() * numberOfPages)+1;
  else randomPage = 1;
  try {
    await fetch(`https://e621.net/posts.json?${query}&page=${randomPage}`, {
      headers: {
        "User-Agent": "Chrysalis (programmerpony)"
      }
    })
      .then(res => res.json())
      .then(async json => {
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
        let row = new MessageActionRow().addComponents(new MessageButton({
          label: lang.how_to_delete,
          customId: message.author ? `delete-${message.id}` : 'delete',
          style: 'DANGER'
        }));
        if (message.author) await message.channel.send({content:`https://e621.net/posts/${imageID}`,components:[row]});
        else await message.editReply({content:`https://e621.net/posts/${imageID}`,components:[row]});
      })
  } catch (e) {
    console.log(e)
    if (message.author)
    return message.reply(lang.no_images_found);
    else return message.editReply(lang.no_images_found);
  }
}
