const getBooru = require('../utils/getBooru.js');
const parseQuery = require('../utils/parseQuery.js');

module.exports = {
  name: "clop",
  alias: ["boorunsfw","explicit"],
  admin: false,
  nsfw: true,
  run: async (client, message, command, args, prefix, color, lang, modules) => {

    // Return if client can't react
    if (!message.channel.permissionsFor(client.user.id).has('VIEW_CHANNEL') || !message.channel.permissionsFor(client.user.id).has('ADD_REACTIONS')) return;

    var query = await parseQuery(message, args, prefix);

    const filter = modules.find((c) => c.name == 'clop').filter;

    /* Some tags are hidden by default but they will be
    shown anyways if you explicitly search for them.
    For more customization, use your own filter. */
    const f = ['vore','inflation','fat fetish','fart fetish','fart','scat','diaper','gore','grimdark','grotesque'];
    if (query!='') {
      if (filter == 200) for (i of f) if (!query.includes(i)) query += `,-${i}`;
      query = `explicit,${query}&filter_id=${filter}`;
    } else {
      query = `-${f.toString().replaceAll(',',',-')}&filter_id=${filter}`;
    }
    query = `${query}&per_page=50`;
    getBooru(client, query, message, color, 1, lang);
  }
}
