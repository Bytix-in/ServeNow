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
}

const CookDashboard: React.FC = () => {
  const [cookName, setCookName] = useState('');
  const [assignedDishes, setAssignedDishes] = useState<AssignedDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const staff = localStorage.getItem('staff');
    if (staff) {
      const parsed = JSON.parse(staff);
      setCookName(parsed.full_name);
      fetchAssignedDishes(parsed);
    } else {
      navigate('/staff-login');
    }
    // eslint-disable-next-line
  }, [navigate]);

  const fetchAssignedDishes = async (cook: any) => {
    setLoading(true);
    setError('');
    try {
      // Get all orders for the cook's restaurant
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', cook.restaurant_id);
      if (ordersError) throw ordersError;
      // Flatten all assigned dishes for this cook
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
            });
          }
        }
      }
      setAssignedDishes(assigned);
    } catch (err: any) {
      setError('Failed to load assigned dishes.');
    } finally {
      setLoading(false);
    }
  };

  const updateDishStatus = async (orderId: string, dishName: string, nextStatus: string) => {
    try {
      // Fetch the order
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (fetchError || !order) throw fetchError || new Error('Order not found');
      // Update the status for the specific dish
      const updatedItems = order.items.map((item: any) =>
        item.name === dishName ? { ...item, status: nextStatus } : item
      );
      // If all dishes are complete, mark order as completed
      const allComplete = updatedItems.every((item: any) => item.status === 'complete');
      const newOrderStatus = allComplete ? 'completed' : nextStatus === 'preparing' ? 'preparing' : order.status;
      const { error: updateError } = await supabase
        .from('orders')
        .update({ items: updatedItems, status: newOrderStatus })
        .eq('id', orderId);
      if (updateError) throw updateError;
      toast.success('Status updated!');
      // Refresh assigned dishes
      const staff = localStorage.getItem('staff');
      if (staff) fetchAssignedDishes(JSON.parse(staff));
    } catch (err: any) {
      toast.error('Failed to update status');
      console.error('Status update error:', err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome, {cookName} (Cook)</h1>
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Assigned Dishes/Orders</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : assignedDishes.length === 0 ? (
          <p className="text-gray-600">No assigned dishes at the moment.</p>
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
              {assignedDishes.map((dish, idx) => (
                <tr key={dish.orderId + '-' + idx} className="border-b">
                  <td className="px-4 py-2">{dish.dishName}</td>
                  <td className="px-4 py-2">{dish.tableNumber}</td>
                  <td className="px-4 py-2">{dish.customerName}</td>
                  <td className="px-4 py-2 capitalize">{dish.status}</td>
                  <td className="px-4 py-2">
                    {dish.status === 'pending' && (
                      <button onClick={() => updateDishStatus(dish.orderId, dish.dishName, 'preparing')} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Start Preparing</button>
                    )}
                    {dish.status === 'preparing' && (
                      <button onClick={() => updateDishStatus(dish.orderId, dish.dishName, 'complete')} className="bg-green-600 text-white px-2 py-1 rounded text-xs">Mark Complete</button>
                    )}
                  </td>
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