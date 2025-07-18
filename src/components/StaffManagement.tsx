import React, { useState, useEffect } from 'react';
import { supabase, Staff } from '../lib/supabase';
import { Plus, Eye, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface StaffManagementProps {
  restaurantId: string;
}

const generateStaffCredentials = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let staffId = 'STF_';
  for (let i = 0; i < 6; i++) staffId += chars.charAt(Math.floor(Math.random() * chars.length));
  let password = '';
  for (let i = 0; i < 8; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
  return { staffId, password };
};

export default function StaffManagement({ restaurantId }: StaffManagementProps) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    role: 'waiter',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCredentials, setNewCredentials] = useState<{ staffId: string; password: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) loadStaff();
  }, [restaurantId]);

  const loadStaff = async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
    if (!error) setStaffList(data || []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    const { staffId, password } = generateStaffCredentials();
    const payload = {
      restaurant_id: restaurantId,
      full_name: form.full_name,
      phone_number: form.phone_number,
      role: form.role,
      staff_id: staffId,
      password,
    };
    try {
      console.log('Creating staff with payload:', payload);
      const { error } = await supabase.from('staff').insert(payload);
      if (error) {
        // Handle duplicate phone or staff_id
        if (error.message && error.message.includes('duplicate')) {
          if (error.message.includes('phone_number')) {
            setError('A staff member with this phone number already exists.');
            toast.error('A staff member with this phone number already exists.');
          } else if (error.message.includes('staff_id')) {
            setError('A staff member with this ID already exists. Please try again.');
            toast.error('A staff member with this ID already exists. Please try again.');
          } else {
            setError('Duplicate entry detected.');
            toast.error('Duplicate entry detected.');
          }
        } else {
          setError(error.message || 'Failed to create staff');
          toast.error(error.message || 'Failed to create staff');
        }
        console.error('Staff creation error:', error);
        setCreating(false);
        return;
      }
      setNewCredentials({ staffId, password });
      setForm({ full_name: '', phone_number: '', role: 'waiter' });
      await loadStaff();
      toast.success('Staff created successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to create staff');
      toast.error(err.message || 'Failed to create staff');
      console.error('Staff creation exception:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };

  const toggleActive = async (staff: Staff) => {
    try {
      const { error } = await supabase
        .from('staff')
        .update({ is_active: !staff.is_active })
        .eq('id', staff.id);
      if (error) throw error;
      toast.success(`Staff ${!staff.is_active ? 'activated' : 'deactivated'}!`);
      await loadStaff();
    } catch (err: any) {
      toast.error('Failed to update staff status');
      console.error('Toggle active error:', err);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-2 flex items-center"><Plus className="w-6 h-6 mr-2" />Staff Management</h1>
        <p className="text-gray-600">Add and manage your restaurant staff (Waiters & Cooks)</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 max-w-xl">
        <h2 className="text-lg font-semibold text-black mb-4">Add New Staff</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Full Name</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
            <input name="phone_number" value={form.phone_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none">
              <option value="waiter">Waiter</option>
              <option value="cook">Cook</option>
            </select>
          </div>
          <button type="submit" disabled={creating} className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Plus className="w-4 h-4" />
            <span>{creating ? 'Creating...' : 'Add Staff'}</span>
          </button>
        </form>
        {newCredentials && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="mb-2 text-green-800 font-semibold flex items-center"><Eye className="w-4 h-4 mr-2" />Staff Credentials</div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono text-black">ID: {newCredentials.staffId}</span>
              <button onClick={() => handleCopy(newCredentials.staffId, 'id')} className="text-gray-400 hover:text-black"><Copy className="w-4 h-4" /></button>
              {copied === 'id' && <span className="text-xs text-green-600 ml-1">Copied!</span>}
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-black">Password: {newCredentials.password}</span>
              <button onClick={() => handleCopy(newCredentials.password, 'pw')} className="text-gray-400 hover:text-black"><Copy className="w-4 h-4" /></button>
              {copied === 'pw' && <span className="text-xs text-green-600 ml-1">Copied!</span>}
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-black mb-4">Current Staff</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Staff ID</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map(staff => (
                <tr key={staff.id} className="border-b">
                  <td className="px-4 py-2">{staff.full_name}</td>
                  <td className="px-4 py-2">{staff.phone_number}</td>
                  <td className="px-4 py-2 capitalize">{staff.role}</td>
                  <td className="px-4 py-2 font-mono">{staff.staff_id}</td>
                  <td className="px-4 py-2">{staff.is_active ? <span className="text-green-600">Active</span> : <span className="text-gray-400">Inactive</span>}</td>
                  <td className="px-4 py-2">{new Date(staff.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleActive(staff)}
                      className={`px-3 py-1 rounded text-xs font-semibold ${staff.is_active ? 'bg-gray-300 text-gray-700 hover:bg-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >
                      {staff.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-4">No staff added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 