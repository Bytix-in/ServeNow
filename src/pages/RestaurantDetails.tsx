import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Store, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Tag, 
  Key, 
  Shield,
  Activity,
  Clock,
  Utensils,
  Table,
  Copy,
  CheckCircle,
  ClipboardList,
  DollarSign
} from 'lucide-react';
import { supabase, Restaurant, Dish, Order } from '../lib/supabase';

export default function RestaurantDetails() {
  const { managerId } = useParams<{ managerId: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [tables, setTables] = useState<number[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('adminLoggedIn')) {
      navigate('/admin/login');
      return;
    }

    if (managerId) {
      loadRestaurantData();
    }
  }, [managerId, navigate]);

  const loadRestaurantData = async () => {
    try {
      // Fetch restaurant data from Supabase using the restaurant ID
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('manager_id', managerId)
        .single();

      if (restaurantError || !restaurant) {
        console.error('Error loading restaurant:', restaurantError);
        setIsLoading(false);
        return;
      }

      setRestaurant(restaurant);

      // Fetch dishes for this restaurant
      const { data: dishesData, error: dishesError } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('type', { ascending: true });

      if (dishesError) {
        console.error('Error loading dishes:', dishesError);
      } else {
        setDishes(dishesData || []);
      }

      // Fetch tables for this restaurant
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('table_number')
        .eq('restaurant_id', restaurant.id)
        .order('table_number', { ascending: true });

      if (tablesError) {
        console.error('Error loading tables:', tablesError);
      } else {
        setTables(tablesData?.map(t => t.table_number) || []);
      }

      // Fetch orders for this restaurant
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('order_time', { ascending: false });

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
      } else {
        setOrders(ordersData || []);
      }

    } catch (error) {
      console.error('Error loading restaurant data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTotalRevenue = () => {
    return orders.reduce((total, order) => total + order.total, 0);
  };

  const getTodaysOrders = () => {
    const today = new Date().toDateString();
    return orders.filter(order => new Date(order.order_time).toDateString() === today);
  };

  const getTodaysRevenue = () => {
    const todaysOrders = getTodaysOrders();
    return todaysOrders.reduce((total, order) => total + order.total, 0);
  };

  const handleDeleteRestaurant = async () => {
    if (!restaurant) return;
    if (!window.confirm('Are you sure you want to delete this restaurant and all its data? This action cannot be undone.')) return;
    try {
      setIsLoading(true);
      await supabase.from('staff').delete().eq('restaurant_id', restaurant?.id);
      await supabase.from('orders').delete().eq('restaurant_id', restaurant?.id);
      await supabase.from('tables').delete().eq('restaurant_id', restaurant?.id);
      await supabase.from('dishes').delete().eq('restaurant_id', restaurant?.id);
      await supabase.from('activity_logs').delete().eq('restaurant_id', restaurant?.id);
      const { error: restaurantError } = await supabase.from('restaurants').delete().eq('id', restaurant?.id);
      if (restaurantError) throw restaurantError;
      alert('Restaurant and all related data deleted successfully.');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      alert('Failed to delete restaurant: ' + (err.message || err));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-6">The restaurant you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-black">{restaurant.restaurant_name}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${restaurant.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className={`font-medium ${restaurant.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                {restaurant.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-black">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold text-black">{getTodaysOrders().length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-black">${getTotalRevenue().toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-black">${getTodaysRevenue().toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Restaurant Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-black mb-6 flex items-center">
                <Store className="w-5 h-5 mr-3" />
                Restaurant Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Owner Name</p>
                      <p className="text-black font-semibold">{restaurant.owner_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-black">{restaurant.phone_number}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-black">{restaurant.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-black">{restaurant.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Seating Capacity</p>
                      <p className="text-black font-semibold">{restaurant.seating_capacity} seats</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Tag className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cuisine Tags</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {restaurant.cuisine_tags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-black text-xs rounded-full font-medium"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-black mb-6 flex items-center">
                <ClipboardList className="w-5 h-5 mr-3" />
                Recent Orders ({orders.length})
              </h2>
              
              {orders.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {orders.slice(0, 10).map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-black">{order.customer_name}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>Table {order.table_number}</span>
                                </span>
                                {order.customer_phone && (
                                  <span className="flex items-center space-x-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{order.customer_phone}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-black text-lg">${order.total.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.order_time).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Items:</h5>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-black font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {order.notes}
                          </p>
                        </div>
                      )}

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-black mb-6 flex items-center">
                <Utensils className="w-5 h-5 mr-3" />
                Menu Items ({dishes.length})
              </h2>
              
              {dishes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dishes.map((dish) => (
                    <div key={dish.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-black">{dish.name}</h4>
                        <span className="font-bold text-black">${dish.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-black text-white text-xs rounded-full">
                          {dish.type}
                        </span>
                        {dish.prep_time > 0 && (
                          <span className="text-xs text-gray-500">{dish.prep_time} min</span>
                        )}
                      </div>
                      {dish.ingredients && (
                        <p className="text-sm text-gray-600">{dish.ingredients}</p>
                      )}
                      {dish.tags && dish.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dish.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No menu items added yet</p>
                </div>
              )}
            </div>

            {/* Tables */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-black mb-6 flex items-center">
                <Table className="w-5 h-5 mr-3" />
                Tables ({tables.length})
              </h2>
              
              {tables.length > 0 ? (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {tables.map((table) => (
                    <div key={table} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                      <span className="font-semibold text-black">Table {table}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Table className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No tables configured yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Credentials */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Access Credentials
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Manager ID</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={restaurant.manager_id}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(restaurant.manager_id, 'managerId')}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {copiedField === 'managerId' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Access Key</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={restaurant.access_key}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(restaurant.access_key, 'accessKey')}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {copiedField === 'accessKey' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Activity Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${restaurant.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className={`text-sm font-medium ${restaurant.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                      {restaurant.is_active ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm text-black">
                    {restaurant.last_login 
                      ? new Date(restaurant.last_login).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm text-black">
                    {new Date(restaurant.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Menu Items</span>
                  <span className="text-lg font-bold text-black">{dishes.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tables</span>
                  <span className="text-lg font-bold text-black">{tables.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Seating Capacity</span>
                  <span className="text-lg font-bold text-black">{restaurant.seating_capacity}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="text-lg font-bold text-black">{orders.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Danger Zone Delete Button */}
      {restaurant && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
          <div className="bg-white border border-red-200 rounded-lg p-6 flex flex-col items-center">
            <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center">
              <Store className="w-5 h-5 mr-2 text-red-700" />
              Danger Zone
            </h2>
            <p className="text-gray-600 mb-4 text-center">Deleting this restaurant will permanently remove all its data, including menu items, tables, orders, staff, and activity logs. This action cannot be undone.</p>
            <button
              onClick={handleDeleteRestaurant}
              className="mt-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Restaurant'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}