const fetchImage = require('../utils/booru/fetchImage.js');
const parseQuery = require('../utils/booru/parseQuery.js');

module.exports = {
  name: "clop",
  alias: ["boorunsfw","explicit"],
  admin: false,
  nsfw: true,
  run: async (client, message, command, args, prefix, color, lang, modules) => {

    let query = await parseQuery(message, command, args, prefix);
    let filter = modules.find((c) => c.name == 'clop').filter;

    /* Some tags are hidden by default but they will be
    shown anyways if you explicitly search for them.
    For more customization, use your own filter. */
    const f = ['vore','inflation','fat fetish','fart fetish','fart','scat','diaper','gore','grimdark','semi-grimdark','grotesque'];
    if (query!='') {
      if (filter == 200) for (i of f) if (!query.includes(i)) query += `,-${i}`;
      query = `explicit,${query}&filter_id=${filter}&per_page=50`;
    } else {
      query = `-${f.toString().replaceAll(',',',-')}&filter_id=${filter}&per_page=50`;
    }
    fetchImage(client, query, message, color, 1, lang);
  }
}
