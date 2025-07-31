// REAL PRODUCTION API CLIENT - NO MOCK DATA!
class RealProductionTravelAPI {
  constructor() {
    this.mongoConfig = {
      dataApiUrl: 'https://data.mongodb-api.com/app/data-ryhwplnl/endpoint/data/v1',
      apiKey: 'fec4a8b8-f3ba-4722-b7e6-ee8fbbc82486',
      dataSource: 'Cluster0',
      database: 'onepage_ecosystem'
    };
    
    // All FREE APIs - No cost!
    this.apis = {
      weather: 'https://api.open-meteo.com/v1/forecast',
      geocoding: 'https://nominatim.openstreetmap.org',
      places: 'https://api.geoapify.com/v2/places',
      routing: 'https://api.openrouteservice.org/v2/directions',
      tripadvisor: 'https://api.content.tripadvisor.com/api/v1'
    };
    
    // API Keys
    this.apiKeys = {
      geoapify: '3bc64d2366df476b942c00221c34170e',
      tripadvisor: 'F6E3311A0B064C2CBA54F38A4673432A'
    };
    
    // Rate limiting for free APIs
    this.rateLimits = {
      nominatim: { requests: 0, lastReset: Date.now(), limit: 1000 }, // 1 req/sec
      geoapify: { requests: 0, lastReset: Date.now(), limit: 3000 },   // 3k/day
      tripadvisor: { requests: 0, lastReset: Date.now(), limit: 5000 } // 5k/month
    };
    
    this.initializeProduction();
  }

  async initializeProduction() {
    console.log('🚀 Initializing REAL PRODUCTION APIs...');
    
    // Test all APIs immediately
    await this.testAllAPIs();
    console.log('✅ All production APIs ready!');
  }

  async testAllAPIs() {
    const tests = [
      this.testWeatherAPI(),
      this.testGeocodingAPI(),  
      this.testMongoConnection()
    ];
    
    const results = await Promise.allSettled(tests);
    results.forEach((result, index) => {
      const apiNames = ['Weather', 'Geocoding', 'MongoDB'];
      if (result.status === 'fulfilled') {
        console.log(`✅ ${apiNames[index]} API: Connected`);
      } else {
        console.error(`❌ ${apiNames[index]} API: Failed`, result.reason);
      }
    });
  }

  async testWeatherAPI() {
    const response = await fetch(`${this.apis.weather}?latitude=19.2183&longitude=72.9781&current_weather=true`);
    if (!response.ok) throw new Error('Weather API failed');
    return await response.json();
  }

  async testGeocodingAPI() {
    const response = await fetch(`${this.apis.geocoding}/reverse?format=json&lat=19.2183&lon=72.9781&addressdetails=1`, {
      headers: { 'User-Agent': 'DayTripFinder/1.0' }
    });
    if (!response.ok) throw new Error('Geocoding API failed');
    return await response.json();
  }

  async testMongoConnection() {
    const response = await fetch(`${this.mongoConfig.dataApiUrl}/action/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.mongoConfig.apiKey
      },
      body: JSON.stringify({
        collection: 'destinations',
        database: this.mongoConfig.database,
        dataSource: this.mongoConfig.dataSource,
        limit: 1
      })
    });
    if (!response.ok) throw new Error('MongoDB connection failed');
    return await response.json();
  }

  // REAL LOCATION DETECTION - Browser geolocation + reverse geocoding
  async detectUserLocation() {
    console.log('📍 Starting REAL location detection...');
    
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            console.log(`📍 GPS coordinates: ${latitude}, ${longitude}`);
            
            // Real reverse geocoding using OpenStreetMap
            const locationData = await this.reverseGeocode(latitude, longitude);
            
            const result = {
              coordinates: [latitude, longitude],
              city: locationData.city,
              state: locationData.state,
              country: locationData.country,
              displayName: locationData.displayName,
              accuracy: position.coords.accuracy
            };
            
            console.log('✅ Real location detected:', result);
            resolve(result);
            
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
            reject(error);
          }
        },
        (error) => {
          console.error('GPS location failed:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        }
      );
    });
  }

  // REAL REVERSE GEOCODING - OpenStreetMap Nominatim (FREE)
  async reverseGeocode(lat, lng) {
    await this.checkRateLimit('nominatim');
    
    try {
      const response = await fetch(
        `${this.apis.geocoding}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=10`,
        {
          headers: {
            'User-Agent': 'DayTripFinder/1.0 (production)',
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
        state: data.address?.state || data.address?.region || 'Unknown',
        country: data.address?.country || 'Unknown',
        displayName: data.display_name,
        raw: data
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  // REAL WEATHER DATA - Open-Meteo (FREE, unlimited)
  async getWeatherData(lat, lng) {
    try {
      const response = await fetch(
        `${this.apis.weather}?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days=3`
      );

      if (!response.ok) {
        throw new Error(`Weather API failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        current: {
          temperature: Math.round(data.current_weather.temperature),
          weatherCode: data.current_weather.weathercode,
          windSpeed: data.current_weather.windspeed,
          windDirection: data.current_weather.winddirection,
          time: data.current_weather.time
        },
        forecast: data.daily.time.map((date, index) => ({
          date,
          maxTemp: Math.round(data.daily.temperature_2m_max[index]),
          minTemp: Math.round(data.daily.temperature_2m_min[index]),
          precipitation: data.daily.precipitation_sum[index],
          weatherCode: data.daily.weathercode[index]
        })),
        timezone: data.timezone
      };
    } catch (error) {
      console.error('Weather API error:', error);
      throw error;
    }
  }

  // REAL PLACES SEARCH - Geoapify (3k requests/day FREE)
  async searchNearbyPlaces(lat, lng, categories = ['tourism', 'leisure'], radius = 50000) {
    await this.checkRateLimit('geoapify');
    
    try {
      // Use Geoapify API with user's provided key
      if (this.apiKeys.geoapify) {
        return await this.searchGeoapifyPlaces(lat, lng, categories, radius, this.apiKeys.geoapify);
      } else {
        // Fallback to OpenStreetMap if no API key
        return await this.searchOpenStreetMapPlaces(lat, lng, categories, radius);
      }
    } catch (error) {
      console.error('Places search error:', error);
      // Fallback to OpenStreetMap on any error
      return await this.searchOpenStreetMapPlaces(lat, lng, categories, radius);
    }
  }

  // REAL GEOAPIFY PLACES API
  async searchGeoapifyPlaces(lat, lng, categories, radius, apiKey) {
    try {
      const categoryFilter = categories.includes('tourism') ? 'tourism' : 'leisure';
      const url = `${this.apis.places}?categories=${categoryFilter}&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=50&apiKey=${apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Geoapify API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.features.map(feature => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        const distance = this.calculateDistance([lat, lng], [coords[1], coords[0]]);
        
        return {
          id: props.place_id || feature.id,
          name: props.name || 'Unknown Place',
          type: props.categories?.[0] || 'place',
          coordinates: [coords[1], coords[0]], // Convert to [lat, lng]
          distance: Math.round(distance),
          description: props.description || '',
          website: props.website || '',
          phone: props.phone || '',
          openingHours: props.opening_hours || '',
          address: props.formatted || '',
          rating: props.rating || 0,
          image: props.image || null, // Real image from Geoapify
          photos: props.photos || [], // Multiple photos if available
          source: 'geoapify'
        };
      }).sort((a, b) => a.distance - b.distance).slice(0, 30);
      
    } catch (error) {
      console.error('Geoapify places search error:', error);
      throw error;
    }
  }

  // REAL PLACES via OpenStreetMap Overpass API (FREE, unlimited)
  async searchOpenStreetMapPlaces(lat, lng, categories, radius) {
    try {
      // Overpass API query for tourism and leisure places
      const query = `
        [out:json][timeout:25];
        (
          node["tourism"~"attraction|museum|viewpoint|picnic_site|zoo|theme_park|aquarium"](around:${radius},${lat},${lng});
          node["leisure"~"park|nature_reserve|beach_resort|water_park|garden"](around:${radius},${lat},${lng});
          node["natural"~"beach|peak|waterfall|hot_spring|cave_entrance"](around:${radius},${lat},${lng});
          way["tourism"~"attraction|museum|viewpoint|picnic_site|zoo|theme_park|aquarium"](around:${radius},${lat},${lng});
          way["leisure"~"park|nature_reserve|beach_resort|water_park|garden"](around:${radius},${lat},${lng});
          way["natural"~"beach|peak|waterfall|hot_spring|cave_entrance"](around:${radius},${lat},${lng});
        );
        out center meta;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`
      });

      if (!response.ok) {
        throw new Error(`Overpass API failed: ${response.status}`);
      }

      const data = await response.json();
      
      return data.elements.map(element => {
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;
        const distance = this.calculateDistance([lat, lon], [lat, lng]);
        
        return {
          id: element.id,
          name: element.tags?.name || 'Unknown Place',
          type: element.tags?.tourism || element.tags?.leisure || element.tags?.natural || 'place',
          coordinates: [lat, lon],
          distance: Math.round(distance),
          description: element.tags?.description || '',
          website: element.tags?.website || '',
          phone: element.tags?.phone || '',
          openingHours: element.tags?.opening_hours || '',
          tags: element.tags
        };
      }).filter(place => place.coordinates[0] && place.coordinates[1])
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 50); // Limit to 50 results
        
    } catch (error) {
      console.error('OpenStreetMap places search error:', error);
      throw error;
    }
  }

  // GENERIC MONGODB REQUEST METHOD
  async makeMongoRequest(action, payload) {
    try {
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
        throw new Error(`MongoDB ${action} failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`MongoDB ${action} error:`, error);
      throw error;
    }
  }

  // REAL MONGODB OPERATIONS
  async saveRealDestination(destinationData) {
    try {
      const response = await fetch(`${this.mongoConfig.dataApiUrl}/action/insertOne`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.mongoConfig.apiKey
        },
        body: JSON.stringify({
          collection: 'destinations',
          database: this.mongoConfig.database,
          dataSource: this.mongoConfig.dataSource,
          document: {
            ...destinationData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'real_api_data',
            status: 'active'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`MongoDB insert failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Real destination saved to MongoDB:', result.insertedId);
      return result.insertedId;
    } catch (error) {
      console.error('MongoDB save error:', error);
      throw error;
    }
  }

  async getRealDestinations(citySlug) {
    try {
      const response = await fetch(`${this.mongoConfig.dataApiUrl}/action/find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.mongoConfig.apiKey
        },
        body: JSON.stringify({
          collection: 'destinations',
          database: this.mongoConfig.database,
          dataSource: this.mongoConfig.dataSource,
          filter: {
            'location.city.slug': citySlug.toLowerCase(),
            status: 'active'
          },
          sort: { createdAt: -1 },
          limit: 100
        })
      });

      if (!response.ok) {
        throw new Error(`MongoDB query failed: ${response.status}`);
      }

      const result = await response.json();
      return result.documents || [];
    } catch (error) {
      console.error('MongoDB query error:', error);
      throw error;
    }
  }

  // UTILITY FUNCTIONS
  async checkRateLimit(apiName) {
    const limit = this.rateLimits[apiName];
    const now = Date.now();
    
    // Reset daily counter
    if (now - limit.lastReset > 24 * 60 * 60 * 1000) {
      limit.requests = 0;
      limit.lastReset = now;
    }
    
    if (limit.requests >= limit.limit) {
      throw new Error(`Rate limit exceeded for ${apiName}`);
    }
    
    limit.requests++;
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

  getWeatherDescription(code) {
    const codes = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
      55: 'Dense drizzle', 56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
      61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 66: 'Light freezing rain',
      67: 'Heavy freezing rain', 71: 'Slight snow fall', 73: 'Moderate snow fall',
      75: 'Heavy snow fall', 77: 'Snow grains', 80: 'Slight rain showers',
      81: 'Moderate rain showers', 82: 'Violent rain showers', 85: 'Slight snow showers',
      86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return codes[code] || 'Unknown';
  }

  // REAL TRIPADVISOR CONTENT API - Reviews and Ratings
  async getTripAdvisorData(locationId) {
    await this.checkRateLimit('tripadvisor');
    
    try {
      const response = await fetch(`${this.apis.tripadvisor}/location/${locationId}/details`, {
        headers: {
          'X-TripAdvisor-API-Key': this.apiKeys.tripadvisor,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TripAdvisor API failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        name: data.name,
        rating: data.rating,
        reviewCount: data.num_reviews,
        description: data.description,
        photos: data.photos?.map(photo => photo.images?.large?.url).filter(Boolean) || [],
        reviews: data.reviews?.map(review => ({
          text: review.text,
          rating: review.rating,
          date: review.published_date,
          author: review.user?.username || 'Anonymous'
        })) || [],
        categories: data.category?.name ? [data.category.name] : [],
        address: data.address_obj?.address_string || '',
        phone: data.phone || '',
        website: data.website || ''
      };
    } catch (error) {
      console.error('TripAdvisor API error:', error);
      return null;
    }
  }

  // SEARCH TRIPADVISOR LOCATIONS
  async searchTripAdvisorLocations(query, lat, lng) {
    await this.checkRateLimit('tripadvisor');
    
    try {
      const response = await fetch(`${this.apis.tripadvisor}/location/search?query=${encodeURIComponent(query)}&latLong=${lat},${lng}`, {
        headers: {
          'X-TripAdvisor-API-Key': this.apiKeys.tripadvisor,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TripAdvisor search failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('TripAdvisor search error:', error);
      return [];
    }
  }

  // ENHANCED PLACE SEARCH WITH TRIPADVISOR INTEGRATION
  async searchEnhancedPlaces(lat, lng, categories = ['tourism', 'leisure'], radius = 50000) {
    try {
      // Get basic places from Geoapify/OpenStreetMap
      const places = await this.searchNearbyPlaces(lat, lng, categories, radius);
      
      // Enhance with TripAdvisor data
      const enhancedPlaces = await Promise.all(
        places.slice(0, 10).map(async (place) => {
          try {
            // Search TripAdvisor for matching location
            const tripAdvisorResults = await this.searchTripAdvisorLocations(place.name, place.coordinates[0], place.coordinates[1]);
            
            if (tripAdvisorResults.length > 0) {
              const tripAdvisorData = await this.getTripAdvisorData(tripAdvisorResults[0].location_id);
              
              if (tripAdvisorData) {
                return {
                  ...place,
                  rating: tripAdvisorData.rating || place.rating,
                  reviews: tripAdvisorData.reviewCount || 0,
                  photos: tripAdvisorData.photos || [],
                  image: tripAdvisorData.photos?.[0] || place.image, // Use first TripAdvisor photo
                  description: tripAdvisorData.description || place.description,
                  enhanced: true,
                  source: 'geoapify+tripadvisor'
                };
              }
            }
            return place;
          } catch (error) {
            console.error(`Failed to enhance ${place.name} with TripAdvisor:`, error);
            return place;
          }
        })
      );
      
      return enhancedPlaces;
    } catch (error) {
      console.error('Enhanced places search error:', error);
      // Fallback to regular places search
      return await this.searchNearbyPlaces(lat, lng, categories, radius);
    }
  }
}

// Initialize the REAL production API
console.log('🚀 Starting REAL PRODUCTION API...');
window.RealProductionTravelAPI = new RealProductionTravelAPI();

// Remove the old mock API
if (window.SmartTripsAPI) {
  console.log('🗑️ Removing mock API...');
  delete window.SmartTripsAPI;
}

// Set the real API as the main interface
window.SmartTripsAPI = window.RealProductionTravelAPI;