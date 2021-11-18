module.exports = async (client, guild, guildInfo) => {
  const lang = require(`../lang/${guildInfo.lang}.json`);
  const applicationCommands = [];
  for (command of client.commands) {
    if (command[0] == 'leaderboard') continue;
    if (command[1].admin || !guildInfo.modules.find((c) => c.name == command[0]).enabled) continue;
    let cmdtxt = lang.commands.find((c) => c.name == command[0]);
    if (!cmdtxt) continue;
    applicationCommands.push({
      name: command[0],
      description: cmdtxt.description,
      options: cmdtxt.options || []
    });
  }
  if (guildInfo.modules.find((c) => c.name == 'rank').enabled) {
    let cmdtxt = lang.commands.find((c) => c.name == 'leaderboard');
    applicationCommands.push({
      name: 'leaderboard',
      description: cmdtxt.description,
      options: []
    });
  }
  try {
    await guild.commands.set(applicationCommands);
    console.log(`Successfully (re)loaded slash commands on ${guild.name}`)
  } catch (e) {
    console.log(`Can't load slash commands on ${guild.name}`)
  }
}
