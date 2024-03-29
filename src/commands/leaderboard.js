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
  name: 'leaderboard',
  alias: ['lb','highscores','top','leaderboards'],
  run: async (client, message, command, args, lang, guildInfo) => {

  	let rank = guildInfo.modules.find((c) => c.name == 'rank');
    if (!rank.enabled) return;
    let embed = new MessageEmbed()
      .setTitle(lang.leaderboard_title)
      .setColor(guildInfo.color)
      .setThumbnail(message.guild.iconURL({size:1024}));
    let description = '';
    let highscores = rank.users.sort((a, b) => (a.xp < b.xp) ? 1 : -1);
    for (i of highscores.slice(0,10).keys()) {
      description+=`${getNumberEmoji(i+1)} ► <@!${highscores[i].id}>
                    ${lang.level}: \`${Math.trunc((Math.sqrt(5)/5)*Math.sqrt(highscores[i].xp))}\`
                    XP: \`${highscores[i].xp}\`\n`;
    }
    embed.setDescription(description);
    if (message.author) message.channel.send({embeds:[embed]});
    else message.editReply({embeds:[embed]});
  }
}

function getNumberEmoji(n) {
  switch (n) {
    case 1:
    return ':first_place:'
    case 2:
    return ':second_place:'
    case 3:
    return ':third_place:'
    case 4:
    return ':four:'
    case 5:
    return ':five:'
    case 6:
    return ':six:'
    case 7:
    return ':seven:'
    case 8:
    return ':eight:'
    case 9:
    return ':nine:'
    case 10:
    return ':keycap_ten:'
  }
}
