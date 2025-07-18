import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Star, TrendingUp, Clock, User, Phone, MapPin, CheckCircle, Trash2 } from 'lucide-react';
import { supabase, Staff } from '../lib/supabase';

interface Dish {
  id: string;
  name: string;
  type: string;
  price: number;
  ingredients?: string;
  prep_time: number;
  tags: string[];
  image_url?: string; // Added image_url to Dish interface
}

interface CartItem {
  dish_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Restaurant {
  id: string;
  manager_id: string;
  restaurant_name: string;
  owner_name: string;
  phone_number: string;
  email: string;
  address: string;
  cuisine_tags: string;
  seating_capacity: number;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export default function PublicMenuPage() {
  const { managerId } = useParams<{ managerId: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    tableNumber: '',
    notes: ''
  });
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [removedItemName, setRemovedItemName] = useState<string | null>(null);

  useEffect(() => {
    if (managerId) {
      loadRestaurantData();
      // --- Realtime subscription for dishes ---
      const channel = supabase
        .channel('publicmenu-dishes-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'dishes',
            filter: `restaurant_id=eq.${managerId}`
          },
          (payload) => {
            loadRestaurantData();
          }
        )
        .subscribe();
      return () => {
        channel.unsubscribe();
      };
    }
  }, [managerId]);

  const loadRestaurantData = async () => {
    try {
      // Fetch restaurant data from Supabase
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', managerId)
        .single();

      if (restaurantError || !restaurantData) {
        console.error('Error loading restaurant:', restaurantError);
        setLoading(false);
        return;
      }

      setRestaurant(restaurantData);

      // Fetch dishes for this restaurant
      const { data: dishesData, error: dishesError } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .order('type', { ascending: true });

      if (dishesError) {
        console.error('Error loading dishes:', dishesError);
      } else {
        setDishes(dishesData || []);
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (dish: Dish) => {
    // Prevent negative or zero quantity add
    if (dish.price < 0) return;
    setAddedItems(prev => new Set(prev).add(dish.id));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(dish.id);
        return newSet;
      });
    }, 1000);

    const existingItem = cart.find(item => item.dish_id === dish.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.dish_id === dish.id
          ? { ...item, quantity: Math.max(item.quantity + 1, 1) }
          : item
      ));
    } else {
      setCart([...cart, {
        dish_id: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (dishId: string, change: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
      if (item.dish_id === dishId) {
        const newQuantity = item.quantity + change;
          // Prevent negative quantities
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
      }).filter((item): item is CartItem => item !== null && item.quantity > 0);
      // If item was removed, show toast
      const originalItem = prevCart.find(item => item.dish_id === dishId);
      if (originalItem && originalItem.quantity + change <= 0) {
        setRemovedItemName(originalItem.name);
        setTimeout(() => setRemovedItemName(null), 2000);
      }
      return updatedCart;
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.dish_id === dishId);
      if (item) {
        setRemovedItemName(item.name);
        setTimeout(() => setRemovedItemName(null), 2000);
      }
      return prevCart.filter(i => i.dish_id !== dishId);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const submitOrder = async () => {
    if (!restaurant || cart.length === 0 || !orderForm.customerName || !orderForm.tableNumber) {
      return;
    }
    setIsSubmittingOrder(true);
    try {
      // Fetch available cooks and waiters
      const { data: staffList, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true);
      if (staffError || !staffList) throw new Error('Failed to fetch staff');
      const cooks = staffList.filter(s => s.role === 'cook');
      const waiters = staffList.filter(s => s.role === 'waiter');
      // Fetch all open orders to count active tasks
      const { data: openOrders } = await supabase
        .from('orders')
        .select('items')
        .eq('restaurant_id', restaurant.id)
        .in('status', ['pending', 'preparing', 'ready']);
      const cookTaskCount: Record<string, number> = {};
      const waiterTaskCount: Record<string, number> = {};
      cooks.forEach(c => cookTaskCount[c.id] = 0);
      waiters.forEach(w => waiterTaskCount[w.id] = 0);
      if (openOrders) {
        for (const order of openOrders) {
          for (const item of order.items) {
            if (item.assigned_cook_id && cookTaskCount[item.assigned_cook_id] !== undefined) cookTaskCount[item.assigned_cook_id]++;
            if (item.assigned_waiter_id && waiterTaskCount[item.assigned_waiter_id] !== undefined) waiterTaskCount[item.assigned_waiter_id]++;
          }
        }
      }
      // Assign each dish to the least-busy cook and waiter
      const assignedItems = cart.map((item) => {
        const leastBusyCook = cooks.length > 0
          ? cooks.reduce((min, c) => cookTaskCount[c.id] < cookTaskCount[min.id] ? c : min, cooks[0])
          : null;
        const leastBusyWaiter = waiters.length > 0
          ? waiters.reduce((min, w) => waiterTaskCount[w.id] < waiterTaskCount[min.id] ? w : min, waiters[0])
          : null;
        if (leastBusyCook) cookTaskCount[leastBusyCook.id]++;
        if (leastBusyWaiter) waiterTaskCount[leastBusyWaiter.id]++;
        return {
          ...item,
          assigned_cook_id: leastBusyCook ? leastBusyCook.id : null,
          assigned_waiter_id: leastBusyWaiter ? leastBusyWaiter.id : null,
        };
      });
      // Prepare order data for Supabase
      const orderData = {
        restaurant_id: restaurant.id,
        customer_name: orderForm.customerName,
        customer_phone: orderForm.customerPhone || null,
        table_number: parseInt(orderForm.tableNumber),
        items: assignedItems,
        total: getTotalPrice(),
        status: 'pending' as const,
        notes: orderForm.notes || null
      };
      // Insert order into Supabase
      const { data: newOrder, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      if (error) {
        console.error('Error submitting order:', error);
        alert('Failed to submit order. Please try again.');
        setIsSubmittingOrder(false);
        return;
      }
      // Redirect to order status page
      window.location.href = `/order-status/${newOrder.id}`;
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
      setIsSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Menu...</h2>
          <p className="text-gray-600">Please wait while we prepare your dining experience</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-6">
            The menu you're looking for doesn't exist or may have been moved.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Debug Info:</strong><br />
              Manager ID: {managerId || 'Not provided'}<br />
              Please contact the restaurant for the correct menu link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group dishes by type
  const dishesByType = dishes.reduce((acc, dish) => {
    if (!acc[dish.type]) {
      acc[dish.type] = [];
    }
    acc[dish.type].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>);

  // Get special dishes
  const specialDishes = dishes.filter(dish => dish.tags.includes('Special Today'));
  const popularDishes = dishes.filter(dish => dish.tags.includes('Most Ordered'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Toast for item removal */}
      {removedItemName && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-lg shadow-lg z-50 animate-fade-out">
          <p className="font-semibold text-center">Removed <span className="font-bold">{removedItemName}</span> from cart</p>
        </div>
      )}
      {/* Sticky Cart Button */}
      {cart.length > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowOrderForm(true)}
            className="bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-all transform hover:scale-105 flex items-center space-x-3"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">{getTotalItems()} items</span>
            <span className="bg-white text-black px-2 py-1 rounded-full text-sm font-bold">
              ${getTotalPrice().toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Success Message */}
      {orderSubmitted && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-lg shadow-lg z-50 animate-bounce">
          <p className="font-semibold text-center">🎉 Order placed successfully!</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-lg border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black mb-2">{restaurant.restaurant_name}</h1>
            <p className="text-gray-600 text-lg mb-4">{restaurant.address}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {restaurant.cuisine_tags.split(',').map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-black to-gray-800 text-white text-sm rounded-full font-medium shadow-md"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Special Sections */}
        {(specialDishes.length > 0 || popularDishes.length > 0) && (
          <div className="mb-12">
            {/* Special Today */}
            {specialDishes.length > 0 && (
              <div className="mb-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-black mb-2 flex items-center justify-center">
                    <Star className="w-8 h-8 text-yellow-500 mr-3 fill-current" />
                    Today's Specials
                  </h2>
                  <p className="text-gray-600">Chef's recommended dishes for today</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {specialDishes.map((dish) => (
                    <div key={dish.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
                      {dish.image_url && (
                        <img
                          src={dish.image_url}
                          alt={dish.name}
                          className="w-32 h-32 object-cover rounded-lg mb-3 border border-gray-200 shadow-sm"
                        />
                      )}
                      <h5 className="text-lg font-semibold text-black mb-1 text-center">{dish.name}</h5>
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-black text-white text-xs rounded-full font-medium">
                          {dish.type}
                        </span>
                        {dish.prep_time > 0 && (
                          <span className="text-xs text-gray-500">{dish.prep_time} min</span>
                        )}
                      </div>
                      {dish.ingredients && (
                        <p className="text-sm text-gray-600 mb-1 text-center">{dish.ingredients}</p>
                      )}
                      {dish.tags && dish.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2 justify-center">
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
                      <span className="text-lg font-bold text-black mt-auto mb-2">${dish.price.toFixed(2)}</span>
                      <div className="flex items-center justify-center w-full">
                        {cart.find(item => item.dish_id === dish.id) ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(dish.id, -1)}
                              className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-black min-w-[24px] text-center">
                              {cart.find(item => item.dish_id === dish.id)?.quantity || 0}
                            </span>
                            <button
                              onClick={() => updateQuantity(dish.id, 1)}
                              className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(dish)}
                            className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2 font-semibold transform hover:scale-105"
                          >
                            {addedItems.has(dish.id) ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Most Ordered */}
            {popularDishes.length > 0 && (
              <div className="mb-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-black mb-2 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
                    Customer Favorites
                  </h2>
                  <p className="text-gray-600">Most loved dishes by our customers</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularDishes.map((dish) => (
                    <div key={dish.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-bold text-black">{dish.name}</h3>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                          </div>
                          <p className="text-3xl font-bold text-black">${dish.price.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      {dish.ingredients && (
                        <p className="text-gray-700 mb-4 text-sm leading-relaxed">{dish.ingredients}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {dish.prep_time > 0 && (
                            <span className="flex items-center space-x-1 text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                              <Clock className="w-3 h-3" />
                              <span>{dish.prep_time} min</span>
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {cart.find(item => item.dish_id === dish.id) ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(dish.id, -1)}
                                className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold text-black min-w-[24px] text-center">
                                {cart.find(item => item.dish_id === dish.id)?.quantity || 0}
                              </span>
                              <button
                                onClick={() => updateQuantity(dish.id, 1)}
                                className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(dish)}
                              className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2 font-semibold transform hover:scale-105"
                            >
                              {addedItems.has(dish.id) ? (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Added!</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4" />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Menu */}
        {Object.keys(dishesByType).length > 0 ? (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-black mb-4">Full Menu</h2>
              <p className="text-gray-600 text-lg">Explore our complete selection of delicious dishes</p>
            </div>
            
            {Object.entries(dishesByType).map(([type, typeDishes]) => (
              <div key={type} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-black mb-8 flex items-center">
                  <span className="w-4 h-4 bg-black rounded-full mr-4"></span>
                  {type}
                  <span className="ml-3 text-lg font-normal text-gray-500">({typeDishes.length} items)</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {typeDishes.map((dish) => (
                    <div key={dish.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
                      {dish.image_url && (
                        <img
                          src={dish.image_url}
                          alt={dish.name}
                          className="w-32 h-32 object-cover rounded-lg mb-3 border border-gray-200 shadow-sm"
                        />
                      )}
                      <h5 className="text-lg font-semibold text-black mb-1 text-center">{dish.name}</h5>
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-black text-white text-xs rounded-full font-medium">
                          {dish.type}
                        </span>
                        {dish.prep_time > 0 && (
                          <span className="text-xs text-gray-500">{dish.prep_time} min</span>
                        )}
                      </div>
                      {dish.ingredients && (
                        <p className="text-sm text-gray-600 mb-1 text-center">{dish.ingredients}</p>
                      )}
                      {dish.tags && dish.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2 justify-center">
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
                      <span className="text-lg font-bold text-black mt-auto mb-2">${dish.price.toFixed(2)}</span>
                      <div className="flex items-center justify-center w-full">
                        {cart.find(item => item.dish_id === dish.id) ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(dish.id, -1)}
                              className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-black min-w-[24px] text-center">
                              {cart.find(item => item.dish_id === dish.id)?.quantity || 0}
                            </span>
                            <button
                              onClick={() => updateQuantity(dish.id, 1)}
                              className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(dish)}
                            className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2 font-semibold transform hover:scale-105"
                          >
                            {addedItems.has(dish.id) ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Menu Coming Soon</h3>
            <p className="text-gray-600 text-lg">This restaurant is still setting up their delicious menu.</p>
          </div>
        )}
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Back to Menu Button */}
              <button
                onClick={() => {
                  setShowOrderForm(false);
                  setTimeout(() => navigate(`/menu/${managerId}`), 100); // Optional: slight delay for smoothness
                }}
                className="flex items-center mb-6 text-black hover:text-gray-700 font-semibold text-lg focus:outline-none"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back to Menu
              </button>
              {/* Cart Summary */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-black mb-4">Order Summary</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.dish_id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <span className="font-medium text-black">{item.quantity}x {item.name}</span>
                      </div>
                      <span className="font-bold text-black mr-2">${(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => removeFromCart(item.dish_id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-black">Total</span>
                    <span className="text-2xl font-bold text-black">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm({...orderForm, customerPhone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Table Number *
                  </label>
                  <input
                    type="number"
                    value={orderForm.tableNumber}
                    onChange={(e) => setOrderForm({...orderForm, tableNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="Enter table number"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Special Notes</label>
                  <textarea
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    placeholder="Any special requests or dietary requirements"
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={submitOrder}
                  disabled={!orderForm.customerName || !orderForm.tableNumber || cart.length === 0 || isSubmittingOrder}
                  className="flex-1 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2"
                >
                  {isSubmittingOrder ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <span>Place Order</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}