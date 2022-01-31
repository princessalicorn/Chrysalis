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

const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'love',
  alias: ['amor','lovemeter','ship'],
  run: async (client, message, command, args, lang, guildInfo) => {

    let lovers = message.mentions ? Array.from(message.mentions.users.values()) : [await client.users.fetch(args[0]), await client.users.fetch(args[1])];
    if (!lovers.length) return message.reply(lang.type_one_or_two_users);

    if (!lovers[1]) {
      lovers[1] = lovers[0];
      lovers[0] = message.author;
    }

    if (lovers[0].id == message.member.user.id && lovers[1].id == message.member.user.id) return (message.author) ? message.channel.send(lang.self_love) : message.editReply(lang.self_love);

    let lovePercent = Math.floor(Math.random()*100+1);
    let lovePerTen = Math.floor(lovePercent/10);
    let percentBar = `${'🟥'.repeat(lovePerTen)}${'⬜'.repeat(10-lovePerTen)}`
    let percentMessage = lang.lovemeter_messages[lovePerTen];

    if (lovers[0].id == client.user.id || lovers[1].id == client.user.id || lovers[1] == lovers[0]) {
      lovePercent = 0;
      percentBar = '⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜';
      percentMessage = '...';
    }

    let embed = new MessageEmbed()
    .setTitle(`${lovers[0].username} x ${lovers[1].username}`)
    .setDescription(`${lovePercent}%   ${percentBar}\n${percentMessage}`)
    .setColor(guildInfo.color);

    if (message.author) message.channel.send({embeds:[embed]});
    else message.editReply({embeds:[embed]});

  }
}
