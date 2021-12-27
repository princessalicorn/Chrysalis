const { MessageEmbed } = require('discord.js');
const fetch = require("node-fetch");
var lang;
const defaultModules = require('../defaultModules.json').modules;
const reloadSlashCommands = require('../utils/reloadSlashCommands.js');
const connectToDatabase = require('../utils/connectToDatabase.js');

const validModules = defaultModules.map(m => m.name);
vmembed = new MessageEmbed();

/*

DISCLAIMER:
I had no idea what the fuck I was doing.
Please don't kill me.

*/

module.exports = {
  name: "module",
  alias: ["modules","editmodule","config","enable","disable"],
  admin: true,
  run: (client, message, command, args, prefix, color, langv, modules) => {

    lang = langv;

    vmembed.setTitle(lang.valid_modules)
    .setColor(color)
    .setDescription(validModules.toString().split(',').join('\n'))

    var requestedModule = args[0];
    if (requestedModule == null || requestedModule == "") return message.channel.send({embeds:[vmembed]});
    //else requestedModule = requestedModule.toLowerCase();

    if (command == "enable" || command == "disable") return switchModule(message, requestedModule, command == "enable", color);

    var action = args[1];
    if (action == null || action == "") return sendHelp(message, requestedModule, color);
    //else action = action.toLowerCase();

    switch (action) {
      case "enable":
      case "disable":
      switchModule(message, requestedModule, action == 'enable', color);
      break;
      default:
      checkAction(message, requestedModule, action, color, args);
      break;
    }

  }
}

async function switchModule(message, modulearg, enable, color) {
  // Enables or disables a module
  if (modulearg == null || modulearg == "") {
      message.channel.send({embeds:[vmembed]})
      return;
  }
  if (validModules.indexOf(modulearg) == -1) {
    vmembed = new MessageEmbed()
    .setTitle(lang.valid_modules)
    .setColor(color)
    .setDescription(validModules.toString().split(',').join('\n'))
    message.channel.send({embeds:[vmembed]});
    return;
  } else {
    const guildID = message.guild.id;
    const db = await connectToDatabase();
    const guilds = db.db("chrysalis").collection("guilds");
    const guild = await guilds.findOne({id: guildID});
    const modules = guild.modules;
    const desiredModule = modules.find((c) => c.name == modulearg);
    if (desiredModule==null) {
      moduleModel = defaultModules.find((c) => c.name == modulearg);
      modules.push(moduleModel);
    } else {
      desiredModule.enabled = enable;
    }
    await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
    db.close();
    txt = (enable) ? lang.module_enabled : lang.module_disabled;
    message.channel.send(txt.replace('{0}', modulearg));
    await reloadSlashCommands(message.client, message.guild, guild);
  }
}

async function sendHelp(message, requestedModule, color) {
  const guildID = message.guild.id;
  const db = await connectToDatabase();
  const guilds = db.db("chrysalis").collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  const modules = guild.modules
  if (validModules.indexOf(requestedModule) == -1) {
    db.close();
    message.channel.send({embeds:[vmembed]});
    return;
  }
  moduleObj = modules.find((c) => c.name == requestedModule);
  if (moduleObj == null) {
    moduleModel = defaultModules.find((c) => c.name == requestedModule);
    modules.push(moduleModel);
    await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
    db.close();
    return sendHelp(message, requestedModule, color);
  }
  const helpEmbed = new MessageEmbed().setTitle(requestedModule).setColor(color);
  moduleModel = defaultModules.find((c) => c.name == requestedModule);
  for (key of Object.keys(moduleModel)) {
    if (!moduleObj.hasOwnProperty(key)) {
      moduleObj[key] = moduleModel[key];
    }
  }
  for (key of Object.keys(moduleObj)) {
    if (!moduleModel.hasOwnProperty(key)) {
      delete moduleObj[key];
      continue;
    }
    if (key == 'name' || key == 'users') continue;
    switch (typeof moduleObj[key]) {
      case 'boolean':
      if (moduleObj[key]) helpEmbed.addField(key, '✅')
      else helpEmbed.addField(key, '❌')
      break;
      case 'string':
      var content = moduleObj[key]
      if (content == '') content = '...'
      if (key == 'channel' || key == 'announceLevelUpChannel') helpEmbed.addField(key, content == '...' ? content : `<#${content}>`);
      else if (key == 'message' && content == 'default') {
        if (requestedModule == 'welcome') helpEmbed.addField(key, lang.welcome_to_guild);
        else if (requestedModule == 'goodbye') helpEmbed.addField(key, lang.goodbye_user);
      }
      else if (key == 'banMessage' && content == 'default') helpEmbed.addField(key, lang.user_was_banned);
      else helpEmbed.addField(key, content);
      break;
      case 'number':
      helpEmbed.addField(key, moduleObj[key].toString());
      case 'object':
      if (Array.isArray(moduleObj[key])) {
        if (moduleObj[key].length == 0)
        helpEmbed.addField(key, '[]');
        else {
          if (key=='allowedChannels' || key=='xpBlacklistChannels') {
            let channels = JSON.parse(JSON.stringify(moduleObj[key])); // Make copy instead of reference
            for (let key of Object.keys(channels)) {
              channels[key] = `<#${channels[key]}>`
            }
            helpEmbed.addField(key, channels.toString().split(',').join('\n'));
          }
          else helpEmbed.addField(key, moduleObj[key].toString().split(',').join('\n'));
        }
      }
    }
  }
  await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
  db.close();
  message.channel.send({embeds:[helpEmbed]});
}

async function checkAction(message, requestedModule, action, color, args) {
  const guildID = message.guild.id;
  const db = await connectToDatabase();
  const guilds = db.db("chrysalis").collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  const modules = guild.modules;
  if (validModules.indexOf(requestedModule) == -1) {
    db.close();
    message.channel.send({embeds:[vmembed]});
    return;
  } else {
    const moduleObj = modules.find((c) => c.name == requestedModule);
    if (moduleObj==null) {
      moduleModel = defaultModules.find((c) => c.name == requestedModule);
      modules.push(moduleModel);
      await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
      db.close();
      return checkAction(message, requestedModule, action, color, args);
    }
    if (action == 'reset') {
      moduleModel = defaultModules.find((c) => c.name == requestedModule);
      for (var key in moduleObj) {
        if (moduleObj.hasOwnProperty(key)){
          delete moduleObj[key];
        }
      }
      for (key of Object.keys(moduleModel)) {
        moduleObj[key] = moduleModel[key]
      }
      await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
      db.close();
      message.channel.send(lang.module_reset);
      await reloadSlashCommands(message.client, message.guild, guild);
    } else {
      if (moduleObj[args[1]] == null) {
        db.close();
        return message.reply(lang.module_property_not_found)
      }
      for (key of Object.keys(moduleObj)) {
        if (args[1] == key) {
          switch (key) {
            case 'allowedChannels':
            case 'xpBlacklistChannels':
            if (args.length > 2) {
              args.shift();
              args.shift();
              await message.guild.channels.fetch();
              for (let key of Object.keys(args)) {
                if (args[key].startsWith('<#')) args[key] = args[key].substring(2,args[key].length-1);
                if (!message.guild.channels.cache.get(args[key])) {
                  db.close();
                  return message.reply(lang.invalid_channel);
                }
              }
              if (key == 'allowedChannels') moduleObj.allowedChannels = args;
              else if (key == 'xpBlacklistChannels') moduleObj.xpBlacklistChannels = args;
              await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
              db.close();
              message.channel.send(lang.module_updated);
              return sendHelp(message, requestedModule, color);
            } else {
              db.close();
              return message.reply(lang.please_specify_one_or_more_channels);
            }
            break;
            default:
            if (typeof moduleObj[key] == 'number') {
              if (isNaN(parseInt(args[2])) || parseInt(args[2]) >= Number.MAX_SAFE_INTEGER || parseInt(args[2]) < 0) {
                db.close();
                return message.reply(lang.please_type_a_valid_positive_integer);
              }
              moduleObj[key] = args[2];
              await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
              db.close();
              message.channel.send(lang.module_updated);
              return sendHelp(message, requestedModule, color);
            }
            if (typeof moduleObj[key] == 'boolean') {
              if (args.length > 1) {
                var keybool;
                switch (args[2]) {
                  case 'true':
                  keybool = true;
                  break;
                  case 'false':
                  keybool = false;
                  break;
                  default:
                  db.close();
                  return message.reply(lang.value_must_be_true_or_false)
                  break;
                }
                moduleObj[key] = keybool;
                await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
                db.close();
                message.channel.send(lang.module_updated);
                return sendHelp(message, requestedModule, color);
              } else {
                db.close();
                return message.reply(lang.please_specify_a_new_value);
              }
            } else {
              if (Array.isArray(moduleObj[key])) {
                args.shift();
                args.shift();
                moduleObj[key] = args;
                await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
                db.close();
                message.channel.send(lang.module_updated);
                return sendHelp(message, requestedModule, color);
              } else
              if (args.length > 2) {
                moduleObj[key] = args[2];
                switch (key) {
                  case 'announceLevelUpChannel':
                  case 'channel':
                    if (moduleObj[key].startsWith('<#')) {
                      moduleObj[key] = moduleObj[key].substring(2,moduleObj[key].length-1);
                    }
                    await message.guild.channels.fetch();
                    if (!message.guild.channels.cache.get(moduleObj[key])) {
                      db.close();
                      return message.reply(lang.please_type_a_valid_channel);
                    }
                    break;
                  case 'message':
                    args.shift();
                    args.shift();
                    moduleObj[key] = message.content.slice(message.content.indexOf('message')+8,message.length);
                    break;
                  case 'filter':
                    if (isNaN(parseInt(moduleObj[key]))) {
                      db.close();
                      return message.reply(lang.please_type_a_filter_id);
                    }
                    moduleObj[key] = parseInt(moduleObj[key]);
                    try {
                      await fetch(`https://manebooru.art/api/v1/json/filters/${moduleObj[key]}`)
                        .then(res => res.json())
                        .then(json => {
                          if (json.filter == null) {
                            db.close();
                            return message.reply(lang.filter_not_found);
                          }
                        });
                    } catch (e) {
                      db.close();
                      return message.reply(lang.filter_not_found);
                    }
                    break;
                }
                await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
                db.close();
                message.channel.send(lang.module_updated);
                return sendHelp(message, requestedModule, color);
              } else {
                db.close();
                return message.reply(lang.please_specify_a_new_value);
              }
            }
          }
        }
      }
    }
  }
}
