import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Trash2, Utensils } from 'lucide-react';
import { supabase, Dish, logActivity } from '../lib/supabase';

interface DishManagementProps {
  restaurantId: string;
}

export default function DishManagement({ restaurantId }: DishManagementProps) {
  const [dishName, setDishName] = useState('');
  const [dishType, setDishType] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishIngredients, setDishIngredients] = useState('');
  const [dishPrepTime, setDishPrepTime] = useState('');
  const [dishTags, setDishTags] = useState('');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const dishTypes = [
    'Appetizers',
    'Main Course',
    'Desserts',
    'Beverages',
    'Snacks',
    'Salads',
    'Soups',
    'Pasta',
    'Pizza',
    'Seafood',
    'Vegetarian',
    'Vegan',
    'Grilled',
    'Fried',
    'Bakery',
    'Ice Cream',
    'Juices',
    'Coffee',
    'Tea',
    'Alcoholic'
  ];

  useEffect(() => {
    if (restaurantId) {
      loadDishes();
    }
  }, [restaurantId]);

  const loadDishes = async () => {
    try {
      const { data: dishesData, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading dishes:', error);
        return;
      }

      setDishes(dishesData || []);
    } catch (error) {
      console.error('Error loading dishes:', error);
    }
  };
  
  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (dishName && dishType && dishPrice) {
      try {
        const { data: newDish, error } = await supabase
          .from('dishes')
          .insert({
            restaurant_id: restaurantId,
            name: dishName,
            type: dishType,
            price: parseFloat(dishPrice),
            ingredients: dishIngredients || null,
            prep_time: parseInt(dishPrepTime) || 0,
            tags: dishTags ? dishTags.split(',').map(tag => tag.trim()) : []
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding dish:', error);
          return;
        }

        // Log dish creation activity
        const managerId = localStorage.getItem('currentManagerId');
        await logActivity(
          'dish_added',
          {
            dish_name: dishName,
            dish_type: dishType,
            price: parseFloat(dishPrice)
          },
          restaurantId,
          managerId || undefined
        );

        // Reload dishes to get updated list
        await loadDishes();
        
        // Reset form
        setDishName('');
        setDishType('');
        setDishPrice('');
        setDishIngredients('');
        setDishPrepTime('');
        setDishTags('');
      } catch (error) {
        console.error('Error adding dish:', error);
      }
    }
    
    setIsLoading(false);
  };

  const handleRemoveDish = async (dishId: string) => {
    try {
      const dish = dishes.find(d => d.id === dishId);
      
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', dishId);

      if (error) {
        console.error('Error removing dish:', error);
        return;
      }

      // Log dish deletion activity
      const managerId = localStorage.getItem('currentManagerId');
      await logActivity(
        'dish_removed',
        {
          dish_name: dish?.name,
          dish_type: dish?.type
        },
        restaurantId,
        managerId || undefined
      );

      // Reload dishes
      await loadDishes();
    } catch (error) {
      console.error('Error removing dish:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Utensils className="w-6 h-6 text-black" />
          <h1 className="text-2xl font-bold text-black">Dish Management</h1>
        </div>
        <p className="text-gray-600">Add and manage your restaurant's menu items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-black mb-6">Add New Dish</h2>
          
          <form onSubmit={handleAddDish} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Dish Name</label>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="Enter dish name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">Dish Type</label>
              <select
                value={dishType}
                onChange={(e) => setDishType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              >
                <option value="">Select dish type</option>
                {dishTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={dishPrice}
                onChange={(e) => setDishPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">Ingredients (optional)</label>
              <input
                type="text"
                value={dishIngredients}
                onChange={(e) => setDishIngredients(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="List ingredients"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">Prep Time (minutes)</label>
              <input
                type="number"
                value={dishPrepTime}
                onChange={(e) => setDishPrepTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">Tags (optional)</label>
              <input
                type="text"
                value={dishTags}
                onChange={(e) => setDishTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                placeholder="Special Today, Most Ordered"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{isLoading ? 'Adding...' : 'Add Dish'}</span>
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-black mb-6">Menu Items ({dishes.length})</h2>
          
          {dishes.length > 0 ? (
            <div className="space-y-3">
              {dishes.map((dish) => (
                <div key={dish.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-black">{dish.name}</h4>
                      <span className="font-bold text-black">${dish.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-1 bg-black text-white text-xs rounded-full font-medium">
                        {dish.type}
                      </span>
                      {dish.prepTime > 0 && (
                        <span className="text-xs text-gray-500">{dish.prepTime} min</span>
                      )}
                    </div>
                    {dish.ingredients && (
                      <p className="text-sm text-gray-600 mb-1">{dish.ingredients}</p>
                    )}
                    {dish.tags && dish.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
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
                  <button
                    onClick={() => handleRemoveDish(dish.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No dishes added yet</p>
              <p className="text-sm text-gray-400">Add your first menu item to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}