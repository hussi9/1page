// MongoDB Schema Design for Smart Day Trips Platform
// Collections: destinations, cities, activities, reviews, users

// 1. DESTINATIONS Collection
const destinationSchema = {
  _id: "ObjectId", // Auto-generated
  slug: "mumbai-lonavala", // URL-friendly identifier
  name: "Lonavala",
  description: "Scenic hill station with caves and waterfalls",
  
  // Location Data
  city: {
    name: "Mumbai",
    slug: "mumbai",
    country: "India",
    coordinates: [19.0760, 72.8777] // [lat, lng]
  },
  
  destination: {
    coordinates: [18.7537, 73.4068],
    address: "Lonavala, Maharashtra, India"
  },
  
  // Trip Data
  distance: {
    value: 83,
    unit: "km",
    formatted: "83 km"
  },
  
  duration: {
    travel: 120, // minutes
    recommended: 480, // 8 hours stay
    formatted: "2 hours travel"
  },
  
  // Cost Information
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
  
  // Activities & Features
  activities: [
    {
      name: "Trekking",
      category: "adventure",
      difficulty: "moderate",
      duration: 180 // minutes
    },
    {
      name: "Waterfall Visit",
      category: "nature",
      difficulty: "easy",
      duration: 120
    },
    {
      name: "Cave Exploration", 
      category: "adventure",
      difficulty: "easy",
      duration: 90
    }
  ],
  
  // Classification
  categories: ["hill_station", "nature", "adventure"],
  tags: ["waterfalls", "caves", "monsoon", "weekend"],
  
  // Suitability
  familyFriendly: true,
  accessibility: "moderate",
  crowdLevel: "medium", // low, medium, high, very_high
  
  // Seasonal Information
  bestSeason: "monsoon",
  seasonalData: {
    summer: { score: 6, note: "Hot weather" },
    monsoon: { score: 10, note: "Best time - lush green" },
    winter: { score: 8, note: "Pleasant weather" }
  },
  
  // Timing
  bestTime: {
    arrival: "06:00",
    departure: "19:00",
    recommended: "Full day trip"
  },
  
  // AI & Analytics
  aiScore: 95, // AI recommendation score
  popularity: 8.5,
  trending: true,
  
  // Media
  images: [
    {
      url: "https://example.com/lonavala1.jpg",
      caption: "Bhushi Dam waterfall",
      credit: "photographer_name"
    }
  ],
  
  // Reviews & Ratings
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
  
  // Practical Information
  facilities: ["parking", "restaurants", "restrooms", "first_aid"],
  tips: [
    "Carry raincoat during monsoon",
    "Start early to avoid crowds",
    "Book train tickets in advance"
  ],
  
  // Booking Information
  bookingRequired: false,
  bookingLinks: [
    {
      provider: "MakeMyTrip",
      url: "https://example.com/book",
      type: "package"
    }
  ],
  
  // Administrative
  status: "active", // active, inactive, draft
  createdAt: "2025-01-31T00:00:00Z",
  updatedAt: "2025-01-31T00:00:00Z",
  createdBy: "admin_user_id"
};

// 2. CITIES Collection
const citySchema = {
  _id: "ObjectId",
  slug: "mumbai",
  name: "Mumbai",
  alternateNames: ["Bombay"],
  
  // Location
  country: "India",
  state: "Maharashtra",
  coordinates: [19.0760, 72.8777],
  timezone: "Asia/Kolkata",
  
  // Statistics
  population: 20400000,
  destinationCount: 25,
  
  // Travel Hub Info
  airports: ["BOM"],
  majorStations: ["CSTM", "LTT"],
  
  // Metadata
  featured: true,
  priority: 1, // Higher priority cities show first
  status: "active"
};

// 3. ACTIVITIES Collection (Reference data)
const activitySchema = {
  _id: "ObjectId",
  name: "Trekking",
  slug: "trekking",
  category: "adventure",
  icon: "🥾",
  description: "Hiking through natural trails",
  difficulty: ["easy", "moderate", "hard"],
  equipment: ["hiking_boots", "water_bottle", "first_aid"]
};

// 4. REVIEWS Collection
const reviewSchema = {
  _id: "ObjectId",
  destinationId: "ObjectId", // Reference to destination
  userId: "ObjectId", // Reference to user
  
  rating: {
    overall: 5,
    scenery: 5,
    accessibility: 4,
    value: 4,
    safety: 5
  },
  
  title: "Amazing waterfalls!",
  content: "Perfect monsoon destination...",
  
  visitDate: "2024-08-15",
  travelGroup: "family", // solo, couple, family, friends
  
  helpful: 15, // Helpful votes
  verified: true, // Verified visitor
  
  images: ["url1", "url2"],
  
  createdAt: "2024-08-20T00:00:00Z"
};

// 5. USERS Collection (for future features)
const userSchema = {
  _id: "ObjectId",
  email: "user@example.com",
  name: "John Doe",
  preferences: {
    budget: "medium",
    interests: ["adventure", "nature"],
    travelStyle: "family"
  },
  savedDestinations: ["dest_id1", "dest_id2"],
  visitedDestinations: ["dest_id3"]
};

// INDEXES for Performance
const indexes = {
  destinations: [
    { "city.slug": 1 },
    { "categories": 1 },
    { "cost.average": 1 },
    { "aiScore": -1 },
    { "rating.overall": -1 },
    { "destination.coordinates": "2dsphere" }, // Geospatial
    { "city.slug": 1, "categories": 1, "cost.average": 1 } // Compound
  ],
  cities: [
    { "slug": 1 },
    { "country": 1 },
    { "priority": -1 }
  ],
  reviews: [
    { "destinationId": 1 },
    { "rating.overall": -1 },
    { "createdAt": -1 }
  ]
};

// Export for use in application
module.exports = {
  destinationSchema,
  citySchema,
  activitySchema,
  reviewSchema,
  userSchema,
  indexes
};