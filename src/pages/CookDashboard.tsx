import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Order } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AssignedDish {
  orderId: string;
  dishName: string;
  tableNumber: number;
  status: string;
  customerName: string;
  assignedWaiterId?: string;
  cookStatus: string;
}

const CookDashboard: React.FC = () => {
  const [cookName, setCookName] = useState('');
  const [assignedDishes, setAssignedDishes] = useState<AssignedDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [cookRole, setCookRole] = useState('');
  const [updatingDish, setUpdatingDish] = useState<string | null>(null);

  useEffect(() => {
    console.log('[CookDashboard] useEffect mount');
    try {
      const staff = sessionStorage.getItem('staff');
      if (staff) {
        const parsed = JSON.parse(staff);
        console.log('[CookDashboard] Logged-in staff object:', parsed);
        setCookName(parsed.full_name);
        setCookRole(parsed.role || '');
        fetchAssignedDishes(parsed);
      } else {
        console.log('[CookDashboard] No staff session found, redirecting to login');
        navigate('/staff-login');
      }
    } catch (err) {
      console.error('[CookDashboard] Error in useEffect:', err);
      setError('Failed to load staff session.');
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [navigate]);

  const fetchAssignedDishes = async (cook: any) => {
    setLoading(true);
    setError('');
    try {
      console.log('[CookDashboard] fetchAssignedDishes called for cook:', cook);
      // Get all orders for the cook's restaurant
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', cook.restaurant_id);
      if (ordersError) throw ordersError;
      console.log('[CookDashboard] Fetched orders:', orders);
      // Flatten all assigned dishes for this cook using id (UUID)
      const assigned: AssignedDish[] = [];
      for (const order of orders) {
        for (const item of order.items) {
          if (item.assigned_cook_id === cook.id) {
            assigned.push({
              orderId: order.id,
              dishName: item.name,
              tableNumber: order.table_number,
              status: order.status,
              customerName: order.customer_name,
              assignedWaiterId: item.assigned_waiter_id,
              cookStatus: item.cook_status,
            });
          }
        }
      }
      console.log('[CookDashboard] Filtered assigned dishes:', assigned);
      setAssignedDishes(assigned);
    } catch (err: any) {
      console.error('[CookDashboard] Error in fetchAssignedDishes:', err);
      setError('Failed to load assigned dishes.');
    } finally {
      setLoading(false);
    }
  };

  const updateDishStatus = async (orderId: string, dishName: string, nextStatus: string) => {
    setUpdatingDish(dishName);
    try {
      // Fetch the order
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (fetchError || !order) throw fetchError || new Error('Order not found');
      // Update the relevant dish in the items array
      const updatedItems = order.items.map((item: any) =>
        item.name === dishName ? { ...item, cook_status: nextStatus } : item
      );
      let updatePayload: any = { items: updatedItems };
      // If starting to prepare and order is pending, also update order status
      if (nextStatus === 'preparing' && order.status === 'pending') {
        updatePayload.status = 'preparing';
      }
      // If marking as completed, check if all dishes are completed, then set order status to 'ready'
      if (nextStatus === 'completed') {
        const allCompleted = updatedItems.every((item: any) => item.cook_status === 'completed');
        if (allCompleted) {
          updatePayload.status = 'ready';
        }
      }
      // Update the order row
      const { error: updateError, data: updateData } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId)
        .select();
      if (updateError) {
        toast.error('Failed to update status');
        console.error('[CookDashboard] Status update error for', dishName, ':', updateError);
      } else {
        toast.success('Status updated!');
        console.log('[CookDashboard] Status update success for', dishName, 'to', nextStatus, updateData);
      }
      // Refresh assigned dishes
      const staff = sessionStorage.getItem('staff');
      if (staff) fetchAssignedDishes(JSON.parse(staff));
    } catch (err: any) {
      toast.error('Failed to update status');
      console.error('[CookDashboard] Status update error for', dishName, ':', err);
    } finally {
      setUpdatingDish(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('staff');
    navigate('/staff-login');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome {cookRole ? cookRole.charAt(0).toUpperCase() + cookRole.slice(1) : ''}{cookName && `, ${cookName}`}</h1>
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Assigned Cooking Tasks</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : assignedDishes.filter(dish => dish.cookStatus !== 'completed').length === 0 ? (
          <p className="text-gray-600">No assigned cooking tasks at the moment.</p>
        ) : (
          <table className="min-w-full text-sm mt-2">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Dish</th>
                <th className="px-4 py-2 text-left">Table</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {assignedDishes.filter(dish => dish.cookStatus !== 'completed').map((dish, idx) => (
                <tr key={dish.orderId + '-' + idx} className="border-b">
                  <td className="px-4 py-2">{dish.dishName}</td>
                  <td className="px-4 py-2">{dish.tableNumber}</td>
                  <td className="px-4 py-2">{dish.customerName}</td>
                  <td className="px-4 py-2 capitalize">{dish.cookStatus || 'pending'}</td>
                  <td className="px-4 py-2">
                    {(!dish.cookStatus || dish.cookStatus === 'pending') && (
                      <button onClick={() => updateDishStatus(dish.orderId, dish.dishName, 'preparing')} className="bg-blue-600 text-white px-2 py-1 rounded text-xs" disabled={updatingDish === dish.dishName}>Start Preparing</button>
                    )}
                    {dish.cookStatus === 'preparing' && (
                      <button onClick={() => updateDishStatus(dish.orderId, dish.dishName, 'completed')} className="bg-green-600 text-white px-2 py-1 rounded text-xs" disabled={updatingDish === dish.dishName}>Mark Completed</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Completed Cooking Tasks Section */}
        <h2 className="text-xl font-semibold mt-8 mb-2">Completed Cooking Tasks</h2>
        {assignedDishes.filter(dish => dish.cookStatus === 'completed').length === 0 ? (
          <p className="text-gray-600">No completed cooking tasks yet.</p>
        ) : (
          <table className="min-w-full text-sm mt-2">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Dish</th>
                <th className="px-4 py-2 text-left">Table</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignedDishes.filter(dish => dish.cookStatus === 'completed').map((dish, idx) => (
                <tr key={dish.orderId + '-' + idx} className="border-b bg-gray-50">
                  <td className="px-4 py-2">{dish.dishName}</td>
                  <td className="px-4 py-2">{dish.tableNumber}</td>
                  <td className="px-4 py-2">{dish.customerName}</td>
                  <td className="px-4 py-2 capitalize">Completed</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CookDashboard; 