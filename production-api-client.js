// Production API Client - Real APIs Only
class ProductionTravelAPI {
  constructor() {
    this.mongoConfig = {
      dataApiUrl: 'https://data.mongodb-api.com/app/data-ryhwplnl/endpoint/data/v1',
      apiKey: 'fec4a8b8-f3ba-4722-b7e6-ee8fbbc82486',
      dataSource: 'Cluster0',
      database: 'onepage_ecosystem'
    };
    
    // Real API endpoints
    this.googleMapsApiKey = ''; // User must provide
    this.openWeatherApiKey = ''; // User must provide
    
    this.initializeRealAPIs();
  }

  async initializeRealAPIs() {
    console.log('🚀 Initializing production APIs...');
    await this.verifyMongoConnection();
  }

  async verifyMongoConnection() {
    try {
      const response = await this.makeMongoRequest('find', {
        collection: 'destinations',
        limit: 1
      });
      console.log('✅ MongoDB production connection verified');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw new Error('Production MongoDB connection required');
    }
  }

  async makeMongoRequest(action, payload) {
    const response = await fetch(`${this.mongoConfig.dataApiUrl}/action/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.mongoConfig.apiKey
      },
      body: JSON.stringify({
        ...payload,
        dataSource: this.mongoConfig.dataSource,
        database: this.mongoConfig.database
      })
    });

    if (!response.ok) {
      throw new Error(`MongoDB API failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Real location detection using browser geolocation + reverse geocoding
  async detectUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Use real reverse geocoding
          const cityData = await this.reverseGeocode(latitude, longitude);
          resolve({
            coordinates: [latitude, longitude],
            city: cityData.city,
            state: cityData.state,
            country: cityData.country
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  // Real reverse geocoding using Nominatim (free) or Google Places API
  async reverseGeocode(lat, lng) {
    try {
      // Using OpenStreetMap Nominatim (free, production-ready)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'DayTripFinder/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      
      return {
        city: data.address.city || data.address.town || data.address.village,
        state: data.address.state,
        country: data.address.country,
        displayName: data.display_name
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Fallback to coordinate-based city detection
      return this.getCityFromCoordinates(lat, lng);
    }
  }

  // Production coordinate-to-city mapping for major Indian cities
  getCityFromCoordinates(lat, lng) {
    const cities = [
      { name: 'Mumbai', bounds: { minLat: 18.9, maxLat: 19.3, minLng: 72.7, maxLng: 73.1 }, state: 'Maharashtra' },
      { name: 'Thane', bounds: { minLat: 19.15, maxLat: 19.25, minLng: 72.95, maxLng: 73.05 }, state: 'Maharashtra' },
      { name: 'Delhi', bounds: { minLat: 28.4, maxLat: 28.8, minLng: 77.0, maxLng: 77.4 }, state: 'Delhi' },
      { name: 'Bangalore', bounds: { minLat: 12.8, maxLat: 13.2, minLng: 77.4, maxLng: 77.8 }, state: 'Karnataka' },
      { name: 'Chennai', bounds: { minLat: 12.8, maxLat: 13.2, minLng: 80.1, maxLng: 80.3 }, state: 'Tamil Nadu' },
      { name: 'Kolkata', bounds: { minLat: 22.4, maxLat: 22.7, minLng: 88.2, maxLng: 88.5 }, state: 'West Bengal' },
      { name: 'Hyderabad', bounds: { minLat: 17.2, maxLat: 17.6, minLng: 78.2, maxLng: 78.7 }, state: 'Telangana' },
      { name: 'Pune', bounds: { minLat: 18.4, maxLat: 18.7, minLng: 73.7, maxLng: 74.0 }, state: 'Maharashtra' }
    ];

    for (const city of cities) {
      const { bounds } = city;
      if (lat >= bounds.minLat && lat <= bounds.maxLat && 
          lng >= bounds.minLng && lng <= bounds.maxLng) {
        return { city: city.name, state: city.state, country: 'India' };
      }
    }

    return { city: 'Unknown', state: 'Unknown', country: 'Unknown' };
  }

  // Real destination search using MongoDB with geospatial queries
  async searchDestinations(query, userLocation = null) {
    try {
      const searchFilter = {
        status: 'active',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { 'ai.tags': { $in: [query.toLowerCase()] } },
          { 'details.categories': { $in: [query.toLowerCase()] } }
        ]
      };

      const response = await this.makeMongoRequest('find', {
        collection: 'destinations',
        filter: searchFilter,
        sort: { 'ai.score': -1 },
        limit: 50
      });

      let destinations = response.documents?.map(this.transformDestination) || [];

      // Sort by proximity if user location available
      if (userLocation && destinations.length > 0) {
        destinations = this.sortByProximity(destinations, userLocation);
      }

      return destinations;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  // Real nearby destinations using MongoDB geospatial queries
  async getNearbyDestinations(coordinates, radiusKm = 200) {
    try {
      const response = await this.makeMongoRequest('aggregate', {
        collection: 'destinations',
        pipeline: [
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [coordinates[1], coordinates[0]] // MongoDB expects [lng, lat]
              },
              distanceField: "distance",
              maxDistance: radiusKm * 1000, // Convert to meters
              spherical: true,
              query: { status: "active" }
            }
          },
          { $sort: { "ai.score": -1 } },
          { $limit: 50 }
        ]
      });

      return response.documents?.map(dest => ({
        ...this.transformDestination(dest),
        distance: Math.round(dest.distance / 1000) + ' km',
        calculatedDistance: dest.distance / 1000
      })) || [];
    } catch (error) {
      console.error('Nearby search failed:', error);
      throw error;
    }
  }

  // Real destinations by city using MongoDB
  async getDestinationsByCity(citySlug) {
    try {
      const response = await this.makeMongoRequest('find', {
        collection: 'destinations',
        filter: {
          'location.city.slug': citySlug.toLowerCase(),
          status: 'active'
        },
        sort: { 'ai.score': -1 },
        limit: 50
      });

      return response.documents?.map(this.transformDestination) || [];
    } catch (error) {
      console.error('City destinations fetch failed:', error);
      throw error;
    }
  }

  // Production data transformation
  transformDestination(dest) {
    return {
      id: dest._id,
      name: dest.name,
      description: dest.description,
      distance: this.calculateDisplayDistance(dest),
      time: this.calculateTravelTime(dest),
      cost: dest.details?.cost?.average || 0,
      category: dest.details?.categories?.[0] || 'general',
      activities: dest.details?.activities?.map(a => 
        typeof a === 'string' ? a : a.name
      ) || [],
      season: dest.details?.bestSeason || 'year-round',
      familyFriendly: dest.details?.familyFriendly || false,
      aiScore: dest.ai?.score || 0,
      crowdLevel: dest.details?.crowdLevel || 'unknown',
      bestTime: dest.details?.bestTime?.arrival + ' - ' + dest.details?.bestTime?.departure || 'flexible',
      rating: dest.social?.rating?.overall || 0,
      reviews: dest.social?.rating?.count || 0,
      coordinates: dest.location?.coordinates || [],
      image: dest.images?.[0]?.url || this.getDefaultImage(dest.details?.categories?.[0]),
      icon: this.getCategoryIcon(dest.details?.categories?.[0]),
      featured: dest.ai?.trending || false,
      highlights: dest.highlights || [],
      transport: dest.transport || [],
      safety: dest.safety || 0
    };
  }

  calculateDisplayDistance(dest) {
    if (dest.calculatedDistance) {
      return Math.round(dest.calculatedDistance) + ' km';
    }
    return dest.details?.duration?.travel ? 
      Math.round(dest.details.duration.travel / 60 * 50) + ' km' : 'Unknown';
  }

  calculateTravelTime(dest) {
    if (dest.details?.duration?.travel) {
      const minutes = dest.details.duration.travel;
      if (minutes < 60) return minutes + ' min';
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return 'Unknown';
  }

  sortByProximity(destinations, userCoords) {
    return destinations.map(dest => {
      if (dest.coordinates && dest.coordinates.length === 2) {
        const distance = this.calculateDistance(userCoords, dest.coordinates);
        return { ...dest, calculatedDistance: distance };
      }
      return dest;
    }).sort((a, b) => (a.calculatedDistance || 999) - (b.calculatedDistance || 999));
  }

  calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Real weather data using OpenWeatherMap API
  async getWeatherData(cityName) {
    if (!this.openWeatherApiKey) {
      throw new Error('OpenWeatherMap API key required for production');
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${this.openWeatherApiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Weather API error:', error);
      throw error;
    }
  }

  // Real trip saving to MongoDB
  async saveUserTrip(tripData) {
    try {
      const response = await this.makeMongoRequest('insertOne', {
        collection: 'user_trips',
        document: {
          ...tripData,
          createdAt: new Date(),
          userId: this.generateUserId(),
          status: 'planned'
        }
      });

      return response.insertedId;
    } catch (error) {
      console.error('Trip save failed:', error);
      throw error;
    }
  }

  getDefaultImage(category) {
    const images = {
      'nature': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'beach': 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop',
      'heritage': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop',
      'adventure': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
      'cultural': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop'
    };
    return images[category] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
  }

  getCategoryIcon(category) {
    const icons = {
      'nature': '🏞️',
      'beach': '🏖️', 
      'heritage': '🏛️',
      'adventure': '🥾',
      'cultural': '🏛️'
    };
    return icons[category] || '📍';
  }

  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Initialize production API
window.ProductionTravelAPI = new ProductionTravelAPI();