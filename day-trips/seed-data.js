// MongoDB Data Seeding Script
// Run this to populate your MongoDB Atlas database with initial destination data

const sampleDestinations = [
  // MUMBAI DESTINATIONS
  {
    slug: "mumbai-lonavala",
    name: "Lonavala",
    description: "Scenic hill station famous for its caves, waterfalls, and lush green landscapes",
    city: {
      name: "Mumbai",
      slug: "mumbai",
      country: "India",
      coordinates: [19.0760, 72.8777]
    },
    destination: {
      coordinates: [18.7537, 73.4068],
      address: "Lonavala, Maharashtra, India"
    },
    distance: {
      value: 83,
      unit: "km",
      formatted: "83 km"
    },
    duration: {
      travel: 120,
      recommended: 480,
      formatted: "2 hours travel"
    },
    cost: {
      min: 1200,
      max: 2000,
      average: 1500,
      currency: "INR",
      breakdown: {
        transport: 600,
        food: 400,
        activities: 500
      }
    },
    activities: [
      { name: "Trekking", category: "adventure", difficulty: "moderate", duration: 180 },
      { name: "Waterfall Visit", category: "nature", difficulty: "easy", duration: 120 },
      { name: "Cave Exploration", category: "adventure", difficulty: "easy", duration: 90 }
    ],
    categories: ["hill_station", "nature", "adventure"],
    tags: ["waterfalls", "caves", "monsoon", "weekend"],
    familyFriendly: true,
    accessibility: "moderate",
    crowdLevel: "medium",
    bestSeason: "monsoon",
    seasonalData: {
      summer: { score: 6, note: "Hot weather" },
      monsoon: { score: 10, note: "Best time - lush green" },
      winter: { score: 8, note: "Pleasant weather" }
    },
    bestTime: {
      arrival: "06:00",
      departure: "19:00",
      recommended: "Full day trip"
    },
    aiScore: 95,
    popularity: 8.5,
    trending: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        caption: "Bhushi Dam waterfall",
        credit: "Unsplash"
      }
    ],
    rating: {
      overall: 4.5,
      count: 1250,
      breakdown: {
        scenery: 4.8,
        accessibility: 4.2,
        value: 4.3,
        safety: 4.6
      }
    },
    facilities: ["parking", "restaurants", "restrooms", "first_aid"],
    tips: [
      "Carry raincoat during monsoon",
      "Start early to avoid crowds",
      "Book train tickets in advance"
    ],
    bookingRequired: false,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  {
    slug: "mumbai-alibaug",
    name: "Alibaug",
    description: "Coastal town with pristine beaches, historic forts, and water sports",
    city: {
      name: "Mumbai",
      slug: "mumbai",
      country: "India",
      coordinates: [19.0760, 72.8777]
    },
    destination: {
      coordinates: [18.6414, 72.8722],
      address: "Alibaug, Maharashtra, India"
    },
    distance: {
      value: 95,
      unit: "km", 
      formatted: "95 km"
    },
    duration: {
      travel: 150,
      recommended: 600,
      formatted: "2.5 hours travel"
    },
    cost: {
      min: 1800,
      max: 2500,
      average: 2000,
      currency: "INR",
      breakdown: {
        transport: 800,
        food: 600,
        activities: 600
      }
    },
    activities: [
      { name: "Beach Activities", category: "beach", difficulty: "easy", duration: 240 },
      { name: "Water Sports", category: "adventure", difficulty: "moderate", duration: 120 },
      { name: "Fort Visit", category: "heritage", difficulty: "easy", duration: 90 }
    ],
    categories: ["beach", "heritage", "adventure"],
    tags: ["beach", "forts", "water_sports", "weekend"],
    familyFriendly: true,
    accessibility: "easy",
    crowdLevel: "high",
    bestSeason: "winter",
    seasonalData: {
      summer: { score: 7, note: "Good for water activities" },
      monsoon: { score: 5, note: "Rough seas" },
      winter: { score: 10, note: "Perfect weather" }
    },
    bestTime: {
      arrival: "08:00",
      departure: "19:00",
      recommended: "Full day trip"
    },
    aiScore: 88,
    popularity: 9.2,
    trending: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
        caption: "Alibaug beach at sunset",
        credit: "Unsplash"
      }
    ],
    rating: {
      overall: 4.3,
      count: 890,
      breakdown: {
        scenery: 4.7,
        accessibility: 4.1,
        value: 4.0,
        safety: 4.4
      }
    },
    facilities: ["parking", "restaurants", "restrooms", "water_sports"],
    tips: [
      "Check ferry timings",
      "Carry sunscreen and hats",
      "Book water sports in advance"
    ],
    bookingRequired: false,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // DELHI DESTINATIONS
  {
    slug: "delhi-agra",
    name: "Agra",
    description: "Historic city home to the iconic Taj Mahal and Mughal architecture",
    city: {
      name: "Delhi",
      slug: "delhi",
      country: "India",
      coordinates: [28.6139, 77.2090]
    },
    destination: {
      coordinates: [27.1767, 78.0081],
      address: "Agra, Uttar Pradesh, India"
    },
    distance: {
      value: 200,
      unit: "km",
      formatted: "200 km"
    },
    duration: {
      travel: 180,
      recommended: 540,
      formatted: "3 hours travel"
    },
    cost: {
      min: 2000,
      max: 3500,
      average: 2500,
      currency: "INR",
      breakdown: {
        transport: 1000,
        food: 600,
        activities: 900
      }
    },
    activities: [
      { name: "Taj Mahal Visit", category: "heritage", difficulty: "easy", duration: 180 },
      { name: "Agra Fort", category: "heritage", difficulty: "easy", duration: 120 },
      { name: "Local Shopping", category: "cultural", difficulty: "easy", duration: 90 }
    ],
    categories: ["heritage", "cultural", "unesco"],
    tags: ["taj_mahal", "monuments", "photography", "heritage"],
    familyFriendly: true,
    accessibility: "easy",
    crowdLevel: "very_high",
    bestSeason: "winter",
    seasonalData: {
      summer: { score: 4, note: "Very hot" },
      monsoon: { score: 6, note: "Humid conditions" },
      winter: { score: 10, note: "Perfect weather" }
    },
    bestTime: {
      arrival: "06:00",
      departure: "18:00",
      recommended: "Sunrise visit recommended"
    },
    aiScore: 98,
    popularity: 9.8,
    trending: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800",
        caption: "Taj Mahal at sunrise",
        credit: "Unsplash"
      }
    ],
    rating: {
      overall: 4.8,
      count: 5420,
      breakdown: {
        scenery: 5.0,
        accessibility: 4.3,
        value: 4.5,
        safety: 4.8
      }
    },
    facilities: ["parking", "restaurants", "restrooms", "guides", "security"],
    tips: [
      "Book tickets online to skip queues",
      "Visit during sunrise for best photos",
      "Carry water and wear comfortable shoes"
    ],
    bookingRequired: true,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // BANGALORE DESTINATIONS
  {
    slug: "bangalore-mysore",
    name: "Mysore",
    description: "Royal city famous for its magnificent palace, gardens, and silk",
    city: {
      name: "Bangalore",
      slug: "bangalore",
      country: "India",
      coordinates: [12.9716, 77.5946]
    },
    destination: {
      coordinates: [12.2958, 76.6394],
      address: "Mysore, Karnataka, India"
    },
    distance: {
      value: 150,
      unit: "km",
      formatted: "150 km"
    },
    duration: {
      travel: 180,
      recommended: 480,
      formatted: "3 hours travel"
    },
    cost: {
      min: 1500,
      max: 2500,
      average: 2000,
      currency: "INR",
      breakdown: {
        transport: 800,
        food: 500,
        activities: 700
      }
    },
    activities: [
      { name: "Palace Visit", category: "heritage", difficulty: "easy", duration: 120 },
      { name: "Gardens Tour", category: "nature", difficulty: "easy", duration: 90 },
      { name: "Silk Shopping", category: "cultural", difficulty: "easy", duration: 120 }
    ],
    categories: ["heritage", "cultural", "royal"],
    tags: ["palace", "gardens", "silk", "heritage"],
    familyFriendly: true,
    accessibility: "easy",
    crowdLevel: "medium",
    bestSeason: "winter",
    seasonalData: {
      summer: { score: 6, note: "Warm weather" },
      monsoon: { score: 8, note: "Lush gardens" },
      winter: { score: 10, note: "Perfect weather" }
    },
    bestTime: {
      arrival: "09:00",
      departure: "18:00",
      recommended: "Full day trip"
    },
    aiScore: 90,
    popularity: 8.1,
    trending: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
        caption: "Mysore Palace illuminated",
        credit: "Unsplash"
      }
    ],
    rating: {
      overall: 4.4,
      count: 2180,
      breakdown: {
        scenery: 4.6,
        accessibility: 4.5,
        value: 4.2,
        safety: 4.7
      }
    },
    facilities: ["parking", "restaurants", "restrooms", "guides", "shopping"],
    tips: [
      "Visit palace during evening illumination",
      "Try local Mysore pak sweet",
      "Bargain while shopping for silk"
    ],
    bookingRequired: false,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Cities data
const sampleCities = [
  {
    slug: "mumbai",
    name: "Mumbai",
    alternateNames: ["Bombay"],
    country: "India",
    state: "Maharashtra",
    coordinates: [19.0760, 72.8777],
    timezone: "Asia/Kolkata",
    population: 20400000,
    destinationCount: 25,
    airports: ["BOM"],
    majorStations: ["CSTM", "LTT"],
    featured: true,
    priority: 1,
    status: "active"
  },
  {
    slug: "delhi",
    name: "Delhi",
    alternateNames: ["New Delhi"],
    country: "India",
    state: "Delhi",
    coordinates: [28.6139, 77.2090],
    timezone: "Asia/Kolkata",
    population: 32900000,
    destinationCount: 30,
    airports: ["DEL"],
    majorStations: ["NDLS", "NZM"],
    featured: true,
    priority: 2,
    status: "active"
  },
  {
    slug: "bangalore",
    name: "Bangalore",
    alternateNames: ["Bengaluru"],
    country: "India",
    state: "Karnataka",
    coordinates: [12.9716, 77.5946],
    timezone: "Asia/Kolkata",
    population: 13200000,
    destinationCount: 20,
    airports: ["BLR"],
    majorStations: ["SBC", "YPR"],
    featured: true,
    priority: 3,
    status: "active"
  }
];

// Function to seed data (pseudo-code for actual MongoDB insertion)
async function seedDatabase() {
  console.log('🌱 Seeding MongoDB Atlas database...');
  
  try {
    // This would be actual MongoDB insertion code
    // await db.collection('destinations').insertMany(sampleDestinations);
    // await db.collection('cities').insertMany(sampleCities);
    
    console.log('✅ Successfully seeded:');
    console.log(`   - ${sampleDestinations.length} destinations`);
    console.log(`   - ${sampleCities.length} cities`);
    
    return {
      destinations: sampleDestinations,
      cities: sampleCities
    };
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Export for use in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sampleDestinations,
    sampleCities,
    seedDatabase
  };
}

// Export for browser environment  
if (typeof window !== 'undefined') {
  window.SeedData = {
    sampleDestinations,
    sampleCities,
    seedDatabase
  };
}