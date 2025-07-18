import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminSettings() {
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      setLoading(true);
      setError(null);
      try {
        const email = localStorage.getItem('adminEmail');
        if (!email) {
          setError('Admin email not found in localStorage.');
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('admins')
          .select('name, email')
          .eq('email', email)
          .single();
        if (error || !data) {
          setError('Failed to fetch admin profile.');
          setLoading(false);
          return;
        }
        setAdmin({ name: data.name, email: data.email });
      } catch (err) {
        setError('An error occurred while fetching admin profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
    const email = localStorage.getItem('adminEmail');
    if (email) {
      const channel = supabase
        .channel('admins-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'admins',
            filter: `email=eq.${email}`
          },
          (payload) => {
            fetchAdmin();
          }
        )
        .subscribe();
      return () => {
        channel.unsubscribe();
      };
    }
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <SettingsIcon className="w-6 h-6 text-black" />
          <h1 className="text-2xl font-bold text-black">Admin Settings</h1>
        </div>
        <p className="text-gray-600">Manage system settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-5 h-5 text-black" />
            <h2 className="text-xl font-semibold text-black">Admin Profile</h2>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-gray-500">Loading profile...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : admin ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Admin Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-gray-100"
                    value={admin.name}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-gray-100"
                    value={admin.email}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="Enter phone number"
                    readOnly
                  />
                </div>
                <button className="w-full bg-black text-white py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed">
                  Update Profile
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="w-5 h-5 text-black" />
            <h2 className="text-xl font-semibold text-black">System Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">Auto-backup Data</p>
                <p className="text-sm text-gray-600">Automatically backup restaurant data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive system alerts via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">Maintenance Mode</p>
                <p className="text-sm text-gray-600">Temporarily disable new registrations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
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
                <p className="font-medium text-black">New Restaurant Registrations</p>
                <p className="text-sm text-gray-600">Get notified when new restaurants register</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">Manager Login Alerts</p>
                <p className="text-sm text-gray-600">Track manager login activities</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-black">System Updates</p>
                <p className="text-sm text-gray-600">Important system announcements</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="w-5 h-5 text-black" />
          <h2 className="text-xl font-semibold text-black">Data Management</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <div className="text-sm font-medium text-black mb-1">Export Data</div>
            <div className="text-xs text-gray-500">Download all restaurant data</div>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <div className="text-sm font-medium text-black mb-1">Import Data</div>
            <div className="text-xs text-gray-500">Upload restaurant data</div>
          </button>
          
          <button className="p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-center">
            <div className="text-sm font-medium text-red-600 mb-1">Clear All Data</div>
            <div className="text-xs text-red-500">Reset system (irreversible)</div>
          </button>
        </div>
      </div>
    </div>
  );
}