import { MongoClient, Db, Collection } from 'mongodb'

let client: MongoClient

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'nullbin'

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient>
}

if (!global._mongoClientPromise) {
  // Check if MongoDB URI is set and log part of it for debugging (hiding credentials)
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in environment variables');
    throw new Error('MONGODB_URI is not configured');
  } else {
    try {
      const uriParts = MONGODB_URI.split('@');
      const redactedUri = uriParts.length > 1 
        ? `mongodb://*****@${uriParts[1]}` 
        : 'mongodb://localhost:*****';
      console.log(`Initializing MongoDB with URI pattern: ${redactedUri}`);    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _
    ) {
      console.log('Could not parse MongoDB URI for logging');
    }
  }
  
  try {
    console.log('Creating new MongoDB client...');
    client = new MongoClient(MONGODB_URI, {
      // Connection timeout options - increased for potential network issues
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 40000,
      socketTimeoutMS: 60000, // Added socket timeout
      // Connection pool options
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      // Retry options - increased for reliability
      retryWrites: true,
      retryReads: true,
      maxConnecting: 3 // Limit concurrent connection attempts
    });
    
    console.log('Attempting to connect to MongoDB...');
    global._mongoClientPromise = client.connect()
      .then(client => {
        console.log('MongoDB connection established successfully');
        return client;
      })
      .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        console.error('MongoDB connection error details:', {
          name: err.name,
          message: err.message,
          code: err.code,
          stack: err.stack
        });
        throw err;
      });
  } catch (error) {
    console.error('Error initializing MongoDB client:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

const clientPromise = global._mongoClientPromise

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    console.log('Connecting to MongoDB...');
    const client = await clientPromise
    const db = client.db(MONGODB_DB)
    console.log('MongoDB connection successful');
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB in connectToDatabase:', error);
    throw error;
  }
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
