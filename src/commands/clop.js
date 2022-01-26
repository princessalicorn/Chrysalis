const fetchImage = require('../utils/booru/fetchImage.js');
const parseQuery = require('../utils/booru/parseQuery.js');

module.exports = {
  name: 'clop',
  alias: ['boorunsfw','explicit'],
  nsfw: true,
  run: async (client, message, command, args, lang, guildInfo) => {

    let query = await parseQuery(message, args);
    let filter = guildInfo.modules.find((c) => c.name == 'clop').filter;

    /* Some tags are hidden by default but they will be
    shown anyways if you explicitly search for them.
    For more customization, use your own filter. */
    const f = ['grimdark','semi-grimdark','grotesque','gore','vore','inflation','fat fetish','fattening','force feeding','fart','fart fetish','scat','diaper','screencap','hyper muscle','hyper lactation','hyper'];
    if (query) {
      if (filter == 200) for (i of f) if (!query.includes(i)) query += `,-${i}`;
      query = `${query.includes('id:') || `,${query}`.includes(',suggestive') ? '(questionable || explicit || suggestive)' : '(questionable || explicit)'},${query}&filter_id=${filter}&per_page=50`;
    } else {
      query = `-${f.join(',-')}&filter_id=${filter}&per_page=50`;
    }
    fetchImage(client, query, message, guildInfo.color, 1, lang);
  }
}
