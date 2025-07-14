import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, User, Phone, MapPin, X } from 'lucide-react';
import { supabase, logActivity } from '../lib/supabase';

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
    items: [{ name: '', quantity: 1, price: 0 }],
    notes: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) {
      loadOrders();
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
  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, idx?: number, field?: string) => {
    if (typeof idx === 'number' && field) {
      // Item field
      const items = [...addForm.items];
      items[idx] = { ...items[idx], [field]: field === 'quantity' ? Number(e.target.value) : field === 'price' ? Number(e.target.value) : e.target.value };
      setAddForm({ ...addForm, items });
    } else {
      setAddForm({ ...addForm, [e.target.name]: e.target.value });
    }
  };

  const handleAddItem = () => {
    setAddForm({ ...addForm, items: [...addForm.items, { name: '', quantity: 1, price: 0 }] });
  };
  const handleRemoveItem = (idx: number) => {
    const items = addForm.items.filter((_, i) => i !== idx);
    setAddForm({ ...addForm, items });
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    // Validation
    if (!addForm.customer_name.trim() || !addForm.table_number.trim() || addForm.items.length === 0 || addForm.items.some(item => !item.name.trim() || item.quantity < 1 || item.price < 0)) {
      setAddError('Please fill all required fields and valid items.');
      setAddLoading(false);
      return;
    }
    try {
      const total = addForm.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const { error } = await supabase.from('orders').insert([
        {
          restaurant_id: restaurantId,
          customer_name: addForm.customer_name,
          customer_phone: addForm.customer_phone || null,
          table_number: Number(addForm.table_number),
          items: addForm.items.map(item => ({
            dish_id: '', // Manual orders may not have dish_id
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
      setAddForm({ customer_name: '', customer_phone: '', table_number: '', items: [{ name: '', quantity: 1, price: 0 }], notes: '' });
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black"
              onClick={() => setShowAddModal(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">Add Manual Order</h3>
            <form onSubmit={handleAddOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="customer_name"
                  value={addForm.customer_name}
                  onChange={handleAddFormChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Phone</label>
                <input
                  type="text"
                  name="customer_phone"
                  value={addForm.customer_phone}
                  onChange={handleAddFormChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Table Number<span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="table_number"
                  value={addForm.table_number}
                  onChange={handleAddFormChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order Items<span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {addForm.items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Dish name"
                        value={item.name}
                        onChange={e => handleAddFormChange(e, idx, 'name')}
                        className="border rounded px-2 py-1 flex-1"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        min={1}
                        onChange={e => handleAddFormChange(e, idx, 'quantity')}
                        className="border rounded px-2 py-1 w-16"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        min={0}
                        step={0.01}
                        onChange={e => handleAddFormChange(e, idx, 'price')}
                        className="border rounded px-2 py-1 w-20"
                        required
                      />
                      {addForm.items.length > 1 && (
                        <button type="button" className="text-red-500" onClick={() => handleRemoveItem(idx)} title="Remove item">&times;</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="text-blue-600 text-xs mt-1" onClick={handleAddItem}>+ Add Item</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={addForm.notes}
                  onChange={handleAddFormChange}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                />
              </div>
              {addError && <div className="text-red-500 text-sm">{addError}</div>}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  disabled={addLoading}
                >
                  {addLoading ? 'Adding...' : 'Add Order'}
                </button>
              </div>
            </form>
          </div>
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