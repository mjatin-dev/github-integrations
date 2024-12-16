import { MongoClient } from "mongodb";

export const getDatabaseClient = () => {
  const client = new MongoClient(process.env.MONGO_URI);
  const db = client.db(process.env.DB_NAME);
  return { client, db };
};
