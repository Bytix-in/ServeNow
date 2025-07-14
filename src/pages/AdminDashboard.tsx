import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Users, Eye, Activity } from 'lucide-react';
import { supabase, Restaurant } from '../lib/supabase';

import AdminSidebar from '../components/AdminSidebar';
import AddRestaurant from '../components/AddRestaurant';
import AdminAnalytics from '../components/AdminAnalytics';
import AdminSettings from '../components/AdminSettings';

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminLoggedIn')) {
      navigate('/admin/login');
      return;
    }
    
    loadRestaurants();
  }, [navigate]);

  const loadRestaurants = async () => {
    try {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading restaurants:', error);
        return;
      }

      setAllRestaurants(restaurants || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    localStorage.removeItem('adminLoggedIn');
    navigate('/');
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleViewRestaurant = (managerId: string) => {
    // Use the restaurant ID directly for the URL
    navigate(`/admin/restaurant/${managerId}`);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'add-restaurant':
        return <AddRestaurant />;
      case 'analytics':
        return <AdminAnalytics restaurants={allRestaurants} />;
      case 'settings':
        return <AdminSettings />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your restaurant management system.</p>
      </div>

      {/* System Overview */}
      <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-black mb-6 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          System Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-1">{allRestaurants.length}</div>
            <div className="text-sm text-gray-600">Total Restaurants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {allRestaurants.filter(r => r.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Active Now</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {allRestaurants.filter(r => !r.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {allRestaurants.filter(r => r.last_login).length}
            </div>
            <div className="text-sm text-gray-600">Ever Logged In</div>
          </div>
        </div>
      </div>

      {/* Restaurant Listings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-black" />
            <h2 className="text-xl font-semibold text-black">All Restaurants</h2>
          </div>
          <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
            {allRestaurants.length}
          </span>
        </div>

        {allRestaurants.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allRestaurants.map((restaurant) => (
              <div
                key={restaurant.manager_id}
                onClick={() => handleViewRestaurant(restaurant.manager_id)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-black truncate">{restaurant.restaurant_name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${restaurant.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className={`text-xs font-medium ${restaurant.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                      {restaurant.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">ID: {restaurant.manager_id}</p>
                <p className="text-sm text-gray-500">{restaurant.owner_name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    Created: {new Date(restaurant.created_at).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleViewRestaurant(restaurant.manager_id)}
                    className="text-xs text-black hover:underline flex items-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No restaurants created yet</p>
            <p className="text-sm text-gray-400">Create your first restaurant to get started</p>
            <button
              onClick={() => setCurrentPage('add-restaurant')}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Restaurant
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      
      <div className="flex-1 overflow-auto">
        {renderCurrentPage()}
      </div>
    </div>
  );
}