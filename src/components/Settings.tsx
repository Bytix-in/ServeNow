import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Palette } from 'lucide-react';
import { supabase, Restaurant as RestaurantType } from '../lib/supabase';

export default function Settings() {
  const [restaurant, setRestaurant] = useState<RestaurantType | null>(null);
  const [form, setForm] = useState({
    owner_name: '',
    email: '',
    phone_number: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const restaurantId = localStorage.getItem('currentRestaurantId');
        if (!restaurantId) {
          setError('Restaurant ID not found. Please log in again.');
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
        if (error || !data) {
          setError('Failed to fetch restaurant details.');
          setLoading(false);
          return;
        }
        setRestaurant(data);
        setForm({
          owner_name: data.owner_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          address: data.address || '',
        });
      } catch (err) {
        setError('An error occurred while fetching restaurant details.');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!restaurant || !restaurant.id) return;
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          owner_name: form.owner_name,
          email: form.email,
          phone_number: form.phone_number,
          address: form.address,
        })
        .eq('id', restaurant.id);
      if (error) {
        setError('Failed to update profile.');
        return;
      }
      setSuccess('Profile updated successfully!');
      setRestaurant({ ...restaurant, ...form });
    } catch (err) {
      setError('An error occurred while updating profile.');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <SettingsIcon className="w-6 h-6 text-black" />
          <h1 className="text-2xl font-bold text-black">Settings</h1>
        </div>
        <p className="text-gray-600">Manage your restaurant settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-5 h-5 text-black" />
            <h2 className="text-xl font-semibold text-black">Profile Settings</h2>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-gray-500">Loading profile...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : restaurant ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Restaurant Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    value={restaurant.restaurant_name}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Manager Name</label>
                  <input
                    type="text"
                    name="owner_name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={form.owner_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone_number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={form.phone_number}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Cuisine Tags</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    value={restaurant.cuisine_tags}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Seating Capacity</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    value={restaurant.seating_capacity}
                    readOnly
                  />
                </div>
                {success && <div className="text-green-600">{success}</div>}
                <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                  Update Profile
                </button>
              </form>
            ) : null}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-5 h-5 text-black" />
            <h2 className="text-xl font-semibold text-black">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">New Orders</p>
                <p className="text-sm text-gray-600">Get notified when new orders arrive</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">Order Updates</p>
                <p className="text-sm text-gray-600">Updates on order status changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">Daily Reports</p>
                <p className="text-sm text-gray-600">Receive daily sales reports</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="w-5 h-5 text-black" />
            <h2 className="text-xl font-semibold text-black">Display</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Language</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Time Zone</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none">
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC-6 (Central Time)</option>
                <option>UTC-7 (Mountain Time)</option>
                <option>UTC-8 (Pacific Time)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Date Format</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}