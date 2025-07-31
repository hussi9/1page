// Analytics API for location-based insights
// Uses MongoDB Data API with aggregation pipelines

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // MongoDB configuration
  const MONGODB_CONFIG = {
    DATA_API_URL: 'https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1', // Replace with your Data API URL
    API_KEY: 'fec4a8b8-f3ba-4722-b7e6-ee8fbbc82486', // Your private key
    CLUSTER_NAME: 'Cluster0',
    DATABASE_NAME: 'onepage_ecosystem'
  };

  try {
    if (req.method === 'GET') {
      const { city } = req.query;
      
      if (!city) {
        return res.status(400).json({ error: 'City parameter required' });
      }
      
      // Aggregation pipeline for analytics
      const pipeline = [
        // Match destinations for the specified city
        {
          $match: {
            "location.city.slug": city.toLowerCase(),
            "status": "active"
          }
        },
        
        // Group by various dimensions for analytics
        {
          $group: {
            _id: null,
            totalDestinations: { $sum: 1 },
            avgCost: { $avg: "$details.cost.average" },
            minCost: { $min: "$details.cost.average" },
            maxCost: { $max: "$details.cost.average" },
            avgRating: { $avg: "$social.rating.overall" },
            familyFriendlyCount: {
              $sum: {
                $cond: [{ $eq: ["$details.familyFriendly", true] }, 1, 0]
              }
            },
            categories: { $push: "$details.categories" },
            seasons: { $push: "$details.bestSeason" },
            costs: { $push: "$details.cost.average" }
          }
        }
      ];
      
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
      
      if (data.documents && data.documents.length > 0) {
        const stats = data.documents[0];
        
        // Process the data for frontend
        const analytics = {
          totalDestinations: stats.totalDestinations,
          avgCost: Math.round(stats.avgCost || 0),
          familyScore: Math.round((stats.familyFriendlyCount / stats.totalDestinations) * 100),
          bestSeason: getMostCommonSeason(stats.seasons),
          costDistribution: getCostDistribution(stats.costs),
          categoryBreakdown: getCategoryBreakdown(stats.categories),
          ratingStats: {
            average: Math.round((stats.avgRating || 0) * 10) / 10,
            min: 1,
            max: 5
          },
          priceRange: {
            min: stats.minCost || 0,
            max: stats.maxCost || 0,
            average: Math.round(stats.avgCost || 0)
          }
        };
        
        return res.status(200).json({
          city: city,
          stats: analytics,
          lastUpdated: new Date().toISOString()
        });
      } else {
        return res.status(404).json({ 
          error: 'No data found for city',
          city: city 
        });
      }
    }
    
    if (req.method === 'POST') {
      const { action, coordinates, radius = 200000 } = req.body;
      
      if (action === 'location-insights') {
        // Get insights for a specific location using geospatial query
        const pipeline = [
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [coordinates[1], coordinates[0]] // [lng, lat]
              },
              distanceField: "distance",
              maxDistance: radius,
              spherical: true,
              query: { status: "active" }
            }
          },
          {
            $group: {
              _id: null,
              totalDestinations: { $sum: 1 },
              avgCost: { $avg: "$details.cost.average" },
              avgDistance: { $avg: "$distance" },
              categories: { $push: "$details.categories" },
              activities: { $push: "$details.activities" },
              popularDestinations: {
                $push: {
                  name: "$name",
                  score: "$ai.score",
                  distance: "$distance"
                }
              }
            }
          }
        ];
        
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
        
        if (data.documents && data.documents.length > 0) {
          const insights = data.documents[0];
          
          return res.status(200).json({
            location: coordinates,
            radius: radius,
            insights: {
              totalNearby: insights.totalDestinations,
              avgCost: Math.round(insights.avgCost || 0),
              avgDistance: Math.round((insights.avgDistance || 0) / 1000), // Convert to km
              topCategories: getCategoryBreakdown(insights.categories).slice(0, 5),
              popularActivities: getActivityBreakdown(insights.activities).slice(0, 8),
              topDestinations: insights.popularDestinations
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map(dest => ({
                  name: dest.name,
                  score: dest.score,
                  distance: Math.round(dest.distance / 1000) + ' km'
                }))
            },
            generatedAt: new Date().toISOString()
          });
        }
        
        return res.status(404).json({ error: 'No destinations found in specified area' });
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Analytics API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Helper functions for data processing
function getMostCommonSeason(seasons) {
  if (!seasons || seasons.length === 0) return 'year-round';
  
  const seasonCount = seasons.reduce((acc, season) => {
    acc[season] = (acc[season] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(seasonCount).reduce((a, b) => 
    seasonCount[a] > seasonCount[b] ? a : b
  );
}

function getCostDistribution(costs) {
  if (!costs || costs.length === 0) return [0, 0, 0, 0];
  
  const ranges = [
    costs.filter(cost => cost < 1000).length,
    costs.filter(cost => cost >= 1000 && cost < 2000).length,
    costs.filter(cost => cost >= 2000 && cost < 3000).length,
    costs.filter(cost => cost >= 3000).length
  ];
  
  return ranges;
}

function getCategoryBreakdown(categoriesArray) {
  if (!categoriesArray || categoriesArray.length === 0) return [];
  
  const flatCategories = categoriesArray.flat();
  const categoryCount = flatCategories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

function getActivityBreakdown(activitiesArray) {
  if (!activitiesArray || activitiesArray.length === 0) return [];
  
  const flatActivities = activitiesArray.flat();
  const activityNames = flatActivities.map(activity => 
    typeof activity === 'string' ? activity : activity.name
  );
  
  const activityCount = activityNames.reduce((acc, activity) => {
    if (activity) {
      acc[activity] = (acc[activity] || 0) + 1;
    }
    return acc;
  }, {});
  
  return Object.entries(activityCount)
    .map(([activity, count]) => ({ activity, count }))
    .sort((a, b) => b.count - a.count);
}