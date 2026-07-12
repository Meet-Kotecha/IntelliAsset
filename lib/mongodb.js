import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL;
console.log('🔍 MONGO_URL from env:', uri);  

const dbName = process.env.DB_NAME || 'intelliasset';
console.log('🔍 DB_NAME from env:', dbName);   

let cachedClient = global._mongoClient;
let cachedDb = global._mongoDb;

export async function getDb() {
  if (cachedDb) return cachedDb;
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
    global._mongoClient = cachedClient;
  }
  cachedDb = cachedClient.db(dbName);
  global._mongoDb = cachedDb;
  return cachedDb;
}
