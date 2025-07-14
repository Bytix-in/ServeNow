import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Trash2, Table } from 'lucide-react';
import { supabase, logActivity } from '../lib/supabase';

interface TableSetupProps {
  restaurantId: string;
}

export default function TableSetup({ restaurantId }: TableSetupProps) {
  const [tableNumber, setTableNumber] = useState('');
  const [tables, setTables] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      loadTables();
    }
  }, [restaurantId]);

  const loadTables = async () => {
    try {
      const { data: tablesData, error } = await supabase
        .from('tables')
        .select('table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number', { ascending: true });

      if (error) {
        console.error('Error loading tables:', error);
        return;
      }

      setTables(tablesData?.map(t => t.table_number) || []);
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const handleAddTable = async () => {
    const tableNum = parseInt(tableNumber);
    if (!tableNum || tables.includes(tableNum)) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('tables')
        .insert({
          restaurant_id: restaurantId,
          table_number: tableNum
        });

      if (error) {
        console.error('Error adding table:', error);
        return;
      }

      // Log table creation activity
      const managerId = localStorage.getItem('currentManagerId');
      await logActivity(
        'table_added',
        { table_number: tableNum },
        restaurantId,
        managerId || undefined
      );

      // Reload tables
      await loadTables();
      setTableNumber('');
    } catch (error) {
      console.error('Error adding table:', error);
    }
    
    setIsLoading(false);
  };

  const handleRemoveTable = async (tableNum: number) => {
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('restaurant_id', restaurantId)
        .eq('table_number', tableNum);

      if (error) {
        console.error('Error removing table:', error);
        return;
      }

      // Log table removal activity
      const managerId = localStorage.getItem('currentManagerId');
      await logActivity(
        'table_removed',
        { table_number: tableNum },
        restaurantId,
        managerId || undefined
      );

      // Reload tables
      await loadTables();
    } catch (error) {
      console.error('Error removing table:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Table className="w-6 h-6 text-black" />
          <h1 className="text-2xl font-bold text-black">Table Setup</h1>
        </div>
        <p className="text-gray-600">Configure and manage your restaurant tables</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Table Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-black mb-6">Add New Table</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Table Number</label>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="Enter table number"
                min="1"
              />
            </div>
            
            <button
              onClick={handleAddTable}
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{isLoading ? 'Adding...' : 'Add Table'}</span>
            </button>
          </div>
        </div>

        {/* Tables List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-black mb-6">Restaurant Tables ({tables.length})</h2>
          
          {tables.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {tables.map((table) => (
                <div key={table} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="font-semibold text-black">Table {table}</span>
                  <button
                    onClick={() => handleRemoveTable(table)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Table className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tables added yet</p>
              <p className="text-sm text-gray-400">Add your first table to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}