import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Order } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AssignedTask {
  orderId: string;
  dishName: string;
  tableNumber: number;
  status: string;
  customerName: string;
  assignedCookId?: string;
}

const WaiterDashboard: React.FC = () => {
  const [waiterName, setWaiterName] = useState('');
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [updatingDish, setUpdatingDish] = useState<string | null>(null);

  useEffect(() => {
    const staff = sessionStorage.getItem('staff');
    if (staff) {
      const parsed = JSON.parse(staff);
      setWaiterName(parsed.full_name);
      fetchAssignedTasks(parsed);
    } else {
      navigate('/staff-login');
    }
    // eslint-disable-next-line
  }, [navigate]);

  const fetchAssignedTasks = async (waiter: any) => {
    setLoading(true);
    setError('');
    try {
      // Get all orders for the waiter's restaurant
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', waiter.restaurant_id);
      if (ordersError) throw ordersError;
      // Flatten all assigned tasks for this waiter
      const assigned: AssignedTask[] = [];
      for (const order of orders) {
        for (const item of order.items) {
          if (item.assigned_waiter_id === waiter.id) {
            assigned.push({
              orderId: order.id,
              dishName: item.name,
              tableNumber: order.table_number,
              status: order.status,
              customerName: order.customer_name,
              assignedCookId: item.assigned_cook_id,
            });
          }
        }
      }
      setAssignedTasks(assigned);
    } catch (err: any) {
      setError('Failed to load assigned tasks.');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (orderId: string, dishName: string, nextStatus: string) => {
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
        item.name === dishName ? { ...item, waiter_status: nextStatus } : item
      );
      // Compute new order status
      let newOrderStatus = order.status;
      if (nextStatus === 'accepted') {
        newOrderStatus = 'serving';
      } else if (nextStatus === 'served') {
        // Check if all dishes are completed
        const updatedDish = updatedItems.find((item: any) => item.name === dishName);
        if (updatedDish && updatedDish.cook_status === 'completed' && updatedDish.waiter_status === 'served') {
          const allDishesCompleted = updatedItems.every((item: any) => item.cook_status === 'completed' && item.waiter_status === 'served');
          if (allDishesCompleted) {
            newOrderStatus = 'completed';
            console.log('[WaiterDashboard] All dishes completed, setting order status to completed');
          } else {
            newOrderStatus = 'served';
            console.log('[WaiterDashboard] Dish served, setting order status to served');
          }
        }
      }
      // Update the order row
      const { error: updateError, data: updateData } = await supabase
        .from('orders')
        .update({ items: updatedItems, status: newOrderStatus })
        .eq('id', orderId)
        .select();
      console.log('[WaiterDashboard] Supabase update response:', { updateData, updateError });
      if (updateError) {
        toast.error('Failed to update status');
        console.error('[WaiterDashboard] Status update error for', dishName, ':', updateError);
      } else {
        toast.success('Status updated!');
        console.log('[WaiterDashboard] Status update success for', dishName, 'to', nextStatus, updateData);
        // Log the updated assigned_waiter_id and waiter.staff_id for debug
        const staff = sessionStorage.getItem('staff');
        const waiter = staff ? JSON.parse(staff) : null;
        if (updateData && updateData[0]) {
          const updatedItem = updateData[0].items.find((item: any) => item.name === dishName);
          console.log('[WaiterDashboard] After update: assigned_waiter_id for dish', dishName, 'is', updatedItem?.assigned_waiter_id, 'waiter.staff_id:', waiter?.staff_id, 'waiter_status:', updatedItem?.waiter_status, 'cook_status:', updatedItem?.cook_status);
        }
      }
      // Refresh assigned tasks
      const staff = sessionStorage.getItem('staff');
      if (staff) fetchAssignedTasks(JSON.parse(staff));
    } catch (err: any) {
      toast.error('Failed to update status');
      console.error('[WaiterDashboard] Status update error for', dishName, ':', err);
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
      <h1 className="text-2xl font-bold mb-4">Welcome, {waiterName} (Waiter)</h1>
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Assigned Serving Tasks</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : assignedTasks.length === 0 ? (
          <p className="text-gray-600">No assigned serving tasks at the moment.</p>
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
              {assignedTasks.filter(task => task.dishStatus !== 'served' || task.cookStatus !== 'completed').map((task, idx) => (
                <tr key={task.orderId + '-' + idx} className="border-b">
                  <td className="px-4 py-2">{task.dishName}</td>
                  <td className="px-4 py-2">{task.tableNumber}</td>
                  <td className="px-4 py-2">{task.customerName}</td>
                  <td className="px-4 py-2 capitalize">{task.dishStatus || 'pending'}</td>
                  <td className="px-4 py-2">
                    {(!task.dishStatus || task.dishStatus === 'pending') && (
                      <button onClick={() => updateTaskStatus(task.orderId, task.dishName, 'accepted')} className="bg-blue-600 text-white px-2 py-1 rounded text-xs" disabled={updatingDish === task.dishName}>Accept</button>
                    )}
                    {task.dishStatus === 'accepted' && (
                      <button onClick={() => updateTaskStatus(task.orderId, task.dishName, 'served')} className="bg-green-600 text-white px-2 py-1 rounded text-xs" disabled={updatingDish === task.dishName}>Served</button>
                    )}
                    {task.dishStatus === 'served' && task.cookStatus === 'completed' && (
                      <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs">Completed</span>
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

export default WaiterDashboard; 