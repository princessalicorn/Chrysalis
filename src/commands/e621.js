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
