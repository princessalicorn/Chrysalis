module.exports = async (message, args) => {
  let query = '';
  if (args.length>0) query = message.author ? args.join(' ') : args[0];
  while (query.includes(' ,')) query = query.replace(' ,',',');
  while (query.includes(', ')) query = query.replace(', ',',');
  while (query.includes(',,')) query = query.replace(',,',',');
  if (query.startsWith(',')) query = query.substring(1,query.length);
  if (query.endsWith(',')) query = query.substring(0,query.length-1);
  return query;
}
