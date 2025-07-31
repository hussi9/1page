# MongoDB Atlas Setup Guide for Smart Day Trips

## 🚀 Quick Setup (5 minutes)

### **1. Create MongoDB Atlas Account**
- Go to [mongodb.com/atlas](https://mongodb.com/atlas)
- Sign up for free account
- Create new project: "Smart Day Trips"

### **2. Create Database Cluster**
- Choose **FREE** M0 cluster
- Select region closest to users
- Cluster name: `smart-day-trips`

### **3. Database Configuration**
```javascript
Database Name: smarttrips
Collections:
├── destinations    // Main destination data
├── cities         // City information  
├── activities     // Activity reference data
├── reviews        // User reviews
└── analytics      // Cached analytics data
```

### **4. Create Database User**
- Database Access → Add New Database User
- Username: `smarttrips-api`
- Password: Generate secure password
- Role: `Read and write to any database`

### **5. Network Access**
- Network Access → Add IP Address
- For development: `0.0.0.0/0` (Allow from anywhere)
- For production: Add your server IPs

### **6. Get Connection String**
- Clusters → Connect → Connect your application
- Copy connection string
- Replace `<password>` with your user password

Example:
```
mongodb+srv://smarttrips-api:<password>@smart-day-trips.xyz123.mongodb.net/smarttrips?retryWrites=true&w=majority
```

## 📊 Database Schema

### **Collections Structure**

#### **destinations** Collection
```javascript
{
  _id: ObjectId,
  slug: "mumbai-lonavala",          // URL identifier
  name: "Lonavala",                 // Display name
  description: "Hill station...",   // Description
  
  // Location
  city: {
    name: "Mumbai",
    slug: "mumbai", 
    coordinates: [19.0760, 72.8777]
  },
  destination: {
    coordinates: [18.7537, 73.4068],
    address: "Lonavala, Maharashtra"
  },
  
  // Trip details
  distance: { value: 83, formatted: "83 km" },
  duration: { travel: 120, recommended: 480 },
  cost: { min: 1200, max: 2000, average: 1500 },
  
  // Classification  
  categories: ["hill_station", "nature"],
  activities: [{ name: "Trekking", category: "adventure" }],
  familyFriendly: true,
  crowdLevel: "medium",
  
  // AI & Analytics
  aiScore: 95,
  rating: { overall: 4.5, count: 1250 },
  
  // Metadata
  status: "active",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### **cities** Collection
```javascript
{
  _id: ObjectId,
  slug: "mumbai",
  name: "Mumbai",
  country: "India",
  coordinates: [19.0760, 72.8777],
  destinationCount: 25,
  featured: true,
  priority: 1
}
```

## 🔧 Backend API Setup

### **Option 1: Node.js Express API**
```bash
mkdir smarttrips-api
cd smarttrips-api
npm init -y
npm install express mongodb cors dotenv
```

**server.js:**
```javascript
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

// Get destinations by city
app.get('/api/destinations', async (req, res) => {
  const { city, category, maxCost } = req.query;
  
  const filter = {};
  if (city) filter['city.slug'] = city;
  if (category) filter.categories = category;
  if (maxCost) filter['cost.average'] = { $lte: parseInt(maxCost) };
  
  const destinations = await client
    .db('smarttrips')
    .collection('destinations')
    .find(filter)
    .sort({ aiScore: -1 })
    .limit(20)
    .toArray();
    
  res.json({ destinations });
});

app.listen(3000);
```

### **Option 2: Serverless Functions (Vercel)**
Create `/api/destinations.js`:
```javascript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
  const { city } = req.query;
  
  const destinations = await client
    .db('smarttrips')
    .collection('destinations')
    .find({ 'city.slug': city })
    .toArray();
    
  res.json({ destinations });
}
```

## 📈 Performance Optimization

### **Essential Indexes**
```javascript
// In MongoDB Compass or Shell
db.destinations.createIndex({ "city.slug": 1 });
db.destinations.createIndex({ "categories": 1 });
db.destinations.createIndex({ "cost.average": 1 });
db.destinations.createIndex({ "aiScore": -1 });
db.destinations.createIndex({ "rating.overall": -1 });

// Compound indexes for complex queries
db.destinations.createIndex({ 
  "city.slug": 1, 
  "categories": 1, 
  "cost.average": 1 
});

// Geospatial index for location queries
db.destinations.createIndex({ "destination.coordinates": "2dsphere" });
```

### **Caching Strategy**
```javascript
// Redis for hot data
const redis = require('redis');
const client = redis.createClient();

// Cache popular city data for 1 hour
app.get('/api/destinations', async (req, res) => {
  const cacheKey = `destinations:${req.query.city}`;
  
  // Try cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // Fetch from MongoDB
  const data = await fetchFromMongoDB(req.query);
  
  // Cache for 1 hour
  await client.setex(cacheKey, 3600, JSON.stringify(data));
  
  res.json(data);
});
```

## 🌍 Scaling Strategy

### **Global Distribution**
```javascript
// Shard by region for global scale
sh.shardCollection("smarttrips.destinations", { 
  "city.country": 1, 
  "_id": 1 
});

// Regional clusters
- Asia-Pacific: Mumbai, Delhi, Bangkok, Singapore
- Europe: London, Paris, Rome, Berlin  
- Americas: New York, San Francisco, Mexico City
- Africa: Cairo, Cape Town, Lagos
```

### **Data Volume Estimates**
```
Global Cities: ~10,000
Destinations per City: ~100 average
Total Destinations: ~1,000,000
Storage per Destination: ~5KB
Total Storage: ~5GB

Monthly API Calls: ~10M
Peak RPS: ~100
MongoDB Atlas M10: $57/month (handles this easily)
```

## 🔒 Security & Production

### **Environment Variables**
```bash
# .env file
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smarttrips
JWT_SECRET=your-secret-key
API_RATE_LIMIT=100
```

### **Security Best Practices**
- Enable MongoDB authentication
- Use connection string secrets
- Implement API rate limiting
- Add request validation
- Enable CORS for specific domains only
- Use HTTPS in production

## 💰 Cost Optimization

### **MongoDB Atlas Pricing**
```
Development: M0 (FREE) - 512MB storage
Production: M10 ($57/month) - 10GB storage, handles 100+ RPS
Scale up: M20 ($120/month) - 20GB storage, 1000+ RPS
```

### **Data Lifecycle**
```javascript
// Auto-delete old analytics data
db.analytics.createIndex(
  { "createdAt": 1 }, 
  { expireAfterSeconds: 2592000 } // 30 days
);

// Archive old reviews
db.reviews.createIndex(
  { "createdAt": 1 },
  { expireAfterSeconds: 31536000 } // 1 year  
);
```

## 🚀 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user configured
- [ ] Network access set up
- [ ] Collections created with indexes
- [ ] Sample data seeded
- [ ] API endpoints tested
- [ ] Caching implemented
- [ ] Security measures in place
- [ ] Monitoring set up
- [ ] Backup strategy defined

## 📞 Support

- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Node.js Driver**: [mongodb.github.io/node-mongodb-native](https://mongodb.github.io/node-mongodb-native)
- **Performance Best Practices**: [docs.mongodb.com/manual/administration/performance](https://docs.mongodb.com/manual/administration/performance)

---

**Ready to scale globally! 🌍**