const { Client, Intents, Collection, MessageEmbed, MessageButton, MessageActionRow, MessageAttachment } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES] });
const colors = require('colors');
require('dotenv').config();
const path = require('path');
var fs = require('fs');
const reloadSlashCommands = require('./utils/reloadSlashCommands.js');
const announceLevelUp = require('./utils/announceLevelUp.js');
const connectToDatabase = require('./utils/connectToDatabase.js');
const defaultColor = "#245128";
const defaultModules = require('./defaultModules.json').modules;
const presence = require('./presence.json');
const onCooldown = new Set();
const onVoiceChat = new Set();

// Fetch servers and set Rich Presence
client.on('ready', async () => {
	console.log(colors.bgWhite.black(`Bot started as ${client.user.tag}`));
	await registerSlashCommands();
	client.user.setPresence(presence);
	console.log(colors.bgWhite.black(`${client.user.username} is ready on ${client.guilds.cache.size} server${client.guilds.cache.size != 1 ? 's' : ''}!`));
});

client.on('guildCreate', (guild) => {
  console.log(`Client joined guild ${guild.name} with ID ${guild.id}`);
  createGuild(guild, true);
});

client.on('messageCreate', async (message) => {

	if (message.guild == null) return; // Ignore if message is a DM
	if (message.author.bot) return;

	let guildInfo = await getGuildInfo(message.guild);

  // Send help if bot is tagged
  if (message.content == `<@!${client.user.id}>` || message.content == `<@${client.user.id}>`) await sendHelp(message, guildInfo);

	// Blocked / Banned Words
	if (await bannedWords(message, guildInfo)) return;

	// Execute command
  runCommand(message, guildInfo);

	// Check the suggestions channel (if enabled)
  checkSuggestion(message, guildInfo.modules);

});

client.on('messageUpdate', (oldMessage, newMessage) => {
	sendEditedMessage(oldMessage, newMessage);
  bannedWords(newMessage, null);
});

client.on('messageDelete', (message) => {
	if (message.author.id == client.user.id) return;
	sendDeletedMessage(message);
});

client.on('guildMemberAdd', async (member) => {
	const guildInfo = await getGuildInfo(member.guild);
	const lang = require(`./lang/${guildInfo.lang}.json`);
	const welcome = guildInfo.modules.find((c) => c.name == 'welcome');
	if (welcome == null || !welcome.enabled) return;
	const channel = client.channels.cache.find(channel => channel.id == welcome.channel);
	if (channel == null) return;
	if (!channel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return;
  if (!channel.permissionsFor(client.user.id).has('ATTACH_FILES')) return;
	const welcomeCard = require('./utils/welcomeCard.js');
	welcomeCard(lang, welcome.background, channel, member.user, welcome.message || 'default');
});

client.on('guildMemberRemove', async (member) => {
	const user = member.user;
	const guildInfo = await getGuildInfo(member.guild);
	const lang = require(`./lang/${guildInfo.lang}.json`);
	const goodbye = guildInfo.modules.find((c) => c.name == 'goodbye');
	if (!goodbye.enabled) return;
	const channel = client.channels.cache.find(channel => channel.id == goodbye.channel)
	if (channel != null) {
		if (goodbye.message == null || goodbye.message.trim() == '') goodbye.message = 'default';
		if (goodbye.message == 'default') goodbye.message = lang.goodbye_user;
		if (!channel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return;
		channel.send(goodbye.message.replaceAll('{user}',user.tag).replaceAll('{guild}',member.guild.name));
	}
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
  if (oldMember.premiumSinceTimestamp == 0 && newMember.premiumSinceTimestamp!=0)
	boostEmbed(newMember);
});

client.on('voiceStateUpdate', (oldState, newState) => {
	if ((newState.channel?.id != null && oldState.channel?.id == null) || (newState.channel?.guild?.id != null && oldState.channel?.guild?.id != newState.channel?.guild?.id)) {
		// User joins a voice channel (not switch)
		onVoiceChat.add(`${newState.member.user.id},${newState.guild.id};${new Date()}`);
	}
	if ((oldState.channel?.id != null && newState.channel?.id == null) || (oldState.channel?.guild?.id != null && oldState.channel?.guild?.id != newState.channel?.guild?.id)) {
		// User leaves a voice channel
		addVoiceXP(oldState);
	}
});

client.on('interactionCreate', async (i) => {
	if (i.isCommand()) return runSlashCommand(i);
	if (!i.isButton()) return;
	if (i.guild == null) return i.deferUpdate();
	if (!i.customId.startsWith('role-')) return;
	if (!i.guild.me.permissions.has('MANAGE_ROLES')) return;
	i.deferUpdate();
	let roleID = i.customId.replace('role-', '');
	if (!i.member) i.member = await i.guild.members.fetch(i.user.id);
	await i.member.fetch(true);
	if (i.guild.me.roles.highest.position < i.guild.roles.cache.get(roleID).position) {
		let guildInfo = await getGuildInfo(i.guild);
		let lang = require(`./lang/${guildInfo.lang}.json`);
		return i.user.send(lang.chrysalis_role_too_low);
	}
	if (!i.member.roles.cache.get(roleID)) i.member.roles.add(roleID);
	else i.member.roles.remove(roleID);

});

client.login(process.env.DISCORD_TOKEN);

async function isRestricted(command, message, modules) {
	if (command == 'leaderboard') return isRestricted('rank', message, modules);
	let cmdModule = modules.find((c) => c.name == command);
	if (!cmdModule.enabled) return true;
	if (cmdModule.restricted) return (cmdModule.allowedChannels.indexOf(message.channel.id) == -1);
	else return false;
}

async function runCommand(message, guildInfo) {

  if (!message.channel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return;

  const prefix = guildInfo.prefix;
  const lang = require(`./lang/${guildInfo.lang}.json`);
	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();
	const noxp = ['rank','leaderboard','lb','highscores','top','leaderboards','setxp'];
	if (noxp.indexOf(command) == -1 && guildInfo.modules.find(m => m.name == 'rank').enabled) await addMessageXP(message);

  if (message.content.startsWith(prefix)) {
    let cmd = client.commands.get(command) || client.commands.find((c) => c.alias.includes(command));
    if (cmd) {
      let restricted = false;
      if (!cmd.admin) restricted = await isRestricted(cmd.name, message, guildInfo.modules);
			else if (!message.member.permissions.has('ADMINISTRATOR')) return;
      if (restricted) return message.author.send(lang.wrong_channel);
			if (cmd.nsfw == true && !message.channel.nsfw) return message.author.send(lang.nsfw_only);
			if (cmd.name!='clean') try {
				await message.channel.sendTyping();
			} catch (e) {
				// Discord API is down
			}
			cmd.run(client, message, command, args, prefix, guildInfo.color, lang, guildInfo.modules);
    }
  }
}

async function runSlashCommand(i) {

	let guildInfo = await getGuildInfo(i.guild);
  if (!i.channel.permissionsFor(client.user.id).has('SEND_MESSAGES') || !i.channel.permissionsFor(client.user.id).has('VIEW_CHANNEL')) return;
  let lang = require(`./lang/${guildInfo.lang}.json`);

	let command = i.commandName;
	let args = i.options.data.map(d => d.value);
	let cmd = client.commands.get(command) || client.commands.find((c) => c.alias.includes(command));
	if (cmd) {
		var restricted = false;
		if (!cmd.admin) restricted = await isRestricted(command, i, guildInfo.modules);
		else if (!i.member.permissions.has('ADMINISTRATOR')) return;
		if (restricted) return i.user.send(lang.wrong_channel);
		if (cmd.nsfw == true && !i.channel.nsfw) return i.member.user.send(lang.nsfw_only);
		else {
			await i.deferReply();
			cmd.run(client, i, command, args, null, guildInfo.color, lang, guildInfo.modules);
		}
	}

}

async function registerSlashCommands() {

	// Load commands
	client.commands = new Collection();
	let commands = fs.readdirSync(path.resolve(__dirname, 'commands')).filter((f) => f.endsWith(".js"));
	for (var jsfile of commands) {
		let commandfile = require("./commands/"+jsfile);
		client.commands.set(commandfile.name, commandfile);
		console.log(jsfile+" loaded");
	}
	for (guild of client.guilds.cache) {
		let guildInfo = await getGuildInfo(guild[1]);
		await reloadSlashCommands(client, guild[1], guildInfo);
	}
}

async function bannedWords(message, guildInfo) {

	if (message.member == null) return;
  if (message.member.permissions.has('ADMINISTRATOR')) return;
	if (message.author.id == client.user.id) return;
  if (!message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) return;

	if (guildInfo == null) guildInfo = await getGuildInfo(message.guild);
	const lang = require(`./lang/${guildInfo.lang}.json`);
	const modules = guildInfo.modules;
	const bannedwords = modules.find((c) => c.name == "bannedwords");
	if (!bannedwords.enabled) return false;
	for (word of bannedwords.words) {
		if (message.content.toLowerCase().includes(word.toLowerCase())) {
			message.author.send(lang.message_deleted_dm);
			message.delete();
			return true;
		}
		if (message.attachments.size>0) {
			for (word of bannedwords.words) {
				for (attachment of message.attachments) {
					if (attachment[1].name.toLowerCase().includes(word.toLowerCase())) {
						message.author.send(lang.message_deleted_dm);
						message.delete();
						return true;
					}
				}
			}
		}
	}
	return false;
}

async function sendHelp(message, guildInfo) {

  if (!message.channel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return;

  const lang = require(`./lang/${guildInfo.lang}.json`);

	const embed = new MessageEmbed()
		.setTitle(client.user.username)
		.setThumbnail(client.user.displayAvatarURL())
		.setDescription(`[${lang.invite_the_bot}](https://discord.com/api/oauth2/authorize?client_id=797161820594634762&permissions=8&scope=bot%20applications.commands) | [${lang.website}](https://chrysalis.programmerpony.com) | [${lang.support_server}](https://discord.gg/Vj2jYQKaJP)`)
		.setColor(guildInfo.color)
		.addField('💻 GitLab','[Source Code](https://gitlab.com/programmerpony/Chrysalis)',true)
		.addField(`💞 ${lang.support_the_project}`,'[Buy me a Coffe](https://ko-fi.com/programmerpony)',true)
		.setFooter(`${lang.the_current_prefix_for_this_server_is} ${guildInfo.prefix}`)
	message.channel.send({embeds:[embed]});
}

async function boostEmbed(newMember) {
	const guildInfo = getGuildInfo(newMember.guild);
	const lang = require(`./lang/${guildInfo.lang}.json`);
  const modules = guildInfo.modules;
  const nitro = modules.find((c) => c.name == 'nitro');
  if (nitro.enabled && nitro.channel!='') {
			boosterRole = newMember.guild.roles.premiumSubscriberRole;
			if (boosterRole == null) embedColor = "#db6de2";
			else embedColor = boosterRole.color;
      const emoji = client.emojis.cache.find(emoji => emoji.name == "NitroBoost");
      boostembed = new MessageEmbed()
      	.setTitle(`${lang.boost_title}`)
      	.setDescription(`<a:${emoji.name}:${emoji.id}> ${lang.boost_description} <a:${emoji.name}:${emoji.id}>`)
      	.setThumbnail(newMember.user.displayAvatarURL())
      	.setColor(embedColor)
      const channel = client.channels.cache.find(channel => channel.id == nitro.channel)
			if (channel!=null) channel.send({content:`${lang.boost_message.replace("{0}",newMember.user)}`,embeds:[boostembed]});
  }
}

async function createGuild(guild, rsc) {
	let guildID = guild.id;
	const db = await connectToDatabase();
  const guilds = db.db("chrysalis").collection("guilds");
  const guildo = await guilds.findOne({id: guildID});
  if (guildo==null) {
    await guilds.insertOne({
      id: guildID,
			lang: "en",
      prefix: "c!",
			nsfw: true,
      color: defaultColor,
      modules: defaultModules
    });
		console.log(`Created guild ${guild.name} with ID ${guildID}`);
  }
  db.close();
	if (rsc) await reloadSlashCommands(client, guild, await getGuildInfo(guild));
}

async function checkSuggestion(message, modules) {
	const suggestions = modules.find((c) => c.name == "suggestions");
	if (suggestions.enabled && message.channel.id == suggestions.channel)
	if (message.content.includes("http://") || message.content.includes("https://") || message.attachments.size>0) {
		message.react("✅");
		message.react("❌");
	}
}

async function sendDeletedMessage(message) {
	const guild = message.guild;
	if (guild == null) return;
	const guildInfo = await getGuildInfo(guild);
	const modules = guildInfo.modules;
	const lang = require(`./lang/${guildInfo.lang}.json`);
	const logs = modules.find((c) => c.name == 'logs');
	if (logs.enabled && logs.channel != "") {
		const embed = new MessageEmbed()
			.setTitle(lang.message_deleted)
			.setAuthor(`${message.author.username}#${message.author.discriminator}`,message.author.displayAvatarURL())
			.setColor(guildInfo.color)
			.addField(lang.author,`<@!${message.author.id}>`)

		if (message.content != null && message.content != "")
		embed.addField(lang.message,message.content.substring(0,1024));

		if (message.attachments.size>0)
		embed.addField(lang.attachments,message.attachments.map(a => a.name.substring(0,1024)).toString().split(',').join('\n'));

		embed.addField(lang.message_id, message.id);

		embed.addField(lang.channel,`${message.channel} [${lang.jump_to_moment}](${message.url})`)

		const channel = client.channels.cache.find(channel => channel.id == logs.channel);
		if (channel != null && channel != "" && channel.guild.id == message.guild.id)
		channel.send({embeds:[embed]});
	}
}

async function sendEditedMessage(oldMessage, newMessage) {

	if (oldMessage.attachments.size == newMessage.attachments.size && oldMessage.content == newMessage.content) return;
	if (newMessage.author.id == client.user.id) return;
	const guildID = newMessage.guild.id;
	if (guildID == null || guildID == '') return;
	const guildInfo = await getGuildInfo(newMessage.guild);
	const lang = require(`./lang/${guildInfo.lang}.json`);
	const modules = guildInfo.modules;
	const logs = modules.find((c) => c.name == 'logs');
	if (logs.enabled && logs.channel != "") {
		const embed = new MessageEmbed()
			.setTitle(lang.message_edited)
			.setAuthor(`${newMessage.author.username}#${newMessage.author.discriminator}`,newMessage.author.displayAvatarURL())
			.setColor(guildInfo.color)
			.addField(lang.author,`<@!${newMessage.author.id}>`)

		if (oldMessage.content != newMessage.content) {

			if (oldMessage.content != null && oldMessage.content != "") {
				embed.addField(lang.old_message,oldMessage.content.substring(0,1024));
			}

			if (newMessage.content != null && newMessage.content != "") {
				embed.addField(lang.new_message,newMessage.content.substring(0,1024));
			}

		}

		if (oldMessage.attachments.size>0 && oldMessage.attachments.size != newMessage.attachments.size) {
			embed.addField(lang.old_attachments,oldMessage.attachments.map(a => a.name.substring(0,1024)).toString().split(',').join('\n'));
			if (newMessage.attachments.size>0) embed.addField(lang.new_attachments,oldMessage.attachments.map(a => a.name.substring(0,1024)).toString().split(',').join('\n'));
		}

		embed.addField(lang.message_id, newMessage.id);

		embed.addField(lang.channel,`${newMessage.channel} [${lang.jump_to_moment}](${newMessage.url})`)

		const channel = client.channels.cache.find(channel => channel.id == logs.channel);
		if (channel != null && channel != "" && channel.guild.id == newMessage.guild.id)
		channel.send({embeds:[embed]});
	}
}

async function addMessageXP(message) {

	if (onCooldown.has(`${message.author.id},${message.guild.id}`)) return;
	const guildID = message.guild.id;
	if (guildID == null || guildID == '') return;

	const db = await connectToDatabase();
  const guilds = db.db("chrysalis").collection("guilds");
  const guild = await guilds.findOne({id: guildID});
	const modules = guild.modules;
	let rank = modules.find((c) => c.name == 'rank');
	if (!rank.enabled) return db.close();
	if (rank.xpBlacklistChannels.indexOf(message.channel.id) != -1) return db.close();
	let user = rank.users.find(u => u.id == message.author.id);
	if (user == null) {
		rank.users.push({id: message.author.id, xp: 0});
		user = rank.users.find(u => u.id == message.author.id);
	}
	if (user.xp >= Number.MAX_SAFE_INTEGER) return db.close();

	let currentLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));

	user.xp+=rank.xpPerMessage;

	let newLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));

	if (!isNaN(parseInt(user.xp))) {
		await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
		if ((currentLevel < newLevel) && rank.announceLevelUp)
		announceLevelUp(
			client,
			message.author,
			newLevel,
			rank.announceLevelUpChannel,
			guild.color,
			require(`./lang/${guild.lang}.json`)
		);
	}
	db.close();
	if (rank.messageCooldown > 0) {
		onCooldown.add(`${message.author.id},${message.guild.id}`);
		setTimeout(() => {
			onCooldown.delete(`${message.author.id},${message.guild.id}`);
  	}, rank.messageCooldown*1000);
	}
}

async function addVoiceXP(state) {

	const guildID = state.guild.id;
	if (guildID == null || guildID == '') return;

	const db = await connectToDatabase();
  const guilds = db.db("chrysalis").collection("guilds");
  const guild = await guilds.findOne({id: guildID});
	if (guild == null) return db.close();
	const modules = guild.modules;
	let rank = modules.find((c) => c.name == 'rank');
	if (!rank.enabled) return db.close();
	if (rank.xpBlacklistChannels.indexOf(state.channel.id) != -1) return db.close();
	if (rank.voiceChatCooldown <= 0 || rank.xpInVoiceChat <= 0) return db.close();
	let user = rank.users.find(u => u.id == state.member.user.id);
	if (user == null) {
		rank.users.push({id: state.member.user.id, xp: 0});
		user = rank.users.find(u => u.id == state.member.user.id);
	}
	if (user.xp >= Number.MAX_SAFE_INTEGER) return db.close();

	let currentLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));

	for (val of onVoiceChat) {
		if (val.startsWith(`${state.member.user.id},${state.guild.id};`)) {
			onVoiceChat.delete(val)
			let timestamp = new Date(val.substring(val.indexOf(';')+1,val.length));
			let secondsInVoiceChat = Math.trunc(Math.abs(new Date() - timestamp)/1000);

			if (secondsInVoiceChat >= rank.voiceChatCooldown) user.xp+=Math.trunc(secondsInVoiceChat/rank.voiceChatCooldown)*rank.xpInVoiceChat;

			let newLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));

			if (!isNaN(parseInt(user.xp))) {
				await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
				if ((currentLevel < newLevel) && rank.announceLevelUp)
				announceLevelUp(
					client,
					state.member.user,
					newLevel,
					rank.announceLevelUpChannel,
					guild.color,
					require(`./lang/${guild.lang}.json`)
				);
			}
		}
	}
	db.close();
}

async function getGuildInfo(guild) {
	let guildID = guild.id;
	const db = await connectToDatabase();
	const guilds = db.db('chrysalis').collection('guilds');
	let guildo = await guilds.findOne({id: guildID});
	if (guildo == null) {
		await createGuild(guild, false);
		guildo = await guilds.findOne({id: guildID});
	}
	let modules = guildo.modules;
	const fixedModules = modules.filter(m => {
    return m !== null;
  });
  if (fixedModules.length != modules.length) {
    console.log(`Broken modules found on guild with ID ${guildID}`);
    modules = fixedModules;
    await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
  }
	for (dm of defaultModules) {
		if (modules.find((c) => c.name == dm.name) == null) modules.push(dm);
	}
	for (m of modules) {
		moduleModel = defaultModules.find((c) => c.name == m.name);
		if (moduleModel == null) {
			delete m;
			continue;
		}
	  for (key of Object.keys(moduleModel)) {
	    if (!m.hasOwnProperty(key)) {
	      m[key] = moduleModel[key];
	    }
	  }
		for (key of Object.keys(m)) {
	    if (!moduleModel.hasOwnProperty(key)) {
	      delete m[key];
	      continue;
	    }
		}
	}
	await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
	db.close();
	return guildo;
}
