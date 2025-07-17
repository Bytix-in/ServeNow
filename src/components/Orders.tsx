import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, User, Phone, MapPin, X, Plus, Trash2 } from 'lucide-react';
import { supabase, logActivity, Dish } from '../lib/supabase';

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

interface OrdersProps {
  restaurantId: string;
}

export default function Orders({ restaurantId }: OrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  // Manual order modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    customer_name: '',
    customer_phone: '',
    table_number: '',
    items: [{ dish_id: '', name: '', quantity: 1, price: 0 }],
    notes: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ customer_name?: string; customer_phone?: string; table_number?: string; items?: string } | null>(null);
  const [menu, setMenu] = useState<Dish[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      loadOrders();
      loadMenu();
    }
  }, [restaurantId]);

  const loadOrders = async () => {
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
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

  const loadMenu = async () => {
    try {
      const { data: dishes, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('type', { ascending: true });
      if (error) {
        console.error('Error loading menu:', error);
        return;
      }
      setMenu(dishes || []);
    } catch (error) {
      console.error('Error loading menu:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return;
      }

      // Log order status update activity
      const managerId = localStorage.getItem('currentManagerId');
      await logActivity(
        'order_status_updated',
        {
          order_id: orderId,
          new_status: newStatus
        },
        restaurantId,
        managerId || undefined
      );

      // Reload orders to get updated data
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
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

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'preparing':
        return <Clock className="w-4 h-4" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const readyOrders = orders.filter(order => order.status === 'ready');
  const completedOrders = orders.filter(order => order.status === 'completed');

  // Manual order handlers
  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, idx?: number, field?: string) => {
    if (typeof idx === 'number' && field) {
      // Item field
      const items = [...addForm.items];
      if (field === 'dish_id') {
        const dish = menu.find(d => d.id === e.target.value);
        if (dish) {
          items[idx] = { dish_id: dish.id, name: dish.name, quantity: 1, price: dish.price };
        }
      } else if (field === 'quantity') {
        items[idx] = { ...items[idx], quantity: Math.max(1, Number(e.target.value)) };
      }
      setAddForm({ ...addForm, items });
    } else {
      setAddForm({ ...addForm, [e.target.name]: e.target.value });
    }
  };

  const handleAddItem = () => {
    setAddForm({ ...addForm, items: [...addForm.items, { dish_id: '', name: '', quantity: 1, price: 0 }] });
  };
  const handleRemoveItem = (idx: number) => {
    const items = addForm.items.filter((_, i) => i !== idx);
    setAddForm({ ...addForm, items });
  };

  const getOrderTotal = () => addForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setFieldErrors(null);
    setAddLoading(true);
    // Validation
    const errors: typeof fieldErrors = {};
    if (!addForm.customer_name.trim()) {
      errors.customer_name = 'Customer Name is required.';
    }
    if (!addForm.customer_phone.trim()) {
      errors.customer_phone = 'Customer Phone is required.';
    }
    if (!addForm.table_number.trim()) {
      errors.table_number = 'Table Number is required.';
    }
    if (addForm.items.length === 0 || addForm.items.some(item => !item.dish_id || item.quantity < 1)) {
      errors.items = 'Please select at least one dish and valid quantities.';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setAddLoading(false);
      return;
    }
    try {
      const total = getOrderTotal();
      const { error } = await supabase.from('orders').insert([
        {
          restaurant_id: restaurantId,
          customer_name: addForm.customer_name,
          customer_phone: addForm.customer_phone,
          table_number: Number(addForm.table_number),
          items: addForm.items.map(item => ({
            dish_id: item.dish_id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total,
          status: 'pending',
          order_time: new Date().toISOString(),
          notes: addForm.notes || null,
        },
      ]);
      if (error) {
        setAddError('Error adding order: ' + error.message);
        setAddLoading(false);
        return;
      }
      setShowAddModal(false);
      setAddForm({ customer_name: '', customer_phone: '', table_number: '', items: [{ dish_id: '', name: '', quantity: 1, price: 0 }], notes: '' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      await loadOrders();
    } catch (err: any) {
      setAddError('Error adding order.');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <ClipboardList className="w-6 h-6 text-black" />
          <h1 className="text-2xl font-bold text-black">Orders Management</h1>
        </div>
        <p className="text-gray-600">Track and manage customer orders from your menu</p>
      </div>

      {/* Add Order Button */}
      <div className="mb-6">
        <button
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          onClick={() => setShowAddModal(true)}
        >
          + Add Order
        </button>
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-black" onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-black mb-6 flex items-center"><Plus className="w-5 h-5 mr-2" />Create Manual Order</h2>
            {addError && <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-4 text-red-700 text-sm">{addError}</div>}
            <form onSubmit={handleAddOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Customer Name <span className="text-red-500">*</span></label>
                <input type="text" name="customer_name" value={addForm.customer_name} onChange={handleAddFormChange} className={`w-full px-3 py-2 border ${fieldErrors?.customer_name ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-black outline-none`} required />
                {fieldErrors?.customer_name && <p className="text-xs text-red-600 mt-1">{fieldErrors.customer_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Customer Phone <span className="text-red-500">*</span></label>
                <input type="text" name="customer_phone" value={addForm.customer_phone} onChange={handleAddFormChange} className={`w-full px-3 py-2 border ${fieldErrors?.customer_phone ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-black outline-none`} required />
                {fieldErrors?.customer_phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.customer_phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Table Number <span className="text-red-500">*</span></label>
                <input type="number" name="table_number" value={addForm.table_number} onChange={handleAddFormChange} className={`w-full px-3 py-2 border ${fieldErrors?.table_number ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-black outline-none`} required />
                {fieldErrors?.table_number && <p className="text-xs text-red-600 mt-1">{fieldErrors.table_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Order Items <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {addForm.items.length === 0 ? (
                    <button type="button" className="text-blue-600 text-xs mt-1 flex items-center" onClick={handleAddItem}><Plus className="w-4 h-4 mr-1" />Add Item</button>
                  ) : (
                    <>
                      {addForm.items.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <select
                            value={item.dish_id}
                            onChange={e => handleAddFormChange(e, idx, 'dish_id')}
                            className="border rounded px-2 py-1 flex-1"
                            required
                          >
                            <option value="">Select dish</option>
                            {menu.map(dish => (
                              <option key={dish.id} value={dish.id}>{dish.name} (${dish.price.toFixed(2)})</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => handleAddFormChange(e, idx, 'quantity')}
                            className="border rounded px-2 py-1 w-16"
                            required
                          />
                          <span className="text-gray-600 text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                          <button type="button" className="text-red-500" onClick={() => handleRemoveItem(idx)} title="Remove item"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button type="button" className="text-blue-600 text-xs mt-1 flex items-center" onClick={handleAddItem}><Plus className="w-4 h-4 mr-1" />Add Item</button>
                    </>
                  )}
                  {fieldErrors?.items && <p className="text-xs text-red-600 mt-1">{fieldErrors.items}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Notes</label>
                <textarea name="notes" value={addForm.notes} onChange={handleAddFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" rows={2} />
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="font-bold text-lg">Total: ${getOrderTotal().toFixed(2)}</span>
                <button type="submit" disabled={addLoading} className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <CheckCircle className="w-4 h-4" />
                  <span>{addLoading ? 'Placing...' : 'Place Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-lg shadow-lg z-50 animate-fade-out">
          <p className="font-semibold text-center flex items-center justify-center"><CheckCircle className="w-5 h-5 mr-2" />Order placed successfully!</p>
        </div>
      )}

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Preparing</p>
              <p className="text-2xl font-bold text-blue-600">{preparingOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready</p>
              <p className="text-2xl font-bold text-green-600">{readyOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-600">{completedOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-black mb-6">All Orders ({orders.length})</h2>
        
        {orders.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {orders
              .sort((a, b) => new Date(b.order_time).getTime() - new Date(a.order_time).getTime())
              .map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
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

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Complete Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Orders will appear here when customers place them through your menu</p>
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
                  <span>Payment processing simulation</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}