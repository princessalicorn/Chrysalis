const fetchImage = require('../utils/booru/fetchImage.js');
const parseQuery = require('../utils/booru/parseQuery.js');

module.exports = {
  name: 'booru',
  alias: ['manebooru','brony'],
  run: async (client, message, command, args, lang, guildInfo) => {

    let filter = guildInfo.modules.find((c) => c.name == 'booru').filter;
    let query = await parseQuery(message, args);

    query = query!='' ? `safe,${query}&filter_id=${filter}&per_page=50` : `safe&filter_id=${filter}&per_page=50`;

    fetchImage(client, query, message, guildInfo.color, 1, lang);

  }
}
