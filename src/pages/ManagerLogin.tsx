import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Key, Eye, EyeOff } from 'lucide-react';
import { supabase, logActivity } from '../lib/supabase';

export default function ManagerLogin() {
  const [formData, setFormData] = useState({
    managerId: '',
    accessKey: '',
  });
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Query Supabase for restaurant with matching credentials
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('manager_id', formData.managerId)
        .eq('access_key', formData.accessKey)
        .single();

      if (error || !restaurant) {
        setError('Invalid Manager ID or Access Key. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Update restaurant status and last login
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ 
          is_active: true, 
          last_login: new Date().toISOString() 
        })
        .eq('id', restaurant.id);

      if (updateError) {
        console.error('Error updating restaurant status:', updateError);
      }

      // Log manager login activity
      await logActivity(
        'manager_login', 
        { 
          restaurant_name: restaurant.restaurant_name,
          manager_id: formData.managerId 
        },
        restaurant.id,
        formData.managerId
        );
        
      // Store manager session
      localStorage.setItem('managerLoggedIn', 'true');
      localStorage.setItem('currentRestaurantId', restaurant.id);
      localStorage.setItem('currentManagerId', formData.managerId);
      
      navigate('/manager/dashboard');
      setIsLoading(false);
    } catch (err) {
      setError('Login failed. Please try again.');
      setIsLoading(false);
      console.error('Manager login error:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
            aria-label="Go back"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manager Portal</h1>
            <p className="text-gray-600">Access your restaurant dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="managerId" className="block text-sm font-semibold text-gray-900 mb-2">
                Manager ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="managerId"
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="MGR_XXXXXX"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="accessKey" className="block text-sm font-semibold text-gray-900 mb-2">
                Access Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showAccessKey ? 'text' : 'password'}
                  id="accessKey"
                  name="accessKey"
                  value={formData.accessKey}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter your access key"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAccessKey(!showAccessKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showAccessKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm font-medium mb-2">Need Help?</p>
              <p className="text-blue-700 text-xs">
                Contact your administrator if you don't have your Manager ID and Access Key.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}