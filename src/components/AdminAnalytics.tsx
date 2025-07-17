import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Store, Activity, Calendar } from 'lucide-react';
import { Restaurant } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface AdminAnalyticsProps {
  restaurants: Restaurant[];
}

export default function AdminAnalytics({ restaurants }: AdminAnalyticsProps) {
  const [analytics, setAnalytics] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalDishes: 0,
    totalTables: 0,
    totalSeatingCapacity: 0,
    recentLogins: 0,
    cuisineDistribution: {} as Record<string, number>,
    monthlyGrowth: [] as { month: string; count: number }[]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics(restaurants);
  }, [restaurants]);

  const fetchAnalytics = async (restaurantData: Restaurant[]) => {
    setLoading(true);
    setError(null);
    try {
      // Basic counts
      const totalRestaurants = restaurantData.length;
      const activeRestaurants = restaurantData.filter(r => r.is_active).length;
      const totalSeatingCapacity = restaurantData.reduce((sum, r) => sum + r.seating_capacity, 0);

      // Fetch all dishes and tables for all restaurants
      const restaurantIds = restaurantData.map(r => r.id);
      let totalDishes = 0;
      let totalTables = 0;

      // Fetch all dishes
      const { data: allDishes, error: dishesError } = await supabase
        .from('dishes')
        .select('id, restaurant_id');
      if (dishesError) throw new Error('Failed to fetch dishes: ' + dishesError.message);
      // Fetch all tables
      const { data: allTables, error: tablesError } = await supabase
        .from('tables')
        .select('id, restaurant_id');
      if (tablesError) throw new Error('Failed to fetch tables: ' + tablesError.message);
      // Filter by restaurantIds
      totalDishes = (allDishes || []).filter(d => restaurantIds.includes(d.restaurant_id)).length;
      totalTables = (allTables || []).filter(t => restaurantIds.includes(t.restaurant_id)).length;
      // Log API responses for debugging
      console.log('Dishes:', allDishes);
      console.log('Tables:', allTables);

      // Recent logins (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentLogins = restaurantData.filter(r =>
        r.last_login && new Date(r.last_login) > sevenDaysAgo
      ).length;

      // Cuisine distribution
      const cuisineDistribution: Record<string, number> = {};
      restaurantData.forEach(restaurant => {
        const cuisines = restaurant.cuisine_tags.split(',').map(c => c.trim());
        cuisines.forEach(cuisine => {
          cuisineDistribution[cuisine] = (cuisineDistribution[cuisine] || 0) + 1;
        });
      });

      // Monthly growth (last 6 months)
      const monthlyGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const count = restaurantData.filter(r => {
          const createdDate = new Date(r.created_at);
          return createdDate >= monthStart && createdDate <= monthEnd;
        }).length;
        monthlyGrowth.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count
        });
      }

      setAnalytics({
        totalRestaurants,
        activeRestaurants,
        totalDishes,
        totalTables,
        totalSeatingCapacity,
        recentLogins,
        cuisineDistribution,
        monthlyGrowth
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const topCuisines = Object.entries(analytics.cuisineDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mr-3"></div>
        <span className="text-gray-700">Loading analytics...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <BarChart3 className="w-6 h-6 text-black" />
          <h1 className="text-2xl font-bold text-black">Analytics Dashboard</h1>
        </div>
        <p className="text-gray-600">Comprehensive insights into your restaurant management system</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-black">{analytics.totalRestaurants}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Restaurants</h3>
          <p className="text-xs text-gray-500 mt-1">All registered restaurants</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600">{analytics.activeRestaurants}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Active Now</h3>
          <p className="text-xs text-gray-500 mt-1">Currently logged in</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{analytics.totalSeatingCapacity}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Seating</h3>
          <p className="text-xs text-gray-500 mt-1">Combined capacity</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{analytics.recentLogins}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Recent Logins</h3>
          <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Monthly Growth
          </h3>
          <div className="space-y-4">
            {analytics.monthlyGrowth.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{month.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max((month.count / Math.max(...analytics.monthlyGrowth.map(m => m.count))) * 100, 5)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-black w-8 text-right">{month.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cuisines */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-6">Popular Cuisines</h3>
          <div className="space-y-4">
            {topCuisines.length > 0 ? (
              topCuisines.map(([cuisine, count], index) => (
                <div key={cuisine} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' :
                      'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-black">{cuisine}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-black h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(count / Math.max(...Object.values(analytics.cuisineDistribution))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-black w-6 text-right">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No cuisine data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-black mb-6">System Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">{analytics.totalDishes}</div>
            <div className="text-sm text-gray-600">Total Menu Items</div>
            <div className="text-xs text-gray-500 mt-1">Across all restaurants</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">{analytics.totalTables}</div>
            <div className="text-sm text-gray-600">Total Tables</div>
            <div className="text-xs text-gray-500 mt-1">Configured tables</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">
              {analytics.totalRestaurants > 0 ? Math.round(analytics.totalSeatingCapacity / analytics.totalRestaurants) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg. Seating</div>
            <div className="text-xs text-gray-500 mt-1">Per restaurant</div>
          </div>
        </div>
      </div>
    </div>
  );
}