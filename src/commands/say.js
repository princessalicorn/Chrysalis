module.exports = {
  name: 'say',
  alias: ['text'],
  run: async (client, message, command, args, lang, guildInfo) => {

    return message.author ? message.channel.send(args.join(' ') || '_ _') : message.editReply(args[0]);

  }
}
