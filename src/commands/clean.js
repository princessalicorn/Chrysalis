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

module.exports = {
  name: 'clean',
  alias: ['bulkdelete','bulk-delete','clear','purge'],
  admin: true,
  run: async (client, message, command, args, lang, guildInfo) => {
    if (!message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) return message.reply(lang.bulk_delete_missing_permissions);
    if (!isNaN(args[0])) {
      let messagesToDelete = parseInt(args[0]);
      if (message.author) messagesToDelete++;
      if (messagesToDelete <= 100) message.channel.bulkDelete(messagesToDelete)
        .catch(rej => message.reply(lang.bulk_delete_two_weeks));
      else message.reply(lang.bulk_delete_max_100);
    }
  }
}
