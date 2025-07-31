// MongoDB Atlas Setup Script
// Use this to set up your database with the provided API keys

const { MongoClient } = require('mongodb');

// Your MongoDB Atlas configuration
const CONFIG = {
  // API Keys (these are for MongoDB Data API, not connection string)
  PUBLIC_KEY: 'ryhwplnl',
  PRIVATE_KEY: 'fec4a8b8-f3ba-4722-b7e6-ee8fbbc82486',
  
  // You'll need to create these in your MongoDB Atlas dashboard:
  CLUSTER_NAME: 'Cluster0', // Default cluster name
  DATABASE_NAME: 'onepage_ecosystem',
  
  // MongoDB Data API endpoint (replace with your cluster's endpoint)
  DATA_API_URL: 'https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1',
  
  // Connection string (you'll get this from Atlas dashboard)
  // Replace <password> with your database user password
  CONNECTION_STRING: 'mongodb+srv://onepage-user:<password>@cluster0.xxxxx.mongodb.net/onepage_ecosystem?retryWrites=true&w=majority'
};

// Collections to create
const COLLECTIONS = [
  'users',
  'projects',
  'destinations', 
  'weather_data',
  'calculations',
  'todos',
  'user_sessions',
  'location_intelligence'
];

// Indexes to create for performance
const INDEXES = {
  destinations: [
    { key: { "location.coordinates": "2dsphere" }, name: "location_2dsphere" },
    { key: { "location.city.slug": 1 }, name: "city_slug" },
    { key: { "details.categories": 1 }, name: "categories" },
    { key: { "ai.score": -1 }, name: "ai_score_desc" }
  ],
  users: [
    { key: { "email": 1 }, name: "email_unique", unique: true },
    { key: { "location.current.coordinates": "2dsphere" }, name: "user_location_2dsphere" }
  ],
  weather_data: [
    { key: { "location.coordinates": "2dsphere" }, name: "weather_location_2dsphere" },
    { key: { "expiresAt": 1 }, name: "ttl_expiry", expireAfterSeconds: 0 }
  ],
  calculations: [
    { key: { "userId": 1 }, name: "user_calculations" },
    { key: { "context.location": "2dsphere" }, name: "calc_location_2dsphere" },
    { key: { "timestamp": -1 }, name: "calc_timestamp_desc" }
  ],
  todos: [
    { key: { "userId": 1 }, name: "user_todos" },
    { key: { "todo.location.coordinates": "2dsphere" }, name: "todo_location_2dsphere" },
    { key: { "todo.status": 1 }, name: "todo_status" }
  ]
};

// Sample data to seed the database
const SAMPLE_DATA = {
  projects: [
    {
      slug: 'day-trips',
      name: 'Smart Day Trips',
      description: 'AI-powered travel discovery platform',
      category: 'travel',
      status: 'active',
      locationRelevant: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      slug: 'calculator',
      name: 'Smart Calculator', 
      description: 'Location-aware calculator with intelligent suggestions',
      category: 'utility',
      status: 'active',
      locationRelevant: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  destinations: [
    {
      slug: 'mumbai-lonavala',
      name: 'Lonavala',
      description: 'Scenic hill station with waterfalls and caves',
      location: {
        coordinates: [18.7537, 73.4068],
        city: {
          name: 'Mumbai',
          slug: 'mumbai',
          coordinates: [19.0760, 72.8777],
          country: 'India'
        },
        address: 'Lonavala, Maharashtra, India'
      },
      details: {
        cost: { min: 1200, max: 2000, average: 1500, currency: 'INR' },
        duration: { travel: 120, recommended: 480 },
        activities: [
          { name: 'Trekking', category: 'adventure', duration: 180 },
          { name: 'Waterfall Visit', category: 'nature', duration: 120 }
        ],
        categories: ['hill_station', 'nature', 'adventure'],
        familyFriendly: true,
        crowdLevel: 'medium',
        bestSeason: 'monsoon'
      },
      ai: {
        score: 95,
        popularity: 8.5,
        trending: true,
        tags: ['waterfalls', 'caves', 'weekend', 'monsoon']
      },
      social: {
        rating: { overall: 4.5, count: 1250 }
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

// Setup functions
async function setupDatabase() {
  console.log('🚀 Setting up MongoDB database...');
  
  try {
    // Method 1: Using MongoDB Node.js Driver (if you have connection string)
    if (CONFIG.CONNECTION_STRING.includes('<password>')) {
      console.log('❌ Please update the connection string with your database password');
      console.log('Go to MongoDB Atlas → Database → Connect → Connect your application');
      return;
    }
    
    const client = new MongoClient(CONFIG.CONNECTION_STRING);
    await client.connect();
    
    const db = client.db(CONFIG.DATABASE_NAME);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Create collections
    for (const collectionName of COLLECTIONS) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`ℹ️  Collection ${collectionName} already exists`);
        } else {
          console.error(`❌ Error creating ${collectionName}:`, error.message);
        }
      }
    }
    
    // Create indexes
    for (const [collectionName, indexes] of Object.entries(INDEXES)) {
      const collection = db.collection(collectionName);
      
      for (const indexSpec of indexes) {
        try {
          await collection.createIndex(indexSpec.key, {
            name: indexSpec.name,
            unique: indexSpec.unique || false,
            expireAfterSeconds: indexSpec.expireAfterSeconds
          });
          console.log(`✅ Created index ${indexSpec.name} on ${collectionName}`);
        } catch (error) {
          console.error(`❌ Error creating index ${indexSpec.name}:`, error.message);
        }
      }
    }
    
    // Insert sample data
    for (const [collectionName, data] of Object.entries(SAMPLE_DATA)) {
      const collection = db.collection(collectionName);
      
      try {
        const result = await collection.insertMany(data);
        console.log(`✅ Inserted ${result.insertedCount} documents into ${collectionName}`);
      } catch (error) {
        console.error(`❌ Error inserting data into ${collectionName}:`, error.message);
      }
    }
    
    await client.close();
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

// Method 2: Using MongoDB Data API (if connection string doesn't work)
async function setupUsingDataAPI() {
  console.log('🚀 Setting up using MongoDB Data API...');
  
  const headers = {
    'Content-Type': 'application/json',
    'api-key': CONFIG.PRIVATE_KEY // Use private key for Data API
  };
  
  // Insert sample destinations
  try {
    const response = await fetch(`${CONFIG.DATA_API_URL}/action/insertMany`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        collection: 'destinations',
        database: CONFIG.DATABASE_NAME,
        dataSource: CONFIG.CLUSTER_NAME,
        documents: SAMPLE_DATA.destinations
      })
    });
    
    const result = await response.json();
    if (result.insertedIds) {
      console.log(`✅ Inserted ${result.insertedIds.length} destinations via Data API`);
    } else {
      console.error('❌ Data API insertion failed:', result);
    }
  } catch (error) {
    console.error('❌ Data API setup failed:', error);
  }
}

// Export for use in other files
module.exports = {
  CONFIG,
  COLLECTIONS,
  INDEXES,
  SAMPLE_DATA,
  setupDatabase,
  setupUsingDataAPI
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}