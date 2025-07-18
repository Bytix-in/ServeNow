import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, CheckCircle, User, Phone, MapPin, ShoppingBag, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OrderItem {
  dish_id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone?: string;
  table_number: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  order_time: string;
  notes?: string;
}

interface Restaurant {
  id: string;
  restaurant_name: string;
  address: string;
  phone_number: string;
}

function getOrderStatusMessage(status: string, orderId: string, tableNumber: number): string {
  const id = orderId.slice(-8).toUpperCase();
  switch (status) {
    case 'preparing':
      return `🥘 Your food just started its journey from raw to WOW! (Order #${id}, Table ${tableNumber})`;
    case 'food_prepared':
      return `🍽️ Your food’s ready and posing for a plate-selfie! (Order #${id}, Table ${tableNumber})`;
    case 'serving':
      return `🍛 Your food’s doing a runway walk to your table! (Order #${id}, Table ${tableNumber})`;
    case 'served':
      return `🍴 Forks up! Your food has landed, Enjoy your meal. (Order #${id}, Table ${tableNumber})`;
    case 'completed':
      return `😋 Plate cleaned, hearts full. Come back soon! (Order #${id}, Table ${tableNumber})`;
    default:
      return `Your order status has been updated to ${status}. (Order #${id}, Table ${tableNumber})`;
  }
}

function showOrderNotification(orderId: string, status: string, tableNumber: number) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Order Update', {
      body: getOrderStatusMessage(status, orderId, tableNumber)
    });
  }
}

export default function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(1080); // 18 minutes in seconds
  const [error, setError] = useState('');
  const lastNotifiedStatus = useRef<string | null>(null);

  useEffect(() => {
    // When order is first loaded, set lastNotifiedStatus to current status to avoid duplicate notification
    if (order && order.status) {
      lastNotifiedStatus.current = order.status;
    }
  }, [order]);

  useEffect(() => {
    if (!orderId) return;
    loadOrderData();
    // --- Realtime subscription for this order ---
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          const updatedOrder = payload.new as Order;
          setOrder(updatedOrder);
          // Only notify if status changed and user is viewing this order
          if (updatedOrder && updatedOrder.status && lastNotifiedStatus.current !== updatedOrder.status) {
            showOrderNotification(updatedOrder.id, updatedOrder.status, updatedOrder.table_number);
            lastNotifiedStatus.current = updatedOrder.status;
          }
        }
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [orderId]);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadOrderData = async () => {
    try {
      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        setError('Order not found. Please check your order ID.');
        setLoading(false);
        return;
      }

      setOrder(orderData);

      // Fetch restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id, restaurant_name, address, phone_number')
        .eq('id', orderData.restaurant_id)
        .single();

      if (restaurantError || !restaurantData) {
        console.error('Error loading restaurant:', restaurantError);
      } else {
        setRestaurant(restaurantData);
      }
    } catch (error) {
      console.error('Error loading order data:', error);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          setOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'preparing':
        return <Clock className="w-5 h-5" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order has been received and is waiting to be prepared.';
      case 'preparing':
        return 'Our kitchen is preparing your delicious meal!';
      case 'ready':
        return 'Your order is ready for pickup!';
      case 'completed':
        return 'Order completed. Thank you for dining with us!';
      default:
        return 'Processing your order...';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Order Status...</h2>
          <p className="text-gray-600">Please wait while we fetch your order details</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The order you\'re looking for doesn\'t exist or may have been removed.'}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-lg border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            {restaurant && (
              <>
                <h1 className="text-3xl font-bold text-black mb-2">{restaurant.restaurant_name}</h1>
                <p className="text-gray-600">{restaurant.address}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Status Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-2">Order Status</h2>
            <p className="text-gray-600 text-lg">Order #{order.id.slice(-8).toUpperCase()}</p>
          </div>

          {/* Current Status */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-full border-2 ${getStatusColor(order.status)} mb-4`}>
              {getStatusIcon(order.status)}
              <span className="font-bold text-lg capitalize">{order.status}</span>
            </div>
            <p className="text-gray-700 text-lg font-medium">{getStatusMessage(order.status)}</p>
          </div>

          {/* Countdown Timer */}
          {order.status !== 'completed' && (
            <div className="text-center mb-8">
              <div className="bg-black text-white rounded-2xl p-6 inline-block">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8" />
                  <div>
                    <div className="text-3xl font-bold">{formatTime(timeRemaining)}</div>
                    <div className="text-sm opacity-80">Estimated time remaining</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {['pending', 'preparing', 'ready', 'completed'].map((status, index) => {
                const isActive = ['pending', 'preparing', 'ready', 'completed'].indexOf(order.status) >= index;
                const isCurrent = order.status === status;
                
                return (
                  <React.Fragment key={status}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-black border-black text-white' 
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-black ring-opacity-20 scale-110' : ''}`}>
                      {isActive ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    {index < 3 && (
                      <div className={`w-16 h-1 transition-all duration-300 ${
                        ['pending', 'preparing', 'ready', 'completed'].indexOf(order.status) > index 
                          ? 'bg-black' 
                          : 'bg-gray-300'
                      }`}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-black mb-6">Order Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-semibold text-black">{order.customer_name}</p>
                </div>
              </div>
              
              {order.customer_phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-semibold text-black">{order.customer_phone}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Table Number</p>
                  <p className="font-semibold text-black">Table {order.table_number}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Order Time</p>
                  <p className="font-semibold text-black">{new Date(order.order_time).toLocaleString()}</p>
                </div>
              </div>
              
              {order.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Special Notes</p>
                  <p className="text-black">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-black mb-6">Order Items</h3>
            
            <div className="space-y-4 mb-6">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-black">{item.name}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-black">Total</span>
                <span className="text-2xl font-bold text-black">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {restaurant && (
          <div className="mt-8 bg-black text-white rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold mb-4">Need Help?</h3>
            <p className="mb-4">Contact the restaurant directly if you have any questions about your order.</p>
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>{restaurant.phone_number}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>{restaurant.address}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}