const getBooru = require('../utils/getBooru.js');
const parseQuery = require('../utils/parseQuery.js');

module.exports = {
  name: "booru",
  alias: ["manebooru","brony"],
  admin: false,
  run: async (client, message, command, args, prefix, color, lang, modules) => {

    // Return if client can't react
    if (!message.channel.permissionsFor(client.user.id).has('VIEW_CHANNEL') || !message.channel.permissionsFor(client.user.id).has('ADD_REACTIONS')) return;

    var query = await parseQuery(message, args, prefix);

    const filter = modules.find((c) => c.name == 'booru').filter;

    if (query!='') {
      query = `safe,${query}&filter_id=${filter}`;
    } else {
      query = `safe&filter_id=${filter}`;
    }
    query = `${query}&per_page=50`;
    getBooru(client, query, message, color, 1, lang);
  }
}
