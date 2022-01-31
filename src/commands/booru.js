/*

 Copyright (C) 2022 programmerpony

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

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
