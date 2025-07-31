// Vercel Serverless Function for Destinations API
// Uses MongoDB Data API with your provided keys

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // MongoDB Data API configuration
  const MONGODB_CONFIG = {
    DATA_API_URL: 'https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1', // Replace with your Data API URL
    API_KEY: 'fec4a8b8-f3ba-4722-b7e6-ee8fbbc82486', // Your private key
    CLUSTER_NAME: 'Cluster0', // Your cluster name
    DATABASE_NAME: 'onepage_ecosystem'
  };

  try {
    if (req.method === 'GET') {
      // GET /api/destinations?city=mumbai&radius=200000
      const { city, radius = 200000, categories, maxCost } = req.query;
      
      if (city) {
        // Find destinations by city
        const filter = { "location.city.slug": city.toLowerCase() };
        
        if (categories) {
          filter["details.categories"] = { $in: categories.split(',') };
        }
        
        if (maxCost) {
          filter["details.cost.average"] = { $lte: parseInt(maxCost) };
        }
        
        const response = await fetch(`${MONGODB_CONFIG.DATA_API_URL}/action/find`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': MONGODB_CONFIG.API_KEY
          },
          body: JSON.stringify({
            collection: 'destinations',
            database: MONGODB_CONFIG.DATABASE_NAME,
            dataSource: MONGODB_CONFIG.CLUSTER_NAME,
            filter: filter,
            sort: { "ai.score": -1 },
            limit: 20
          })
        });
        
        const data = await response.json();
        
        if (data.documents) {
          return res.status(200).json({
            destinations: data.documents.map(transformDestination),
            count: data.documents.length
          });
        } else {
          return res.status(404).json({ error: 'No destinations found', city });
        }
      }
      
      // List all destinations if no city specified
      const response = await fetch(`${MONGODB_CONFIG.DATA_API_URL}/action/find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': MONGODB_CONFIG.API_KEY
        },
        body: JSON.stringify({
          collection: 'destinations',
          database: MONGODB_CONFIG.DATABASE_NAME,
          dataSource: MONGODB_CONFIG.CLUSTER_NAME,
          filter: { status: 'active' },
          sort: { "ai.score": -1 },
          limit: 50
        })
      });
      
      const data = await response.json();
      
      return res.status(200).json({
        destinations: data.documents ? data.documents.map(transformDestination) : [],
        count: data.documents ? data.documents.length : 0
      });
    }
    
    if (req.method === 'POST') {
      const { action } = req.body;
      
      if (action === 'nearby') {
        // POST /api/destinations with { action: 'nearby', coordinates: [lat, lng], radius: 200000 }
        const { coordinates, radius = 200000, categories = [], limit = 20 } = req.body;
        
        if (!coordinates || coordinates.length !== 2) {
          return res.status(400).json({ error: 'Valid coordinates required' });
        }
        
        // MongoDB geospatial query
        const pipeline = [
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [coordinates[1], coordinates[0]] // MongoDB expects [lng, lat]
              },
              distanceField: "distance",
              maxDistance: radius,
              spherical: true,
              query: { status: "active" }
            }
          }
        ];
        
        // Add category filter if specified
        if (categories.length > 0) {
          pipeline.push({
            $match: { "details.categories": { $in: categories } }
          });
        }
        
        // Sort by AI score and limit results
        pipeline.push(
          { $sort: { "ai.score": -1 } },
          { $limit: limit }
        );
        
        const response = await fetch(`${MONGODB_CONFIG.DATA_API_URL}/action/aggregate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': MONGODB_CONFIG.API_KEY
          },
          body: JSON.stringify({
            collection: 'destinations',
            database: MONGODB_CONFIG.DATABASE_NAME,
            dataSource: MONGODB_CONFIG.CLUSTER_NAME,
            pipeline: pipeline
          })
        });
        
        const data = await response.json();
        
        if (data.documents) {
          const enhancedDestinations = data.documents.map(dest => {
            const transformed = transformDestination(dest);
            
            // Add distance and travel time calculations
            transformed.distance = Math.round(dest.distance / 1000); // Convert to km
            transformed.travelTime = estimateTravelTime(transformed.distance);
            transformed.relevanceScore = calculateRelevanceScore(dest, transformed.distance);
            
            return transformed;
          });
          
          // Sort by relevance score
          enhancedDestinations.sort((a, b) => b.relevanceScore - a.relevanceScore);
          
          return res.status(200).json({
            destinations: enhancedDestinations,
            count: enhancedDestinations.length,
            searchLocation: coordinates
          });
        }
        
        return res.status(404).json({ error: 'No nearby destinations found' });
      }
      
      if (action === 'search') {
        // POST /api/destinations with { action: 'search', query: 'waterfall', filters: {...} }
        const { query, filters = {} } = req.body;
        
        const searchFilter = {
          status: 'active',
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { "ai.tags": { $in: [query.toLowerCase()] } }
          ]
        };
        
        // Apply additional filters
        if (filters.categories) {
          searchFilter["details.categories"] = { $in: filters.categories };
        }
        
        if (filters.maxCost) {
          searchFilter["details.cost.average"] = { $lte: filters.maxCost };
        }
        
        if (filters.familyFriendly !== undefined) {
          searchFilter["details.familyFriendly"] = filters.familyFriendly;
        }
        
        if (filters.minRating) {
          searchFilter["social.rating.overall"] = { $gte: filters.minRating };
        }
        
        const response = await fetch(`${MONGODB_CONFIG.DATA_API_URL}/action/find`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': MONGODB_CONFIG.API_KEY
          },
          body: JSON.stringify({
            collection: 'destinations',
            database: MONGODB_CONFIG.DATABASE_NAME,
            dataSource: MONGODB_CONFIG.CLUSTER_NAME,
            filter: searchFilter,
            sort: { "ai.score": -1 },
            limit: 30
          })
        });
        
        const data = await response.json();
        
        return res.status(200).json({
          results: data.documents ? data.documents.map(transformDestination) : [],
          query,
          count: data.documents ? data.documents.length : 0
        });
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Transform MongoDB document to frontend format
function transformDestination(dest) {
  return {
    id: dest._id,
    name: dest.name,
    description: dest.description,
    distance: dest.location?.nearbyMajorCities?.[0]?.distance ? `${dest.location.nearbyMajorCities[0].distance} km` : 'Unknown',
    time: dest.details?.duration?.travel ? `${Math.floor(dest.details.duration.travel / 60)} hours` : 'Unknown',
    cost: dest.details?.cost?.average || 0,
    category: dest.details?.categories?.[0] || 'general',
    activities: dest.details?.activities?.map(a => a.name) || [],
    season: dest.details?.bestSeason || 'year-round',
    familyFriendly: dest.details?.familyFriendly || false,
    aiScore: dest.ai?.score || 0,
    crowdLevel: dest.details?.crowdLevel || 'unknown',
    bestTime: dest.details?.bestTime || 'flexible',
    rating: dest.social?.rating?.overall || 0,
    images: dest.social?.photos?.map(p => p.url) || [],
    tips: dest.tips || [],
    coordinates: dest.location?.coordinates || []
  };
}

// Estimate travel time based on distance
function estimateTravelTime(distanceKm) {
  const avgSpeed = 50; // km/h
  const timeHours = distanceKm / avgSpeed;
  
  if (timeHours < 1) {
    return `${Math.round(timeHours * 60)} min`;
  } else {
    const hours = Math.floor(timeHours);
    const minutes = Math.round((timeHours - hours) * 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

// Calculate relevance score for sorting
function calculateRelevanceScore(dest, distanceKm) {
  const distanceScore = Math.max(0, 100 - (distanceKm / 2)); // Closer = better
  const ratingScore = (dest.social?.rating?.overall || 0) * 20; // Max 100
  const popularityScore = (dest.ai?.popularity || 0) * 10; // Max 100
  const trendingBonus = dest.ai?.trending ? 20 : 0;
  
  return distanceScore * 0.4 + ratingScore * 0.3 + popularityScore * 0.2 + trendingBonus * 0.1;
}