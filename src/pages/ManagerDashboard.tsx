import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Tag, 
  CheckCircle,
  ClipboardList,
  Clock,
  DollarSign,
  ShoppingBag,
  User
} from 'lucide-react';
import { supabase, Restaurant, Order, logActivity } from '../lib/supabase';

import ManagerSidebar from '../components/ManagerSidebar';
import DishManagement from '../components/DishManagement';
import TableSetup from '../components/TableSetup';
import MenuBuilder from '../components/MenuBuilder';
import Orders from '../components/Orders';
import Settings from '../components/Settings';

export default function ManagerDashboard() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('managerLoggedIn')) {
      navigate('/manager/login');
      return;
    }

    loadRestaurantData();
  }, [navigate]);

  useEffect(() => {
    if (restaurant) {
      loadOrders();
    }
  }, [restaurant]);

  // Fetch orders for the current restaurant
  const loadOrders = async () => {
    if (!restaurant) return;
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('order_time', { ascending: false });
      if (error) {
        console.error('Error loading orders:', error);
        return;
      }
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadRestaurantData = async () => {
    try {
      const restaurantId = localStorage.getItem('currentRestaurantId');
      if (!restaurantId) {
        navigate('/manager/login');
        return;
      }

      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error || !restaurant) {
        console.error('Error loading restaurant:', error);
        navigate('/manager/login');
        return;
      }

      setRestaurant(restaurant);
    } catch (error) {
      console.error('Error loading restaurant data:', error);
      navigate('/manager/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    const updateRestaurantStatus = async () => {
      if (restaurant) {
        try {
          await supabase
            .from('restaurants')
            .update({ is_active: false })
            .eq('id', restaurant.id);

          // Log logout activity
          await logActivity(
            'manager_logout',
            { restaurant_name: restaurant.restaurant_name },
            restaurant.id,
            restaurant.manager_id
          );
        } catch (error) {
          console.error('Error updating restaurant status:', error);
        }
      }
    };

    updateRestaurantStatus();
    
    localStorage.removeItem('managerLoggedIn');
    localStorage.removeItem('currentRestaurantId');
    localStorage.removeItem('currentManagerId');
    navigate('/');
    }

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dishes':
        return <DishManagement restaurantId={restaurant?.id || ''} />;
      case 'menu-builder':
        return <MenuBuilder restaurantId={restaurant?.id || ''} restaurantName={restaurant?.restaurant_name || ''} />;
      case 'tables':
        return <TableSetup restaurantId={restaurant?.id || ''} />;
      case 'orders':
        return <Orders restaurantId={restaurant?.id || ''} />;
      case 'settings':
        return <Settings />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    // Compute stats
    const today = new Date();
    const isToday = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
    };
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const inProgressCount = orders.filter(o => o.status === 'preparing' || o.status === 'ready').length;
    const completedToday = orders.filter(o => o.status === 'completed' && isToday(o.order_time)).length;
    const revenueToday = orders.filter(o => o.status === 'completed' && isToday(o.order_time)).reduce((sum, o) => sum + o.total, 0);
    const recentOrders = orders.slice(0, 8);
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening at your restaurant today.</p>
        </div>

        {/* Order Overview */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center">
              <ClipboardList className="w-5 h-5 mr-3 text-black" />
              Order Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">{pendingCount}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Pending Orders
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">{inProgressCount}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 mr-1" />
                  In Progress
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">{completedToday}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Completed Today
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">${revenueToday.toFixed(2)}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Today's Revenue
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-3 text-black" />
              Recent Orders
            </h2>
            
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-black">{order.customer_name}</h4>
                        <p className="text-sm text-gray-600">Table {order.table_number} • {order.items.length} items</p>
                        <p className="text-xs text-gray-500">{new Date(order.order_time).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-black">${order.total.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'ready' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">Orders will appear here when customers start placing them</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-black mb-3">Order Management Features:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-black" />
                      <span>Real-time order notifications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-black" />
                      <span>Customer details and preferences</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-black" />
                      <span>Order status tracking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-black" />
                      <span>Payment processing</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Restaurant Information */}
      {restaurant && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-black mb-8 flex items-center">
            <Store className="w-5 h-5 mr-3 text-black" />
            Restaurant Information
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Store className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Restaurant Name</p>
                  <p className="text-black font-semibold text-lg">{restaurant.restaurant_name}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                  <p className="text-black">{restaurant.address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                  <p className="text-black">{restaurant.phone_number}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <p className="text-black">{restaurant.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Users className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Seating Capacity</p>
                  <p className="text-black font-semibold">{restaurant.seating_capacity} seats</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Tag className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Cuisine Tags</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {restaurant.cuisine_tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-black text-sm rounded-full font-medium border border-gray-200"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-black" />
                  <span className="font-medium text-black">Restaurant Status: Active</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Manager ID:</strong> {restaurant.manager_id}</p>
                  <p><strong>Last Login:</strong> {restaurant.last_login ? new Date(restaurant.last_login).toLocaleString() : 'First time login'}</p>
                  <p><strong>Created:</strong> {new Date(restaurant.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Restaurant data not found. Please log in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ManagerSidebar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        restaurantName={restaurant.restaurant_name}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      
      <div className="flex-1 overflow-auto">
        {renderCurrentPage()}
      </div>
    </div>
  );
}