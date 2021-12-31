const MongoClient = require('mongodb').MongoClient;

module.exports = async () => {
  let db = new MongoClient(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  return db;
}
