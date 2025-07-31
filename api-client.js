// Smart Trips API Client with MongoDB Integration
class SmartTripsAPI {
  constructor() {
    this.mongoConfig = {
      dataApiUrl: 'https://data.mongodb-api.com/app/data-ryhwplnl/endpoint/data/v1',
      apiKey: 'fec4a8b8-f3ba-4722-b7e6-ee8fbbc82486',
      dataSource: 'Cluster0',
      database: 'onepage_ecosystem'
    };
    
    this.weatherApiKey = ''; // Add OpenWeatherMap API key
    this.initializeAPI();
  }

  async initializeAPI() {
    console.log('🔌 MongoDB API Client initialized');
    await this.testConnection();
  }

  async testConnection() {
    try {
      const response = await this.makeRequest('find', {
        collection: 'destinations',
        limit: 1
      });
      console.log('✅ MongoDB connection successful');
      return true;
    } catch (error) {
      console.warn('⚠️ MongoDB connection failed, using fallback data');
      return false;
    }
  }

  async makeRequest(action, payload) {
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
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async getDestinationsByCity(citySlug) {
    try {
      const response = await this.makeRequest('find', {
        collection: 'destinations',
        filter: {
          'location.city.slug': citySlug.toLowerCase(),
          status: 'active'
        },
        sort: { 'ai.score': -1 },
        limit: 20
      });

      return response.documents?.map(this.transformDestination) || [];
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  }

  async getNearbyDestinations(coordinates, radiusKm = 200) {
    try {
      const response = await this.makeRequest('aggregate', {
        collection: 'destinations',
        pipeline: [
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [coordinates[1], coordinates[0]] // [lng, lat]
              },
              distanceField: "distance",
              maxDistance: radiusKm * 1000, // Convert to meters
              spherical: true,
              query: { status: "active" }
            }
          },
          { $sort: { "ai.score": -1 } },
          { $limit: 20 }
        ]
      });

      return response.documents?.map(dest => ({
        ...this.transformDestination(dest),
        distance: Math.round(dest.distance / 1000) + ' km'
      })) || [];
    } catch (error) {
      console.error('Error fetching nearby destinations:', error);
      return [];
    }
  }

  async saveUserTrip(tripData) {
    try {
      const response = await this.makeRequest('insertOne', {
        collection: 'user_trips',
        document: {
          ...tripData,
          createdAt: new Date(),
          userId: this.generateUserId()
        }
      });

      return response.insertedId;
    } catch (error) {
      console.error('Error saving trip:', error);
      return null;
    }
  }

  async getWeatherData(cityName) {
    if (!this.weatherApiKey) {
      return this.getMockWeatherData();
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${this.weatherApiKey}&units=metric`
      );
      
      if (!response.ok) throw new Error('Weather API failed');
      
      return await response.json();
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getMockWeatherData();
    }
  }

  getMockWeatherData() {
    return {
      main: { temp: 28, feels_like: 32 },
      weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
      name: 'Mumbai'
    };
  }

  transformDestination(dest) {
    return {
      id: dest._id,
      name: dest.name,
      description: dest.description,
      distance: dest.location?.nearbyMajorCities?.[0]?.distance ? 
        `${dest.location.nearbyMajorCities[0].distance} km` : 
        'Unknown',
      time: dest.details?.duration?.travel ? 
        `${Math.floor(dest.details.duration.travel / 60)} hours` : 
        'Unknown',
      cost: dest.details?.cost?.average || 0,
      category: dest.details?.categories?.[0] || 'general',
      activities: dest.details?.activities?.map(a => 
        typeof a === 'string' ? a : a.name
      ) || [],
      season: dest.details?.bestSeason || 'year-round',
      familyFriendly: dest.details?.familyFriendly || false,
      aiScore: dest.ai?.score || 70,
      crowdLevel: dest.details?.crowdLevel || 'unknown',
      bestTime: dest.details?.bestTime || 'flexible',
      rating: dest.social?.rating?.overall || 0,
      reviews: dest.social?.rating?.overall || 0,
      safety: dest.safety || 7,
      difficulty: dest.difficulty || 'easy',
      accessibility: dest.accessibility || 'good',
      transport: dest.transport || ['car'],
      weather: dest.weather || 'pleasant',
      highlights: dest.highlights || [],
      budget: dest.budget || 'medium',
      duration: dest.duration || 'full_day',
      bestMonths: dest.bestMonths || [],
      photoSpots: dest.photoSpots || 5,
      foodOptions: dest.foodOptions || 5,
      parking: dest.parking || 'available',
      coordinates: dest.location?.coordinates || [],
      image: dest.image || this.getDefaultImage(dest.details?.categories?.[0]),
      icon: this.getCategoryIcon(dest.details?.categories?.[0]),
      featured: dest.featured || false
    };
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
      'hill_station': '🏔️',
      'beach': '🏖️', 
      'heritage': '🏛️',
      'adventure': '🚀',
      'nature': '🌳'
    };
    return icons[category] || '📍';
  }

  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  async searchDestinations(query, filters = {}) {
    try {
      const searchFilter = {
        status: 'active',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { 'ai.tags': { $in: [query.toLowerCase()] } }
        ]
      };

      // Apply additional filters
      if (filters.categories) {
        searchFilter['details.categories'] = { $in: filters.categories };
      }

      if (filters.maxCost) {
        searchFilter['details.cost.average'] = { $lte: filters.maxCost };
      }

      const response = await this.makeRequest('find', {
        collection: 'destinations',
        filter: searchFilter,
        sort: { 'ai.score': -1 },
        limit: 30
      });

      return response.documents?.map(this.transformDestination) || [];
    } catch (error) {
      console.error('Error searching destinations:', error);
      return [];
    }
  }
}

// Initialize API client
window.SmartTripsAPI = new SmartTripsAPI();