module.exports = async (client, guild, guildInfo) => {
  let lang = require(`../lang/${guildInfo.lang}.json`);
  let applicationCommands = [];
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

  // If rank is enbaled, enable leaderboard too
  if (guildInfo.modules.find((c) => c.name == 'rank').enabled) applicationCommands.push({name: 'leaderboard', description: lang.commands.find((c) => c.name == 'leaderboard').description, options: []});

  try {
    await guild.commands.set(applicationCommands);
    console.log(`Successfully (re)loaded slash commands on ${guild.name}`)
  } catch (e) {
    console.log(`Can't load slash commands on ${guild.name}`)
  }
}
