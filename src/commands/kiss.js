const actionEmbed = require('../utils/embed/actionEmbed.js');

module.exports = {
  name: "kiss",
  alias: ["smooch"],
  admin: false,
  run: async (client, message, command, args, prefix, color, lang) => {

    const gifs = [
      "https://cdn.discordapp.com/attachments/862296245922037800/925036338154201158/adorable-my-litte-pony.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/925036342184923136/uwu.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/925036341870358608/starlightxfluttershy.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/925036341253800026/my-little-pony-kiss.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/925036340368777256/moondancer.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/925036340033228860/derpyxmayor.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/925036339605418034/d4jb2ip-adb6b280-cf20-4bfe-b2ac-f9bdfba54c9d.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/925036339064348733/canon.gif",
      "https://cdn.discordapp.com/attachments/862296245922037800/925036338607177748/bright-mac-bright-macintosh.gif"
    ];

    actionEmbed(
      message,
      color,
      args,
      {
        text: lang.kiss_title,
        gifs: gifs,
        onSelf: {
          text: lang.kiss_self,
          gifs: ['https://cdn.discordapp.com/attachments/862296245922037800/925036205408653332/-_self.gif']
        },
        onChrysalis: {
          text: lang.kiss_chrysalis,
          gifs: ['https://cdn.discordapp.com/attachments/862296245922037800/925036205056360479/-_chrysalis.gif']
        }
      }
    );

  }
}
