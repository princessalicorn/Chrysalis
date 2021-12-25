module.exports = async (message, command, args, prefix) => {
  var query = '';
  if (args.length>0) {
    if (message.author) query = message.content.slice(prefix.length+command.length+1);
    else query = args[0];
  }
  while (query.includes(',,')) query = query.replace(',,',',');
  if (query.startsWith(',')) query = query.substring(1,query.length);
  if (query.endsWith(',')) query = query.substring(0,query.length-1);
  return query;
}
