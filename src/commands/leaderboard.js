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
      .setThumbnail(message.guild.iconURL());
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
