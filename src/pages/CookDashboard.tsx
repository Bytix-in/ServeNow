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

interface Cook {
  id: string;
  full_name: string;
  role: string;
  restaurant_id: string;
}

const CookDashboard: React.FC = () => {
  const [cookName, setCookName] = useState('');
  const [assignedDishes, setAssignedDishes] = useState<AssignedDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [cookRole, setCookRole] = useState('');
  const [updatingDish, setUpdatingDish] = useState<string | null>(null);
  const [notifiedTasks, setNotifiedTasks] = useState<Set<string>>(new Set());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [newTaskAlert, setNewTaskAlert] = useState<string | null>(null);

  useEffect(() => {
    console.log('[CookDashboard] useEffect mount');
    let cook: Cook | null = null;
    const staff = sessionStorage.getItem('staff');
    if (staff) {
      cook = JSON.parse(staff);
      if (cook) {
        setCookName(cook.full_name);
        setCookRole(cook.role || '');
        
        // Initialize notification permission state
        if ('Notification' in window) {
          setNotificationPermission(Notification.permission);
          console.log('[CookDashboard] Initial notification permission:', Notification.permission);
        }
        
        // Request notification permission on component mount
        requestNotificationPermission();
        
        fetchAssignedDishes(cook);
        // --- Realtime subscription for orders ---
        const channel = supabase
          .channel('cook-orders-realtime')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders',
              filter: `restaurant_id=eq.${cook.restaurant_id}`
            },
            (payload) => {
              console.log('[CookDashboard] Real-time event received:', payload);
              if (cook) {
                console.log('[CookDashboard] Calling fetchAssignedDishes from real-time event');
                fetchAssignedDishes(cook);
              }
            }
          )
          .subscribe();
        return () => {
          channel.unsubscribe();
        };
      }
    } else {
      console.log('[CookDashboard] No staff session found, redirecting to login');
      navigate('/staff-login');
    }
  }, [navigate]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission();
          console.log('[CookDashboard] Notification permission:', permission);
          setNotificationPermission(permission);
          
          // Show feedback based on permission result
          if (permission === 'granted') {
            toast.success('Notifications enabled! You will receive alerts for new tasks.', {
              duration: 4000,
              position: 'top-center'
            });
          } else if (permission === 'denied') {
            toast.error('Notifications disabled. You can still see alerts in the app.', {
              duration: 4000,
              position: 'top-center'
            });
          }
        } catch (err) {
          console.error('[CookDashboard] Error requesting notification permission:', err);
          toast.error('Could not request notification permission. Alerts will show in the app.', {
            duration: 4000,
            position: 'top-center'
          });
        }
      } else {
        // Permission already set
        setNotificationPermission(Notification.permission);
      }
    } else {
      // Notifications not supported
      toast('Browser notifications not supported. Alerts will show in the app.', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#3B82F6',
          color: 'white'
        }
      });
    }
  };

  const showNotification = (dishName: string, tableNumber: number, customerName: string) => {
    const message = `New Cooking Task: ${dishName} for Table ${tableNumber} (${customerName})`;
    
    // Always check current permission state (don't rely on state)
    let currentPermission = 'default';
    if ('Notification' in window) {
      currentPermission = Notification.permission;
      // Update state if it changed
      if (currentPermission !== notificationPermission) {
        console.log('[CookDashboard] Permission state updated from', notificationPermission, 'to', currentPermission);
        setNotificationPermission(currentPermission as NotificationPermission);
      }
    }
    
    // Try browser notifications first (use current permission, not state)
    console.log('[CookDashboard] Current permission:', currentPermission, 'State permission:', notificationPermission);
    if ('Notification' in window && currentPermission === 'granted') {
      try {
        console.log('[CookDashboard] Attempting to show browser notification...');
        const notification = new Notification('New Cooking Task Assigned!', {
          body: `${dishName} for Table ${tableNumber} (${customerName})`,
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: 'cook-task-new', // Changed tag to avoid conflicts
          requireInteraction: false, // Changed to false for better compatibility
          silent: false
        });

        // Auto-close notification after 10 seconds
        setTimeout(() => {
          notification.close();
        }, 10000);

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        
        console.log('[CookDashboard] Browser notification sent successfully');
      } catch (error) {
        console.error('[CookDashboard] Browser notification failed:', error);
      }
    } else {
      console.log('[CookDashboard] Browser notifications not available or not granted. Permission:', notificationPermission);
    }
    
    // Enhanced mobile-friendly notifications (works on all devices)
    toast.success(message, {
      duration: 12000, // Longer duration for mobile
      position: 'top-center',
      style: {
        background: 'linear-gradient(135deg, #10B981, #059669)',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        padding: '20px',
        borderRadius: '12px',
        maxWidth: '90vw',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
        border: '2px solid #047857'
      }
    });
    
    // Also show visual alert in UI
    setNewTaskAlert(message);
    setTimeout(() => setNewTaskAlert(null), 8000);
    
    console.log('[CookDashboard] Toast notification sent:', message);
  };

  const fetchAssignedDishes = async (cook: Cook) => {
    setLoading(true);
    setError('');
    try {
      console.log('[CookDashboard] fetchAssignedDishes called for cook:', cook);
      console.log('[CookDashboard] Cook ID:', cook.id);
      console.log('[CookDashboard] Restaurant ID:', cook.restaurant_id);
      
      // Get all orders for the cook's restaurant
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', cook.restaurant_id);
      if (ordersError) throw ordersError;
      console.log('[CookDashboard] Fetched orders:', orders);
      console.log('[CookDashboard] Number of orders found:', orders?.length || 0);
      
      // Flatten all assigned dishes for this cook using id (UUID)
      const assigned: AssignedDish[] = [];
      const newTasks: AssignedDish[] = [];
      
      for (const order of orders) {
        console.log('[CookDashboard] Processing order:', order.id);
        console.log('[CookDashboard] Order items:', order.items);
        for (const item of order.items) {
          console.log('[CookDashboard] Checking item:', item.name, 'assigned_cook_id:', item.assigned_cook_id, 'cook.id:', cook.id);
          if (item.assigned_cook_id === cook.id) {
            const assignedDish: AssignedDish = {
              orderId: order.id,
              dishName: item.name,
              tableNumber: order.table_number,
              status: order.status,
              customerName: order.customer_name,
              assignedWaiterId: item.assigned_waiter_id,
              cookStatus: item.cook_status,
            };
            
            assigned.push(assignedDish);
            
            // Check if this is a new task that hasn't been notified yet
            const taskKey = `${order.id}-${item.name}`;
            console.log('[CookDashboard] Checking task:', taskKey, 'already notified:', notifiedTasks.has(taskKey), 'cook_status:', item.cook_status);
            if (!notifiedTasks.has(taskKey) && (!item.cook_status || item.cook_status === 'pending')) {
              console.log('[CookDashboard] Adding new task for notification:', taskKey);
              newTasks.push(assignedDish);
              setNotifiedTasks(prev => new Set([...prev, taskKey]));
            } else {
              console.log('[CookDashboard] Task already notified or not pending:', taskKey);
            }
          }
        }
      }
      
      console.log('[CookDashboard] Filtered assigned dishes:', assigned);
      setAssignedDishes(assigned);
      
      // Show notifications for new tasks
      console.log('[CookDashboard] New tasks to notify:', newTasks);
      newTasks.forEach(task => {
        console.log('[CookDashboard] Showing notification for:', task);
        showNotification(task.dishName, task.tableNumber, task.customerName);
      });
      
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
      {/* Enhanced Mobile-Friendly New Task Alert */}
      {newTaskAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-pulse max-w-[95vw] text-center border-2 border-green-500">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-5 h-5 bg-white rounded-full animate-ping"></div>
            <span className="font-bold text-lg">{newTaskAlert}</span>
            <div className="w-5 h-5 bg-white rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome {cookRole ? cookRole.charAt(0).toUpperCase() + cookRole.slice(1) : ''}{cookName && `, ${cookName}`}</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${notificationPermission === 'granted' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={notificationPermission === 'granted' ? 'text-green-600' : 'text-red-600'}>
              {notificationPermission === 'granted' ? 'Browser + App Alerts' : 'App Alerts Only'}
            </span>
            {notificationPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Enable
              </button>
            )}
            {notificationPermission === 'granted' && (
              <button
                onClick={() => showNotification('Test Dish', 1, 'Test Customer')}
                className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                title="Test browser notification"
              >
                Test Browser
              </button>
            )}
            {notificationPermission === 'default' && (
              <button
                onClick={() => {
                  setNotificationPermission(Notification.permission);
                  requestNotificationPermission();
                }}
                className="ml-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                title="Refresh permission status"
              >
                Refresh
              </button>
            )}

          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
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