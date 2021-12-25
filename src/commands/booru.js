const fetchImage = require('../utils/booru/fetchImage.js');
const parseQuery = require('../utils/booru/parseQuery.js');

module.exports = {
  name: "booru",
  alias: ["manebooru","brony"],
  admin: false,
  run: async (client, message, command, args, prefix, color, lang, modules) => {

    // Return if client can't react
    if (!message.channel.permissionsFor(client.user.id).has('VIEW_CHANNEL') || !message.channel.permissionsFor(client.user.id).has('ADD_REACTIONS')) return;

    const filter = modules.find((c) => c.name == 'booru').filter;
    var query = await parseQuery(message, command, args, prefix);

    query = query!='' ? `safe,${query}&filter_id=${filter}&per_page=50` : `safe&filter_id=${filter}&per_page=50`;

    fetchImage(client, query, message, color, 1, lang);
  }
}
