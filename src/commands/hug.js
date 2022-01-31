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

const actionEmbed = require('../utils/embed/actionEmbed.js');

module.exports = {
  name: 'hug',
  alias: ['hugs','cuddle','cuddles','snuggle','snuggles'],
  run: async (client, message, command, args, lang, guildInfo) => {

    const gifs = [
      'https://cdn.discordapp.com/attachments/862296245922037800/874333300225876088/cute.gif',
      'https://cdn.discordapp.com/attachments/862296245922037800/874333323147755650/startrix.gif',
      'https://cdn.discordapp.com/attachments/862296245922037800/874342011451346975/startrix2.gif',
      'https://cdn.discordapp.com/attachments/862296245922037800/874342394538127360/bon-bon-mlp-lyra-mlp.gif',
      'https://cdn.discordapp.com/attachments/862296245922037800/874333325500751872/4d0.gif',
      'https://cdn.discordapp.com/attachments/862296245922037800/874333325114892308/uwu.gif',
      'https://cdn.discordapp.com/attachments/862296245922037800/874333331221778473/uwuu.gif',
      'https://cdn.discordapp.com/attachments/862296245922037800/874333354353393684/spike.gif',
      'https://cdn.discordapp.com/attachments/862296245922037800/874333362058301520/tactical_hug_incoming.gif',
      'https://cdn.discordapp.com/attachments/862296245922037800/874333368018432020/2b57ddaa1c0199acf9480ef192299a81.gif',
      'https://cdn.discordapp.com/attachments/862296245922037800/880736453368365096/equestria-girls-my-little-pony.gif'
    ];

    actionEmbed(message, guildInfo.color, args, {
      text: lang.hug_title,
      gifs: gifs,
      onSelf: {
        text: lang.hug_self,
        gifs: ['https://cdn.discordapp.com/attachments/862296245922037800/874334737542549514/-_self.gif']
      },
      onChrysalis: {
        text: lang.hug_chrysalis,
        gifs: ['https://cdn.discordapp.com/attachments/862296245922037800/874339818073632818/-_chrysalis.gif']
      },
      onEverypony: {
        text: lang.hug_title.replace('{1}', 'everypony'),
        gifs: ['https://cdn.discordapp.com/attachments/862296245922037800/876471497655468032/-_everypony.gif']
      }
    });

  }
}
