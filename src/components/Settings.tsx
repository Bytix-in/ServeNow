import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react';

export default function Settings() {
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
            <div>
              <label className="block text-sm font-medium text-black mb-2">Manager Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="Enter manager name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">Phone</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="Enter phone number"
              />
            </div>
            
            <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Update Profile
            </button>
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

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-5 h-5 text-black" />
            <h2 className="text-xl font-semibold text-black">Security</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Current Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="Enter current password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">Confirm Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="Confirm new password"
              />
            </div>
            
            <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Change Password
            </button>
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