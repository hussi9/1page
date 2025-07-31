// MongoDB Configuration for 1Page Projects
// IMPORTANT: Never commit API keys to public repositories!

// Environment Configuration (for production)
const MONGODB_CONFIG = {
  // Replace with your actual MongoDB Atlas connection string
  // Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
  
  // Your cluster details (from your MongoDB Atlas dashboard):
  // Public Key: ryhwplnl  
  // Private Key: fec4a8b8-f3ba-4722-b7e6-ee8fbbc82486
  
  // STEP 1: Create your connection string
  // Go to MongoDB Atlas → Clusters → Connect → Connect your application
  // Replace <password> with your database user password (NOT the API key)
  CONNECTION_STRING: process.env.MONGODB_URI || 'mongodb+srv://onepage-user:YOUR_DB_PASSWORD@cluster0.xyz123.mongodb.net/onepage_ecosystem?retryWrites=true&w=majority',
  
  // Database and collection names
  DATABASE_NAME: 'onepage_ecosystem',
  COLLECTIONS: {
    USERS: 'users',
    PROJECTS: 'projects', 
    DESTINATIONS: 'destinations',
    WEATHER_DATA: 'weather_data',
    CALCULATIONS: 'calculations',
    TODOS: 'todos',
    USER_SESSIONS: 'user_sessions',
    LOCATION_INTELLIGENCE: 'location_intelligence'
  },
  
  // API Configuration (using your keys securely)
  API_CONFIG: {
    // These should be environment variables in production
    PUBLIC_KEY: process.env.MONGODB_PUBLIC_KEY || 'ryhwplnl',
    PRIVATE_KEY: process.env.MONGODB_PRIVATE_KEY || 'fec4a8b8-f3ba-4722-b7e6-ee8fbbc82486',
    
    // Base URLs for different environments
    BASE_URL: {
      development: 'http://localhost:3000/api',
      production: 'https://your-deployed-api.vercel.app/api'
    }
  },
  
  // Connection options
  OPTIONS: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};

// Security helper functions
const SecurityHelper = {
  // Hash sensitive data
  hashData(data) {
    // Simple hash for demo - use proper crypto in production
    return btoa(JSON.stringify(data));
  },
  
  // Validate API requests
  validateRequest(request) {
    // Add API key validation, rate limiting, etc.
    return true;
  },
  
  // Sanitize location data for privacy
  sanitizeLocation(location) {
    if (!location) return null;
    
    // Round coordinates to reduce precision for privacy
    return {
      ...location,
      coordinates: location.coordinates ? [
        Math.round(location.coordinates[0] * 100) / 100, // ~1km precision
        Math.round(location.coordinates[1] * 100) / 100
      ] : null
    };
  }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MONGODB_CONFIG, SecurityHelper };
}

if (typeof window !== 'undefined') {
  window.MONGODB_CONFIG = MONGODB_CONFIG;
  window.SecurityHelper = SecurityHelper;
}