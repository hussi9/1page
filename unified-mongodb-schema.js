// Unified MongoDB Schema for All 1Page Projects
// Smart architecture that powers calculator, weather, todo, day-trips, and future projects
// With intelligent location detection and cross-project analytics

// =============================================================================
// CORE COLLECTIONS (Shared across all projects)
// =============================================================================

// 1. USERS Collection - Central user management
const userSchema = {
  _id: "ObjectId",
  
  // Identity
  email: "user@example.com",
  username: "john_doe",
  displayName: "John Doe",
  avatar: "https://example.com/avatar.jpg",
  
  // Location Intelligence
  location: {
    // Current detected location
    current: {
      coordinates: [19.0760, 72.8777], // [lat, lng]
      city: "Mumbai",
      country: "India",
      timezone: "Asia/Kolkata",
      accuracy: 100, // meters
      detectedAt: "2025-01-31T10:00:00Z",
      method: "gps" // gps, ip, manual
    },
    
    // Location history for better suggestions
    history: [
      {
        coordinates: [28.6139, 77.2090],
        city: "Delhi",
        visitedAt: "2025-01-20T08:00:00Z",
        duration: 86400000 // milliseconds
      }
    ],
    
    // Saved/favorite locations
    saved: [
      {
        name: "Home",
        coordinates: [19.0760, 72.8777],
        address: "Andheri, Mumbai",
        type: "home"
      },
      {
        name: "Office", 
        coordinates: [19.1136, 72.8697],
        address: "BKC, Mumbai",
        type: "work"
      }
    ],
    
    // Privacy settings
    shareLocation: true,
    trackHistory: true
  },
  
  // Cross-Project Preferences
  preferences: {
    // Day Trips
    travel: {
      budget: "medium", // low, medium, high
      interests: ["adventure", "nature", "heritage"],
      travelStyle: "family", // solo, couple, family, friends
      maxDistance: 200, // km
      preferredTransport: ["car", "train"]
    },
    
    // Weather
    weather: {
      units: "metric", // metric, imperial
      alertsEnabled: true,
      favoriteLocations: ["mumbai", "delhi"],
      showExtended: true
    },
    
    // Calculator  
    calculator: {
      theme: "dark",
      precision: 2,
      history: true,
      shortcuts: ["tip", "tax", "currency"]
    },
    
    // Todo
    todo: {
      defaultCategory: "personal",
      reminderStyle: "notification",
      syncAcrossDevices: true
    },
    
    // Global UI preferences
    ui: {
      theme: "dark", // dark, light, auto
      language: "en",
      notifications: true,
      animations: true
    }
  },
  
  // Usage Analytics
  usage: {
    totalSessions: 142,
    favoriteProject: "day-trips",
    lastActive: "2025-01-31T10:00:00Z",
    projectUsage: {
      "day-trips": { sessions: 85, totalTime: 3600000 },
      "calculator": { sessions: 32, totalTime: 1200000 },
      "weather": { sessions: 25, totalTime: 800000 }
    }
  },
  
  // Account metadata
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-31T10:00:00Z",
  status: "active" // active, inactive, banned
};

// 2. PROJECTS Collection - Registry of all 1page projects
const projectSchema = {
  _id: "ObjectId",
  slug: "day-trips",
  name: "Smart Day Trips",
  description: "AI-powered travel discovery platform",
  
  // Project metadata
  category: "travel", // travel, utility, productivity, entertainment
  version: "2.1.0",
  status: "active", // active, beta, deprecated
  
  // Usage stats
  analytics: {
    totalUsers: 15420,
    dailyActiveUsers: 892,
    averageSessionTime: 420000, // ms
    rating: 4.7,
    reviewCount: 234
  },
  
  // Location relevance (for smart suggestions)
  locationRelevant: true,
  supportedRegions: ["global"], // global, asia, europe, etc.
  
  // Integration capabilities
  features: {
    offlineMode: true,
    locationServices: true,
    notifications: true,
    dataExport: true
  },
  
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-31T10:00:00Z"
};

// =============================================================================
// PROJECT-SPECIFIC COLLECTIONS
// =============================================================================

// 3. DESTINATIONS Collection (Day Trips)
const destinationSchema = {
  _id: "ObjectId",
  slug: "mumbai-lonavala",
  name: "Lonavala",
  description: "Scenic hill station with waterfalls and caves",
  
  // Geospatial data (CRITICAL for location intelligence)
  location: {
    coordinates: [18.7537, 73.4068], // [lat, lng] - GeoJSON format
    city: {
      name: "Mumbai",
      slug: "mumbai",
      coordinates: [19.0760, 72.8777],
      country: "India"
    },
    address: "Lonavala, Maharashtra, India",
    
    // Distance calculations (stored for performance)
    nearbyMajorCities: [
      { city: "Mumbai", distance: 83, travelTime: 120 },
      { city: "Pune", distance: 65, travelTime: 90 },
      { city: "Nashik", distance: 120, travelTime: 150 }
    ]
  },
  
  // Rich destination data
  details: {
    cost: { min: 1200, max: 2000, average: 1500, currency: "INR" },
    duration: { travel: 120, recommended: 480 },
    activities: [
      { name: "Trekking", category: "adventure", duration: 180 },
      { name: "Waterfall Visit", category: "nature", duration: 120 }
    ],
    categories: ["hill_station", "nature", "adventure"],
    familyFriendly: true,
    crowdLevel: "medium",
    bestSeason: "monsoon"
  },
  
  // AI & personalization
  ai: {
    score: 95,
    popularity: 8.5,
    trending: true,
    personalizedScore: {}, // user-specific scores stored here
    tags: ["waterfalls", "caves", "weekend", "monsoon"]
  },
  
  // Social features
  social: {
    rating: { overall: 4.5, count: 1250 },
    reviews: [], // references to reviews collection
    photos: [
      {
        url: "https://example.com/photo1.jpg",
        caption: "Bhushi Dam waterfall",
        uploadedBy: "user_id",
        likes: 45
      }
    ]
  },
  
  status: "active",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-31T10:00:00Z"
};

// 4. WEATHER_DATA Collection (Weather App)
const weatherDataSchema = {
  _id: "ObjectId",
  
  // Location reference
  location: {
    coordinates: [19.0760, 72.8777],
    city: "Mumbai",
    country: "India"
  },
  
  // Current weather
  current: {
    temperature: 28,
    humidity: 75,
    windSpeed: 12,
    condition: "partly_cloudy",
    visibility: 10,
    uvIndex: 6,
    timestamp: "2025-01-31T10:00:00Z"
  },
  
  // Forecast data
  forecast: [
    {
      date: "2025-02-01",
      high: 30,
      low: 22,
      condition: "sunny",
      precipitationChance: 10
    }
  ],
  
  // Weather alerts
  alerts: [
    {
      type: "heat_wave",
      severity: "moderate",
      validUntil: "2025-02-02T00:00:00Z",
      description: "High temperatures expected"
    }
  ],
  
  // Data freshness
  dataSource: "openweathermap",
  lastUpdated: "2025-01-31T10:00:00Z",
  expiresAt: "2025-01-31T11:00:00Z"
};

// 5. CALCULATIONS Collection (Calculator App)
const calculationSchema = {
  _id: "ObjectId",
  
  // User reference
  userId: "ObjectId", // if user is logged in
  sessionId: "anonymous_session_123", // for anonymous users
  
  // Calculation data
  calculation: {
    type: "basic", // basic, scientific, currency, tip, tax
    expression: "25 * 4 + 10",
    result: 110,
    operands: [25, 4, 10],
    operators: ["*", "+"]
  },
  
  // Context (smart features)
  context: {
    location: [19.0760, 72.8777], // for currency/tax calculations
    currency: "INR",
    taxRate: 18, // GST in India
    tipPercentage: 10
  },
  
  // Smart suggestions (location-aware)
  suggestions: [
    {
      type: "currency_conversion",
      suggestion: "Convert ₹110 to USD?",
      rate: 0.012,
      result: "$1.32"
    },
    {
      type: "tip_calculator", 
      suggestion: "Add 10% tip?",
      amount: 11,
      total: 121
    }
  ],
  
  timestamp: "2025-01-31T10:00:00Z"
};

// 6. TODOS Collection (Todo App)
const todoSchema = {
  _id: "ObjectId",
  
  // User reference
  userId: "ObjectId",
  
  // Todo data
  todo: {
    title: "Visit Lonavala this weekend",
    description: "Plan day trip with family",
    category: "travel",
    priority: "medium", // low, medium, high
    status: "pending", // pending, in_progress, completed, cancelled
    
    // Location-aware todos
    location: {
      coordinates: [18.7537, 73.4068],
      address: "Lonavala, Maharashtra",
      radiusAlert: 1000 // meters - alert when user is within this distance
    },
    
    // Smart scheduling
    scheduling: {
      dueDate: "2025-02-02T09:00:00Z",
      estimatedDuration: 480, // minutes
      bestWeather: "sunny",
      trafficConsideration: true
    }
  },
  
  // Cross-project integration
  integrations: {
    linkedDestination: "mumbai-lonavala", // from day-trips
    weatherAlert: true, // check weather before due date
    calculatorHistory: ["ObjectId"], // related calculations
    autoSuggestions: [
      "Check weather forecast",
      "Calculate travel budget",
      "Find nearby restaurants"
    ]
  },
  
  createdAt: "2025-01-31T10:00:00Z",
  updatedAt: "2025-01-31T10:00:00Z"
};

// =============================================================================
// ANALYTICS & INTELLIGENCE COLLECTIONS
// =============================================================================

// 7. USER_SESSIONS Collection - Cross-project analytics
const userSessionSchema = {
  _id: "ObjectId",
  
  // Session identification
  userId: "ObjectId", // null for anonymous
  sessionId: "session_abc123",
  
  // Location context
  location: {
    coordinates: [19.0760, 72.8777],
    city: "Mumbai",
    country: "India",
    detectedAt: "2025-01-31T09:00:00Z"
  },
  
  // Cross-project usage
  projects: [
    {
      slug: "day-trips",
      timeSpent: 1200000, // ms
      actions: [
        { action: "search_city", data: { city: "Mumbai" }, timestamp: "2025-01-31T09:05:00Z" },
        { action: "view_destination", data: { destination: "lonavala" }, timestamp: "2025-01-31T09:10:00Z" }
      ]
    },
    {
      slug: "calculator",
      timeSpent: 300000,
      actions: [
        { action: "calculate", data: { expression: "1500 * 2" }, timestamp: "2025-01-31T09:15:00Z" }
      ]
    }
  ],
  
  // Intelligence insights
  insights: {
    primaryIntent: "travel_planning", // travel_planning, productivity, utility
    locationRelevance: 0.9, // how much location influenced the session
    crossProjectFlow: true, // used multiple projects in sequence
    satisfactionScore: 8.5 // inferred from behavior
  },
  
  // Technical metadata
  device: {
    type: "mobile",
    os: "iOS",
    browser: "Safari",
    screenSize: { width: 375, height: 812 }
  },
  
  startTime: "2025-01-31T09:00:00Z",
  endTime: "2025-01-31T09:30:00Z"
};

// 8. LOCATION_INTELLIGENCE Collection - Smart location-based suggestions
const locationIntelligenceSchema = {
  _id: "ObjectId",
  
  // Geographic area
  area: {
    type: "city", // city, region, country
    name: "Mumbai",
    coordinates: [19.0760, 72.8777],
    radius: 50000, // meters - coverage area
    population: 20400000,
    timezone: "Asia/Kolkata"
  },
  
  // Cross-project insights for this location
  insights: {
    // Day trips insights
    travel: {
      popularDestinations: [
        { slug: "mumbai-lonavala", visits: 1250, rating: 4.5 },
        { slug: "mumbai-alibaug", visits: 890, rating: 4.3 }
      ],
      bestSeason: "winter",
      averageBudget: 1800,
      preferredActivities: ["nature", "adventure", "heritage"]
    },
    
    // Weather patterns
    weather: {
      averageTemp: { summer: 32, monsoon: 28, winter: 25 },
      rainyDays: { summer: 2, monsoon: 20, winter: 1 },
      bestTravelMonths: ["November", "December", "January", "February"]
    },
    
    // Calculator usage patterns
    calculations: {
      commonCalculations: ["currency_conversion", "tip_calculator", "tax_calculator"],
      averageTransactionSize: 2500,
      currencyUsage: { INR: 0.95, USD: 0.03, EUR: 0.02 }
    },
    
    // Todo patterns
    productivity: {
      commonCategories: ["travel", "work", "personal"],
      peakProductivityHours: [9, 10, 14, 15],
      locationBasedTasks: 0.35 // 35% of todos are location-aware
    }
  },
  
  // Smart suggestions for users in this location
  suggestions: {
    forNewUsers: [
      {
        type: "day_trip",
        message: "Popular day trips from Mumbai",
        data: { destinations: ["lonavala", "alibaug", "matheran"] }
      },
      {
        type: "weather_alert",
        message: "Monsoon season - check weather before traveling",
        data: { months: ["June", "July", "August", "September"] }
      }
    ],
    
    contextual: [
      {
        trigger: "weekend_approach",
        suggestion: "Plan your weekend getaway",
        projects: ["day-trips", "weather", "calculator"]
      },
      {
        trigger: "monsoon_season",
        suggestion: "Best hill stations for monsoon",
        projects: ["day-trips", "weather"]
      }
    ]
  },
  
  // Data freshness
  lastUpdated: "2025-01-31T10:00:00Z",
  nextUpdate: "2025-02-01T10:00:00Z"
};

// =============================================================================
// INDEXES FOR PERFORMANCE
// =============================================================================

const indexes = {
  // Users collection
  users: [
    { "email": 1 }, // unique
    { "location.current.coordinates": "2dsphere" }, // geospatial
    { "location.current.city": 1 },
    { "preferences.travel.interests": 1 },
    { "usage.lastActive": -1 }
  ],
  
  // Destinations collection (geospatial is critical)
  destinations: [
    { "location.coordinates": "2dsphere" }, // PRIMARY geospatial index
    { "location.city.slug": 1 },
    { "details.categories": 1 },
    { "details.cost.average": 1 },
    { "ai.score": -1 },
    { "ai.tags": 1 },
    { "social.rating.overall": -1 },
    { "status": 1 },
    // Compound indexes for complex queries
    { "location.city.slug": 1, "details.categories": 1, "details.cost.average": 1 },
    { "location.coordinates": "2dsphere", "details.categories": 1 } // geo + category
  ],
  
  // Weather data
  weather_data: [
    { "location.coordinates": "2dsphere" },
    { "location.city": 1 },
    { "lastUpdated": -1 },
    { "expiresAt": 1 } // TTL index for auto-cleanup
  ],
  
  // Calculations
  calculations: [
    { "userId": 1 },
    { "sessionId": 1 },
    { "context.location": "2dsphere" },
    { "timestamp": -1 },
    { "calculation.type": 1 }
  ],
  
  // Todos
  todos: [
    { "userId": 1 },
    { "todo.location.coordinates": "2dsphere" },
    { "todo.status": 1 },
    { "todo.category": 1 },
    { "todo.scheduling.dueDate": 1 },
    { "createdAt": -1 }
  ],
  
  // User sessions
  user_sessions: [
    { "userId": 1 },
    { "sessionId": 1 },
    { "location.coordinates": "2dsphere" },
    { "startTime": -1 },
    { "projects.slug": 1 }
  ],
  
  // Location intelligence
  location_intelligence: [
    { "area.coordinates": "2dsphere" },
    { "area.name": 1 },
    { "area.type": 1 },
    { "lastUpdated": -1 }
  ]
};

// =============================================================================
// EXPORT SCHEMA
// =============================================================================

module.exports = {
  schemas: {
    user: userSchema,
    project: projectSchema,
    destination: destinationSchema,
    weatherData: weatherDataSchema,
    calculation: calculationSchema,
    todo: todoSchema,
    userSession: userSessionSchema,
    locationIntelligence: locationIntelligenceSchema
  },
  indexes,
  
  // Database configuration
  config: {
    databaseName: "onepage_ecosystem",
    collections: [
      "users",
      "projects", 
      "destinations",
      "weather_data",
      "calculations",
      "todos",
      "user_sessions",
      "location_intelligence"
    ]
  }
};