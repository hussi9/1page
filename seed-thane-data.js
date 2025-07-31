// MongoDB Data Seeding Script for Thane
// Run this to populate MongoDB with real Thane destinations

const thaneDestinations = [
  {
    slug: "thane-upvan-lake",
    name: "Upvan Lake", 
    description: "Peaceful artificial lake perfect for morning walks, boating, and sunset views in the heart of Thane",
    
    location: {
      type: "Point",
      coordinates: [72.9781, 19.2183], // [lng, lat] - MongoDB format
      city: {
        name: "Thane",
        slug: "thane", 
        coordinates: [72.9781, 19.2183],
        country: "India",
        state: "Maharashtra"
      },
      address: "Upvan, Thane West, Maharashtra 400606"
    },
    
    details: {
      cost: { min: 0, max: 200, average: 100, currency: "INR" },
      duration: { travel: 15, recommended: 180 }, // 15 min travel, 3 hours recommended
      activities: [
        { name: "Boating", category: "recreation", duration: 60 },
        { name: "Walking Track", category: "fitness", duration: 90 }, 
        { name: "Photography", category: "hobby", duration: 120 }
      ],
      categories: ["nature", "recreation", "fitness"],
      familyFriendly: true,
      crowdLevel: "medium",
      bestSeason: "all_year",
      bestTime: { arrival: "06:00", departure: "21:00" }
    },
    
    ai: {
      score: 88,
      popularity: 8.5,
      trending: true,
      tags: ["lake", "walking", "boating", "sunset", "family", "thane"]
    },
    
    social: {
      rating: { overall: 4.3, count: 2400 }
    },
    
    images: [{
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      caption: "Upvan Lake peaceful waters",
      credit: "Unsplash"
    }],
    
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  {
    slug: "thane-yeoor-hills",
    name: "Yeoor Hills",
    description: "Scenic hills offering panoramic views, trekking trails, and rich biodiversity in Thane's green belt",
    
    location: {
      type: "Point", 
      coordinates: [72.9547, 19.2647],
      city: {
        name: "Thane",
        slug: "thane",
        coordinates: [72.9781, 19.2183], 
        country: "India",
        state: "Maharashtra"
      },
      address: "Yeoor Hills, Thane, Maharashtra 400606"
    },
    
    details: {
      cost: { min: 100, max: 300, average: 200, currency: "INR" },
      duration: { travel: 25, recommended: 300 },
      activities: [
        { name: "Trekking", category: "adventure", duration: 180 },
        { name: "Bird Watching", category: "nature", duration: 120 },
        { name: "Photography", category: "hobby", duration: 150 }
      ],
      categories: ["adventure", "nature", "trekking"],
      familyFriendly: true,
      crowdLevel: "low", 
      bestSeason: "winter",
      bestTime: { arrival: "06:00", departure: "18:00" }
    },
    
    ai: {
      score: 92,
      popularity: 7.8,
      trending: false,
      tags: ["hills", "trekking", "nature", "views", "birds", "peaceful"]
    },
    
    social: {
      rating: { overall: 4.6, count: 1100 }
    },
    
    images: [{
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
      caption: "Yeoor Hills scenic trails",
      credit: "Unsplash"
    }],
    
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  {
    slug: "thane-kelva-beach", 
    name: "Kelva Beach",
    description: "Pristine beach destination with coconut palms, water sports, and fresh seafood near Thane",
    
    location: {
      type: "Point",
      coordinates: [72.7142, 19.6086],
      city: {
        name: "Thane", 
        slug: "thane",
        coordinates: [72.9781, 19.2183],
        country: "India",
        state: "Maharashtra"
      },
      address: "Kelva Beach, Palghar, Maharashtra 401404"
    },
    
    details: {
      cost: { min: 500, max: 1200, average: 800, currency: "INR" },
      duration: { travel: 90, recommended: 480 },
      activities: [
        { name: "Beach Activities", category: "recreation", duration: 240 },
        { name: "Water Sports", category: "adventure", duration: 120 },
        { name: "Seafood Dining", category: "culinary", duration: 90 }
      ],
      categories: ["beach", "recreation", "adventure"],
      familyFriendly: true,
      crowdLevel: "medium",
      bestSeason: "winter", 
      bestTime: { arrival: "08:00", departure: "20:00" }
    },
    
    ai: {
      score: 85,
      popularity: 8.2,
      trending: true,
      tags: ["beach", "water sports", "seafood", "coconut", "weekend"]
    },
    
    social: {
      rating: { overall: 4.1, count: 1850 }
    },
    
    images: [{
      url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop",
      caption: "Kelva Beach pristine coastline",
      credit: "Unsplash"
    }],
    
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  {
    slug: "thane-sgnp-kanheri-caves",
    name: "Sanjay Gandhi National Park & Kanheri Caves",
    description: "Ancient Buddhist caves within a national park, offering wildlife safaris and historical exploration",
    
    location: {
      type: "Point",
      coordinates: [72.9044, 19.2090],
      city: {
        name: "Thane",
        slug: "thane", 
        coordinates: [72.9781, 19.2183],
        country: "India",
        state: "Maharashtra"
      },
      address: "Sanjay Gandhi National Park, Borivali East, Mumbai 400066"
    },
    
    details: {
      cost: { min: 50, max: 200, average: 100, currency: "INR" },
      duration: { travel: 35, recommended: 360 },
      activities: [
        { name: "Cave Exploration", category: "heritage", duration: 120 },
        { name: "Wildlife Safari", category: "nature", duration: 90 },
        { name: "Nature Photography", category: "hobby", duration: 150 }
      ],
      categories: ["heritage", "nature", "wildlife"],
      familyFriendly: true,
      crowdLevel: "high",
      bestSeason: "winter",
      bestTime: { arrival: "07:00", departure: "17:00" }
    },
    
    ai: {
      score: 94,
      popularity: 9.1,
      trending: false,
      tags: ["caves", "buddhist", "wildlife", "safari", "history", "national park"]
    },
    
    social: {
      rating: { overall: 4.5, count: 3200 }
    },
    
    images: [{
      url: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&h=600&fit=crop",
      caption: "Kanheri Caves ancient architecture",
      credit: "Unsplash"
    }],
    
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  {
    slug: "thane-flamingo-sanctuary",
    name: "Thane Creek Flamingo Sanctuary",
    description: "Unique mangrove sanctuary offering flamingo spotting, bird watching, and eco-tourism experiences",
    
    location: {
      type: "Point",
      coordinates: [72.9060, 19.1176],
      city: {
        name: "Thane",
        slug: "thane",
        coordinates: [72.9781, 19.2183],
        country: "India", 
        state: "Maharashtra"
      },
      address: "Thane Creek, Airoli, Navi Mumbai 400708"
    },
    
    details: {
      cost: { min: 100, max: 300, average: 150, currency: "INR" },
      duration: { travel: 40, recommended: 240 },
      activities: [
        { name: "Bird Watching", category: "nature", duration: 150 },
        { name: "Photography", category: "hobby", duration: 120 }, 
        { name: "Eco Tour", category: "education", duration: 90 }
      ],
      categories: ["nature", "wildlife", "eco-tourism"],
      familyFriendly: true,
      crowdLevel: "low",
      bestSeason: "winter",
      bestTime: { arrival: "06:00", departure: "18:00" }
    },
    
    ai: {
      score: 89,
      popularity: 6.5,
      trending: true,
      tags: ["flamingo", "birds", "mangrove", "sanctuary", "eco", "photography"]
    },
    
    social: {
      rating: { overall: 4.4, count: 850 }
    },
    
    images: [{
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
      caption: "Flamingo sanctuary mangrove ecosystem",
      credit: "Unsplash"
    }],
    
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  {
    slug: "thane-bhimashankar-temple",
    name: "Bhimashankar Temple & Wildlife Sanctuary",
    description: "Sacred Jyotirlinga temple nestled in a wildlife sanctuary, offering spiritual and nature experiences",
    
    location: {
      type: "Point",
      coordinates: [73.5333, 19.0736],
      city: {
        name: "Thane",
        slug: "thane",
        coordinates: [72.9781, 19.2183],
        country: "India",
        state: "Maharashtra"
      },
      address: "Bhimashankar, Khed, Maharashtra 410406"
    },
    
    details: {
      cost: { min: 800, max: 1500, average: 1200, currency: "INR" },
      duration: { travel: 150, recommended: 480 },
      activities: [
        { name: "Temple Visit", category: "spiritual", duration: 90 },
        { name: "Trekking", category: "adventure", duration: 180 },
        { name: "Wildlife Spotting", category: "nature", duration: 120 }
      ],
      categories: ["heritage", "spiritual", "nature"],
      familyFriendly: true,
      crowdLevel: "medium",
      bestSeason: "winter",
      bestTime: { arrival: "06:00", departure: "20:00" }
    },
    
    ai: {
      score: 91,
      popularity: 7.9,
      trending: false,
      tags: ["temple", "jyotirlinga", "wildlife", "sanctuary", "spiritual", "trekking"]
    },
    
    social: {
      rating: { overall: 4.7, count: 2100 }
    },
    
    images: [{
      url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop",
      caption: "Bhimashankar temple architecture",
      credit: "Unsplash"
    }],
    
    status: "active", 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// MongoDB Seeding Function
async function seedThaneDestinations() {
  console.log('🌱 Seeding Thane destinations to MongoDB...');
  
  const API_CONFIG = {
    dataApiUrl: 'https://data.mongodb-api.com/app/data-ryhwplnl/endpoint/data/v1',
    apiKey: 'fec4a8b8-f3ba-4722-b7e6-ee8fbbc82486',
    dataSource: 'Cluster0',
    database: 'onepage_ecosystem'
  };
  
  try {
    // Insert destinations
    const response = await fetch(`${API_CONFIG.dataApiUrl}/action/insertMany`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_CONFIG.apiKey
      },
      body: JSON.stringify({
        collection: 'destinations',
        database: API_CONFIG.database,
        dataSource: API_CONFIG.dataSource,
        documents: thaneDestinations
      })
    });
    
    const result = await response.json();
    
    if (result.insertedIds) {
      console.log(`✅ Successfully seeded ${result.insertedIds.length} Thane destinations`);
      console.log('Destinations seeded:', thaneDestinations.map(d => d.name));
      return result.insertedIds;
    } else {
      console.error('❌ Failed to seed destinations:', result);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    return null;
  }
}

// Test function to verify seeded data
async function testThaneData() {
  console.log('🧪 Testing Thane data retrieval...');
  
  const API_CONFIG = {
    dataApiUrl: 'https://data.mongodb-api.com/app/data-ryhwplnl/endpoint/data/v1',
    apiKey: 'fec4a8b8-f3ba-4722-b7e6-ee8fbbc82486',
    dataSource: 'Cluster0',
    database: 'onepage_ecosystem'
  };
  
  try {
    const response = await fetch(`${API_CONFIG.dataApiUrl}/action/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_CONFIG.apiKey
      },
      body: JSON.stringify({
        collection: 'destinations',
        database: API_CONFIG.database,
        dataSource: API_CONFIG.dataSource,
        filter: { "location.city.slug": "thane" },
        sort: { "ai.score": -1 }
      })
    });
    
    const result = await response.json();
    
    if (result.documents) {
      console.log(`✅ Found ${result.documents.length} Thane destinations in MongoDB`);
      result.documents.forEach(dest => {
        console.log(`  - ${dest.name} (Score: ${dest.ai.score})`);
      });
      return result.documents;
    } else {
      console.error('❌ No Thane destinations found');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    return [];
  }
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    thaneDestinations,
    seedThaneDestinations,
    testThaneData
  };
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.ThaneSeeder = {
    thaneDestinations,
    seedThaneDestinations,
    testThaneData
  };
  
  console.log('🚀 Thane seeder ready! Use ThaneSeeder.seedThaneDestinations() to populate MongoDB');
}