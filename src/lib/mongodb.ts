import { MongoClient, Db, Collection } from 'mongodb'

let client: MongoClient

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'nullbin'

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient>
}

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI, {
    // Connection timeout options
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 30000,
    // Connection pool options
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    // Retry options
    retryWrites: true,
    retryReads: true
  })
  global._mongoClientPromise = client.connect()
}

const clientPromise = global._mongoClientPromise

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const client = await clientPromise
  const db = client.db(MONGODB_DB)
  
  return { client, db }
}

export async function getPastesCollection(): Promise<Collection> {
  const { db } = await connectToDatabase()
  return db.collection('pastes')
}

// Initialize database indexes and cleanup job
export async function initializeDatabase() {
  try {
    const collection = await getPastesCollection()
    
    // Create indexes for better performance
    await collection.createIndex({ id: 1 }, { unique: true })
    await collection.createIndex({ createdAt: 1 })
    await collection.createIndex({ expiresAt: 1 })    // Create a TTL index to automatically delete expired documents
    // Only documents with expiresAt field will be automatically deleted
    try {
      await collection.createIndex(
        { expiresAt: 1 },
        { 
          expireAfterSeconds: 0,
          name: "ttl_expiresAt"
        }
      )
    } catch (error) {
      // Index might already exist, which is fine
      console.log('TTL index creation note:', (error as Error).message)
    }
    
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}
