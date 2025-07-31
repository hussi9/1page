// MongoDB API Client for Smart Day Trips
// Handles all database operations with caching and error handling

class SmartTripsAPI {
  constructor() {
    // MongoDB Atlas connection (replace with your connection string)
    this.BASE_URL = 'https://your-api-domain.com/api';
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  getCacheKey(method, params) {
    return `${method}_${JSON.stringify(params)}`;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  // Generic API call with error handling
  async apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Call failed:', error);
      throw error;
    }
  }

  // 1. GET DESTINATIONS BY CITY
  async getDestinationsByCity(citySlug, filters = {}) {
    const cacheKey = this.getCacheKey('destinations', { citySlug, filters });
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const queryParams = new URLSearchParams({
        city: citySlug,
        ...filters
      });

      const data = await this.apiCall(`/destinations?${queryParams}`);
      
      // Transform data for frontend compatibility
      const transformedData = data.destinations.map(dest => ({
        name: dest.name,
        distance: dest.distance.formatted,
        time: `${Math.floor(dest.duration.travel / 60)} hours`,
        cost: dest.cost.average,
        category: dest.categories[0],
        activities: dest.activities.map(a => a.name),
        season: dest.bestSeason,
        familyFriendly: dest.familyFriendly,
        aiScore: dest.aiScore,
        crowdLevel: dest.crowdLevel,
        bestTime: `${dest.bestTime.arrival} - ${dest.bestTime.departure}`,
        rating: dest.rating.overall,
        images: dest.images.map(img => img.url),
        tips: dest.tips
      }));

      this.setCache(cacheKey, transformedData);
      return transformedData;

    } catch (error) {
      console.error('Failed to fetch destinations:', error);
      // Return fallback data
      return this.getFallbackDestinations(citySlug);
    }
  }

  // 2. SEARCH DESTINATIONS
  async searchDestinations(query, filters = {}) {
    const cacheKey = this.getCacheKey('search', { query, filters });
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const searchData = await this.apiCall('/destinations/search', {
        method: 'POST',
        body: JSON.stringify({
          query,
          filters: {
            maxCost: filters.maxCost,
            categories: filters.categories,
            familyFriendly: filters.familyFriendly,
            minRating: filters.minRating || 4.0
          }
        })
      });

      this.setCache(cacheKey, searchData.results);
      return searchData.results;

    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  // 3. GET POPULAR CITIES
  async getPopularCities(limit = 10) {
    const cacheKey = this.getCacheKey('cities', { limit });
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.apiCall(`/cities/popular?limit=${limit}`);
      this.setCache(cacheKey, data.cities);
      return data.cities;

    } catch (error) {
      console.error('Failed to fetch cities:', error);
      return this.getFallbackCities();
    }
  }

  // 4. GET DESTINATION DETAILS
  async getDestinationDetails(destinationId) {
    const cacheKey = this.getCacheKey('destination', { destinationId });
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.apiCall(`/destinations/${destinationId}`);
      this.setCache(cacheKey, data.destination);
      return data.destination;

    } catch (error) {
      console.error('Failed to fetch destination details:', error);
      return null;
    }
  }

  // 5. GET ANALYTICS DATA
  async getAnalytics(citySlug) {
    const cacheKey = this.getCacheKey('analytics', { citySlug });
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.apiCall(`/analytics/${citySlug}`);
      
      const analytics = {
        totalDestinations: data.stats.total,
        avgCost: Math.round(data.stats.avgCost),
        familyScore: Math.round(data.stats.familyPercentage),
        bestSeason: data.stats.popularSeason,
        costDistribution: data.costDistribution,
        categoryBreakdown: data.categoryBreakdown
      };

      this.setCache(cacheKey, analytics);
      return analytics;

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return this.getFallbackAnalytics();
    }
  }

  // 6. SUBMIT REVIEW
  async submitReview(destinationId, reviewData) {
    try {
      const response = await this.apiCall(`/destinations/${destinationId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });
      
      // Clear cache for this destination
      const keys = Array.from(this.cache.keys());
      keys.forEach(key => {
        if (key.includes(destinationId)) {
          this.cache.delete(key);
        }
      });

      return response;
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    }
  }

  // FALLBACK DATA (for offline/error scenarios)
  getFallbackDestinations(citySlug) {
    const fallbackData = {
      mumbai: [
        {
          name: "Lonavala",
          distance: "83 km",
          time: "2 hours",
          cost: 1500,
          category: "hill_station",
          activities: ["trekking", "waterfalls", "caves"],
          season: "monsoon",
          familyFriendly: true,
          aiScore: 95,
          crowdLevel: "medium",
          bestTime: "6 AM - 6 PM"
        }
      ],
      delhi: [
        {
          name: "Agra",
          distance: "200 km", 
          time: "3 hours",
          cost: 2500,
          category: "heritage",
          activities: ["Taj Mahal", "monuments", "shopping"],
          season: "winter",
          familyFriendly: true,
          aiScore: 98,
          crowdLevel: "very_high",
          bestTime: "sunrise - sunset"
        }
      ]
    };

    return fallbackData[citySlug.toLowerCase()] || [];
  }

  getFallbackCities() {
    return [
      { name: "Mumbai", slug: "mumbai", country: "India" },
      { name: "Delhi", slug: "delhi", country: "India" },
      { name: "Bangalore", slug: "bangalore", country: "India" },
      { name: "Pune", slug: "pune", country: "India" },
      { name: "Chennai", slug: "chennai", country: "India" }
    ];
  }

  getFallbackAnalytics() {
    return {
      totalDestinations: 0,
      avgCost: 0,
      familyScore: 0,
      bestSeason: "winter",
      costDistribution: [0, 0, 0, 0],
      categoryBreakdown: []
    };
  }

  // Real-time updates (WebSocket connection)
  setupRealTimeUpdates() {
    // This would connect to MongoDB Change Streams via WebSocket
    // For now, we'll implement polling
    setInterval(() => {
      this.cache.clear(); // Clear cache every 10 minutes
    }, 10 * 60 * 1000);
  }
}

// Export singleton instance
window.SmartTripsAPI = new SmartTripsAPI();

// Auto-setup real-time updates
window.SmartTripsAPI.setupRealTimeUpdates();

export default window.SmartTripsAPI;