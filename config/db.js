const { MongoClient } = require('mongodb')
require('dotenv').config()

let db

const connectDB = async () => {
  if (db) return db // reuse existing connection

  try {
    const client = new MongoClient(process.env.MONGO_URI)
    await client.connect()
    console.log('MongoDB connected')

    db = client.db('id-mask')
    return db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

module.exports = {
  connectDB,
  getDB: () => db,
}