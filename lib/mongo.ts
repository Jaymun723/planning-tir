import { MongoClient, Db } from "mongodb"

const uri = process.env.MONGODB_URI!
const dbName = process.env.MONGODB_DB!

let cachedClient: undefined | MongoClient
let cachedDb: undefined | Db

export const connectToDb = async () => {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  const db = client.db(dbName)

  cachedClient = client
  cachedDb = db

  return { client, db }
}
