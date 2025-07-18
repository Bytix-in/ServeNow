import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Staff } from '../lib/supabase';
import toast from 'react-hot-toast';

const StaffLogin: React.FC = () => {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!staffId || !password) {
      setError('Please enter both Staff ID and password.');
      setLoading(false);
      return;
    }
    // Real authentication logic
    const { data, error: dbError } = await supabase
      .from<Staff>('staff')
      .select('*')
      .eq('staff_id', staffId)
      .eq('password', password)
      .single();
    setLoading(false);
    if (dbError || !data) {
      setError('Invalid Staff ID or password.');
      toast.error('Invalid Staff ID or password.');
      return;
    }
    if (!data.is_active) {
      setError('This staff account is deactivated.');
      toast.error('This staff account is deactivated.');
      return;
    }
    // Store staff info in localStorage
    localStorage.setItem('staff', JSON.stringify(data));
    // Redirect based on role
    if (data.role === 'cook') {
      navigate('/cook/dashboard');
    } else if (data.role === 'waiter') {
      navigate('/waiter/dashboard');
    } else {
      setError('Unknown staff role.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Staff Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Staff ID</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={staffId}
              onChange={e => setStaffId(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffLogin; 