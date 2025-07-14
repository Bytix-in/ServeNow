import React, { useState } from 'react';
import { Copy, CheckCircle, Plus } from 'lucide-react';
import { supabase, generateManagerCredentials, logActivity } from '../lib/supabase';

interface RestaurantData {
  restaurantName: string;
  ownerName: string;
  phoneNumber: string;
  email: string;
  address: string;
  cuisineTags: string;
  seatingCapacity: number;
}

interface CreatedRestaurant {
  managerId: string;
  accessKey: string;
  restaurantName: string;
}

export default function AddRestaurant() {
  const [formData, setFormData] = useState<RestaurantData>({
    restaurantName: '',
    ownerName: '',
    phoneNumber: '',
    email: '',
    address: '',
    cuisineTags: '',
    seatingCapacity: 0,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [createdRestaurant, setCreatedRestaurant] = useState<CreatedRestaurant | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Generate credentials
      const { managerId, accessKey } = generateManagerCredentials();

      // Insert restaurant into Supabase
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .insert({
          manager_id: managerId,
          access_key: accessKey,
          restaurant_name: formData.restaurantName,
          owner_name: formData.ownerName,
          phone_number: formData.phoneNumber,
          email: formData.email,
          address: formData.address,
          cuisine_tags: formData.cuisineTags,
          seating_capacity: formData.seatingCapacity,
          is_active: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log restaurant creation activity
      await logActivity('restaurant_created', {
        restaurant_name: formData.restaurantName,
        manager_id: managerId,
        owner_name: formData.ownerName
      });
      // Set created restaurant for display
      setCreatedRestaurant({
        managerId,
        accessKey,
        restaurantName: formData.restaurantName,
      });
      
      // Reset form
      setFormData({
        restaurantName: '',
        ownerName: '',
        phoneNumber: '',
        email: '',
        address: '',
        cuisineTags: '',
        seatingCapacity: 0,
      });

    } catch (err) {
      setError('Failed to create restaurant. Please try again.');
      console.error('Restaurant creation error:', err);
    }
    
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    });
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Plus className="w-6 h-6 text-black" />
          <h1 className="text-2xl font-bold text-black">Add New Restaurant</h1>
        </div>
        <p className="text-gray-600">Create a new restaurant and generate manager credentials</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Add Restaurant Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-black mb-6">Restaurant Details</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="restaurantName" className="block text-sm font-medium text-black mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                id="restaurantName"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-black mb-1">
                Owner Name
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-black mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-black mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="cuisineTags" className="block text-sm font-medium text-black mb-1">
                Cuisine Tags (comma-separated)
              </label>
              <input
                type="text"
                id="cuisineTags"
                name="cuisineTags"
                value={formData.cuisineTags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="Italian, Pizza, Fine Dining"
                required
              />
            </div>

            <div>
              <label htmlFor="seatingCapacity" className="block text-sm font-medium text-black mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                id="seatingCapacity"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                min="1"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Restaurant'}
            </button>
          </form>
        </div>

        {/* Restaurant Credentials */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-black mb-6">Generated Credentials</h2>
          
          {createdRestaurant ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-700 font-medium">
                  Restaurant "{createdRestaurant.restaurantName}" created successfully!
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Manager ID
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={createdRestaurant.managerId}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(createdRestaurant.managerId, 'managerId')}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {copiedField === 'managerId' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Access Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={createdRestaurant.accessKey}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(createdRestaurant.accessKey, 'accessKey')}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {copiedField === 'accessKey' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-700 text-sm">
                  <strong>Important:</strong> Please save these credentials securely. The manager will need both the Manager ID and Access Key to access their restaurant management system.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No credentials generated yet</p>
              <p className="text-sm text-gray-400">Fill out the form and create a restaurant to generate credentials</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}