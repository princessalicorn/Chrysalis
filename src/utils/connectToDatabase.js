const MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;

module.exports = async () => {
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  return db;
}
