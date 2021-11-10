var MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;

module.exports = async (client, guild, lang) => {
  const applicationCommands = [];
  for (command of client.commands) {
    if (command[0] == 'leaderboard') continue;
    if (command[1].admin || await isEnabled(command[0], guild.id) == false) continue;
    let cmdtxt = lang.commands.find((c) => c.name == command[0]);
    if (!cmdtxt) continue;
    applicationCommands.push({
      name: command[0],
      description: cmdtxt.description,
      options: cmdtxt.options || []
    });
  }
  if (await isEnabled('rank', guild.id)) {
    let cmdtxt = lang.commands.find((c) => c.name == 'leaderboard');
    applicationCommands.push({
      name: 'leaderboard',
      description: cmdtxt.description,
      options: []
    });
  }
  try {
    await guild.commands.set(applicationCommands);
    console.log(`Successfully loaded slash commands on ${guild.name}`)
  } catch (e) {
    console.log(`Can't load slash commands on ${guild.name}`)
  }
}

async function isEnabled(command, guildID) {
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
	if (guild==null) {db.close(); return true;}
  var modules = guild.modules;
  if (modules==null) {db.close(); return true;}

  const fixedModules = modules.filter(m => {
    return m !== null;
  });

  if (fixedModules.length != modules.length) {
    console.log(`Broken modules found on guild with ID ${guildID}`);
    modules = fixedModules;
    await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
  }

	const cmdModule = modules.find((c) => c.name == command);
	if (cmdModule==null) {db.close(); return true;}
	db.close();
	return cmdModule.enabled;

}
