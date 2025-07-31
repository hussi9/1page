// Smart Location Intelligence API for All 1Page Projects
// Handles location detection, geospatial queries, and cross-project suggestions

class SmartLocationAPI {
  constructor() {
    this.BASE_URL = 'https://your-api-domain.com/api';
    this.cache = new Map();
    this.cacheTTL = 10 * 60 * 1000; // 10 minutes
    
    // Current user location
    this.userLocation = null;
    this.locationAccuracy = null;
    
    // Initialize location detection
    this.initLocationDetection();
  }

  // =============================================================================
  // LOCATION DETECTION & MANAGEMENT
  // =============================================================================

  async initLocationDetection() {
    try {
      // Try GPS first (most accurate)
      const position = await this.getGPSLocation();
      await this.setUserLocation(position.coords, 'gps');
      
    } catch (gpsError) {
      console.log('GPS unavailable, trying IP geolocation...');
      
      try {
        // Fallback to IP geolocation
        const ipLocation = await this.getIPLocation();
        await this.setUserLocation(ipLocation, 'ip');
        
      } catch (ipError) {
        console.log('IP geolocation failed, using default location');
        // Default to a major city (Mumbai as example)
        await this.setUserLocation({
          latitude: 19.0760,
          longitude: 72.8777,
          accuracy: 50000 // 50km radius
        }, 'default');
      }
    }
  }

  // Get GPS location with enhanced accuracy
  getGPSLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  // Get location from IP address
  async getIPLocation() {
    try {
      // Using multiple IP geolocation services for reliability
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://ipinfo.io/json'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          const data = await response.json();
          
          if (data.latitude && data.longitude) {
            return {
              latitude: parseFloat(data.latitude || data.lat),
              longitude: parseFloat(data.longitude || data.lon),
              accuracy: 10000, // 10km accuracy for IP
              city: data.city,
              country: data.country
            };
          }
        } catch (err) {
          console.log(`Service ${service} failed:`, err);
          continue;
        }
      }
      
      throw new Error('All IP geolocation services failed');
    } catch (error) {
      throw new Error('IP geolocation failed: ' + error.message);
    }
  }

  // Set user location and update all relevant data
  async setUserLocation(coords, method = 'manual') {
    this.userLocation = {
      coordinates: [coords.latitude, coords.longitude],
      accuracy: coords.accuracy || 1000,
      method: method,
      detectedAt: new Date().toISOString()
    };

    // Reverse geocoding to get city/country
    try {
      const locationDetails = await this.reverseGeocode(coords.latitude, coords.longitude);
      this.userLocation = {
        ...this.userLocation,
        ...locationDetails
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }

    // Update user profile in database
    await this.updateUserLocation();
    
    // Trigger location-based suggestions
    await this.updateLocationSuggestions();
    
    // Broadcast location update to all projects
    this.broadcastLocationUpdate();
    
    console.log('📍 Location updated:', this.userLocation);
  }

  // Reverse geocoding to get address from coordinates
  async reverseGeocode(lat, lng) {
    try {
      // Using OpenStreetMap Nominatim (free) - replace with Google/Mapbox for production
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      const data = await response.json();
      
      return {
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state,
        country: data.address?.country,
        countryCode: data.address?.country_code?.toUpperCase(),
        address: data.display_name
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {};
    }
  }

  // =============================================================================
  // INTELLIGENT LOCATION-BASED SUGGESTIONS
  // =============================================================================

  // Get nearby destinations for day trips
  async getNearbyDestinations(radius = 200000) { // 200km default
    if (!this.userLocation) {
      await this.initLocationDetication();
    }

    const cacheKey = `nearby_destinations_${this.userLocation.coordinates.join('_')}_${radius}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.apiCall('/destinations/nearby', {
        method: 'POST',
        body: JSON.stringify({
          coordinates: this.userLocation.coordinates,
          radius: radius,
          limit: 20,
          categories: ['nature', 'adventure', 'heritage', 'beach', 'hill_station']
        })
      });

      // Enhance with distance and travel time
      const enhancedDestinations = response.destinations.map(dest => ({
        ...dest,
        distance: this.calculateDistance(
          this.userLocation.coordinates,
          dest.location.coordinates
        ),
        travelTime: this.estimateTravelTime(
          this.userLocation.coordinates,
          dest.location.coordinates
        ),
        relevanceScore: this.calculateRelevanceScore(dest)
      }));

      // Sort by relevance (distance + rating + popularity)
      enhancedDestinations.sort((a, b) => b.relevanceScore - a.relevanceScore);

      this.setCache(cacheKey, enhancedDestinations);
      return enhancedDestinations;

    } catch (error) {
      console.error('Failed to fetch nearby destinations:', error);
      return [];
    }
  }

  // Get weather for current location
  async getLocationWeather() {
    if (!this.userLocation) return null;

    const cacheKey = `weather_${this.userLocation.coordinates.join('_')}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.apiCall('/weather/location', {
        method: 'POST',
        body: JSON.stringify({
          coordinates: this.userLocation.coordinates,
          city: this.userLocation.city
        })
      });

      this.setCache(cacheKey, response.weather);
      return response.weather;

    } catch (error) {
      console.error('Failed to fetch location weather:', error);
      return null;
    }
  }

  // Get location-aware calculator suggestions
  async getLocationCalculatorSuggestions() {
    if (!this.userLocation) return [];

    try {
      const suggestions = [];

      // Currency conversion based on location
      if (this.userLocation.countryCode !== 'IN') {
        suggestions.push({
          type: 'currency_conversion',
          title: `Convert to ${this.userLocation.countryCode} currency`,
          action: 'open_currency_converter',
          data: {
            from: 'INR',
            to: this.getCurrencyByCountry(this.userLocation.countryCode)
          }
        });
      }

      // Tax calculator based on location
      const taxRate = this.getTaxRate(this.userLocation.countryCode);
      if (taxRate) {
        suggestions.push({
          type: 'tax_calculator',
          title: `Calculate ${this.userLocation.country} tax (${taxRate}%)`,
          action: 'open_tax_calculator',
          data: { rate: taxRate, country: this.userLocation.country }
        });
      }

      // Tip calculator based on local customs
      const tipCustom = this.getTipCustom(this.userLocation.countryCode);
      if (tipCustom) {
        suggestions.push({
          type: 'tip_calculator',
          title: `${this.userLocation.country} tip calculator (${tipCustom}%)`,
          action: 'open_tip_calculator',
          data: { rate: tipCustom, country: this.userLocation.country }
        });
      }

      return suggestions;

    } catch (error) {
      console.error('Failed to get calculator suggestions:', error);
      return [];
    }
  }

  // Get location-aware todo suggestions
  async getLocationTodoSuggestions() {
    if (!this.userLocation) return [];

    try {
      const suggestions = [];

      // Weather-based todos
      const weather = await this.getLocationWeather();
      if (weather) {
        if (weather.current.condition === 'rainy') {
          suggestions.push({
            type: 'weather_todo',
            title: 'Carry umbrella',
            category: 'personal',
            priority: 'high',
            dueDate: new Date().toISOString()
          });
        }

        if (weather.alerts && weather.alerts.length > 0) {
          suggestions.push({
            type: 'weather_alert',
            title: `Weather Alert: ${weather.alerts[0].description}`,
            category: 'safety',
            priority: 'high'
          });
        }
      }

      // Travel-based todos
      const nearbyDestinations = await this.getNearbyDestinations(100000); // 100km
      if (nearbyDestinations.length > 0) {
        const topDestination = nearbyDestinations[0];
        suggestions.push({
          type: 'travel_suggestion',
          title: `Plan trip to ${topDestination.name}`,
          category: 'travel',
          priority: 'medium',
          data: {
            destination: topDestination,
            estimatedCost: topDestination.details?.cost?.average,
            travelTime: topDestination.travelTime
          }
        });
      }

      return suggestions;

    } catch (error) {
      console.error('Failed to get todo suggestions:', error);
      return [];
    }
  }

  // =============================================================================
  // CROSS-PROJECT INTELLIGENCE
  // =============================================================================

  // Get smart suggestions based on user's current context
  async getContextualSuggestions(projectSlug) {
    if (!this.userLocation) return [];

    try {
      const response = await this.apiCall('/suggestions/contextual', {
        method: 'POST',
        body: JSON.stringify({
          project: projectSlug,
          location: this.userLocation,
          timestamp: new Date().toISOString()
        })
      });

      return response.suggestions || [];

    } catch (error) {
      console.error('Failed to get contextual suggestions:', error);
      return [];
    }
  }

  // Update location-based suggestions for all projects
  async updateLocationSuggestions() {
    if (!this.userLocation) return;

    try {
      // Parallel fetch of suggestions for all projects
      const [dayTripSuggestions, weatherSuggestions, calculatorSuggestions, todoSuggestions] = 
        await Promise.all([
          this.getNearbyDestinations(),
          this.getLocationWeather(),
          this.getLocationCalculatorSuggestions(),
          this.getLocationTodoSuggestions()
        ]);

      // Store suggestions in cache for quick access
      this.setCache('daytrip_suggestions', dayTripSuggestions);
      this.setCache('weather_data', weatherSuggestions);
      this.setCache('calculator_suggestions', calculatorSuggestions);
      this.setCache('todo_suggestions', todoSuggestions);

    } catch (error) {
      console.error('Failed to update location suggestions:', error);
    }
  }

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance([lat1, lng1], [lat2, lng2]) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance);
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Estimate travel time (rough calculation)
  estimateTravelTime([lat1, lng1], [lat2, lng2]) {
    const distance = this.calculateDistance([lat1, lng1], [lat2, lng2]);
    
    // Assume average speed of 50km/h
    const timeInHours = distance / 50;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    if (timeInMinutes < 60) {
      return `${timeInMinutes} min`;
    } else {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  // Calculate relevance score for destinations
  calculateRelevanceScore(destination) {
    const distance = this.calculateDistance(
      this.userLocation.coordinates,
      destination.location.coordinates
    );
    
    // Score components
    const distanceScore = Math.max(0, 100 - (distance / 2)); // Closer = better
    const ratingScore = (destination.social?.rating?.overall || 0) * 20; // Max 100
    const popularityScore = (destination.ai?.popularity || 0) * 10; // Max 100
    const trendingBonus = destination.ai?.trending ? 20 : 0;
    
    return distanceScore * 0.4 + ratingScore * 0.3 + popularityScore * 0.2 + trendingBonus * 0.1;
  }

  // Get currency by country code
  getCurrencyByCountry(countryCode) {
    const currencies = {
      'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', 'JP': 'JPY',
      'AU': 'AUD', 'CA': 'CAD', 'CH': 'CHF', 'CN': 'CNY',
      'IN': 'INR', 'SG': 'SGD', 'AE': 'AED'
    };
    return currencies[countryCode] || 'USD';
  }

  // Get tax rate by country
  getTaxRate(countryCode) {
    const taxRates = {
      'IN': 18, 'US': 8.5, 'GB': 20, 'DE': 19,
      'FR': 20, 'AU': 10, 'CA': 13, 'SG': 7
    };
    return taxRates[countryCode];
  }

  // Get tip customs by country
  getTipCustom(countryCode) {
    const tipCustoms = {
      'US': 18, 'CA': 15, 'GB': 10, 'AU': 10,
      'IN': 10, 'DE': 5, 'FR': 5, 'JP': 0
    };
    return tipCustoms[countryCode];
  }

  // Update user location in database
  async updateUserLocation() {
    try {
      await this.apiCall('/users/location', {
        method: 'PUT',
        body: JSON.stringify({
          location: this.userLocation
        })
      });
    } catch (error) {
      console.error('Failed to update user location:', error);
    }
  }

  // Broadcast location update to all projects
  broadcastLocationUpdate() {
    // Custom event for all projects to listen to
    window.dispatchEvent(new CustomEvent('locationUpdated', {
      detail: this.userLocation
    }));
  }

  // Cache management
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

  // Generic API call
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
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
}

// Initialize global instance
window.SmartLocationAPI = new SmartLocationAPI();

// Auto-detect location on page load
document.addEventListener('DOMContentLoaded', () => {
  window.SmartLocationAPI.initLocationDetection();
});

export default window.SmartLocationAPI;