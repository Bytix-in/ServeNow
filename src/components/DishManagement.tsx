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
  const [dishImageUrl, setDishImageUrl] = useState('');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    dishName: '',
    dishType: '',
    dishPrice: '',
    dishPrepTime: '',
    dishImageUrl: '',
  });
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

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
  
  // Helper to validate URL
  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  const validateForm = () => {
    const errors: typeof fieldErrors = {
      dishName: '',
      dishType: '',
      dishPrice: '',
      dishPrepTime: '',
      dishImageUrl: '',
    };
    let valid = true;
    if (!dishName.trim()) {
      errors.dishName = 'Dish name is required.';
      valid = false;
    }
    if (!dishType) {
      errors.dishType = 'Dish type is required.';
      valid = false;
    }
    if (!dishPrice.trim()) {
      errors.dishPrice = 'Price is required.';
      valid = false;
    } else if (isNaN(Number(dishPrice)) || Number(dishPrice) <= 0) {
      errors.dishPrice = 'Price must be a number greater than 0.';
      valid = false;
    }
    if (!dishPrepTime.trim()) {
      errors.dishPrepTime = 'Prep time is required.';
      valid = false;
    } else if (isNaN(Number(dishPrepTime)) || Number(dishPrepTime) <= 0) {
      errors.dishPrepTime = 'Prep time must be a positive number.';
      valid = false;
    }
    if (dishImageUrl.trim()) {
      if (!isValidUrl(dishImageUrl.trim())) {
        errors.dishImageUrl = 'Image URL must be a valid URL.';
        valid = false;
      }
    }
    setFieldErrors(errors);
    return valid;
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    let imageUrl = dishImageUrl.trim();
    
    try {
      // No upload, just use the provided URL
      const insertPayload = {
        restaurant_id: restaurantId,
        name: dishName,
        type: dishType,
        price: parseFloat(dishPrice),
        ingredients: dishIngredients || null,
        prep_time: parseInt(dishPrepTime) || 0,
        tags: dishTags ? dishTags.split(',').map(tag => tag.trim()) : [],
        image_url: imageUrl || null
      };
      console.log('Inserting dish:', insertPayload);
      const { error } = await supabase
        .from('dishes')
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        setErrorMsg('Error adding dish: ' + error.message);
        console.error('Error adding dish:', error, insertPayload);
        setIsLoading(false);
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
      setDishImageUrl('');
    } catch (error) {
      setErrorMsg('Error adding dish: ' + (error instanceof Error ? error.message : String(error)));
      console.error('Error adding dish:', error);
    }
    
    setIsLoading(false);
  };

  const handleEditDish = (dish: Dish) => {
    setSelectedDish(dish);
    setDishName(dish.name || '');
    setDishType(dish.type || '');
    setDishPrice(dish.price ? dish.price.toString() : '');
    setDishIngredients(dish.ingredients || '');
    setDishPrepTime(dish.prep_time ? dish.prep_time.toString() : '');
    setDishTags(dish.tags ? dish.tags.join(', ') : '');
    setDishImageUrl(dish.image_url || '');
    setFieldErrors({
      dishName: '',
      dishType: '',
      dishPrice: '',
      dishPrepTime: '',
      dishImageUrl: '',
    });
    setErrorMsg('');
  };

  const handleCancelEdit = () => {
    setSelectedDish(null);
    setDishName('');
    setDishType('');
    setDishPrice('');
    setDishIngredients('');
    setDishPrepTime('');
    setDishTags('');
    setDishImageUrl('');
    setFieldErrors({
      dishName: '',
      dishType: '',
      dishPrice: '',
      dishPrepTime: '',
      dishImageUrl: '',
    });
    setErrorMsg('');
  };

  const handleUpdateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!selectedDish) return;
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    let imageUrl = dishImageUrl.trim();
    try {
      const updatePayload = {
        name: dishName,
        type: dishType,
        price: parseFloat(dishPrice),
        ingredients: dishIngredients || null,
        prep_time: parseInt(dishPrepTime) || 0,
        tags: dishTags ? dishTags.split(',').map(tag => tag.trim()) : [],
        image_url: imageUrl || null
      };
      const { error } = await supabase
        .from('dishes')
        .update(updatePayload)
        .eq('id', selectedDish.id);
      if (error) {
        setErrorMsg('Error updating dish: ' + error.message);
        setIsLoading(false);
        return;
      }
      // Log dish update activity
      const managerId = localStorage.getItem('currentManagerId');
      await logActivity(
        'dish_updated',
        {
          dish_name: dishName,
          dish_type: dishType,
          price: parseFloat(dishPrice)
        },
        restaurantId,
        managerId || undefined
      );
      await loadDishes();
      handleCancelEdit();
    } catch (error) {
      setErrorMsg('Error updating dish: ' + (error instanceof Error ? error.message : String(error)));
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
          <h2 className="text-xl font-semibold text-black mb-6">{selectedDish ? 'Edit Dish' : 'Add New Dish'}</h2>
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{errorMsg}</p>
            </div>
          )}
          
          <form onSubmit={selectedDish ? handleUpdateDish : handleAddDish} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Dish Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={dishName}
                onChange={(e) => { setDishName(e.target.value); setFieldErrors(f => ({ ...f, dishName: '' })); }}
                className={`w-full px-3 py-2 border ${fieldErrors.dishName ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none`}
                placeholder="Enter dish name"
                required
              />
              {fieldErrors.dishName && <p className="text-xs text-red-600 mt-1">{fieldErrors.dishName}</p>}
            </div>
            
            {/* Image URL input instead of file upload */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Image URL (optional)</label>
              <input
                type="url"
                value={dishImageUrl}
                onChange={e => { setDishImageUrl(e.target.value); setFieldErrors(f => ({ ...f, dishImageUrl: '' })); }}
                className={`w-full px-3 py-2 border ${fieldErrors.dishImageUrl ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none`}
                placeholder="https://example.com/image.jpg"
              />
              {fieldErrors.dishImageUrl && <p className="text-xs text-red-600 mt-1">{fieldErrors.dishImageUrl}</p>}
              {dishImageUrl && !fieldErrors.dishImageUrl && (
                <div className="mt-2">
                  <img
                    src={dishImageUrl}
                    alt="Preview"
                    className="h-24 rounded-lg border border-gray-200 object-cover"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">Dish Type <span className="text-red-500">*</span></label>
              <select
                value={dishType}
                onChange={(e) => { setDishType(e.target.value); setFieldErrors(f => ({ ...f, dishType: '' })); }}
                className={`w-full px-3 py-2 border ${fieldErrors.dishType ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none`}
                required
              >
                <option value="">Select dish type</option>
                {dishTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {fieldErrors.dishType && <p className="text-xs text-red-600 mt-1">{fieldErrors.dishType}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">Price ($) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.01"
                value={dishPrice}
                onChange={(e) => { setDishPrice(e.target.value); setFieldErrors(f => ({ ...f, dishPrice: '' })); }}
                className={`w-full px-3 py-2 border ${fieldErrors.dishPrice ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none`}
                placeholder="0.00"
                required
              />
              {fieldErrors.dishPrice && <p className="text-xs text-red-600 mt-1">{fieldErrors.dishPrice}</p>}
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
              <label className="block text-sm font-medium text-black mb-2">Prep Time (minutes) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={dishPrepTime}
                onChange={(e) => { setDishPrepTime(e.target.value); setFieldErrors(f => ({ ...f, dishPrepTime: '' })); }}
                className={`w-full px-3 py-2 border ${fieldErrors.dishPrepTime ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none`}
                placeholder="0"
                required
              />
              {fieldErrors.dishPrepTime && <p className="text-xs text-red-600 mt-1">{fieldErrors.dishPrepTime}</p>}
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
            
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>{isLoading ? (selectedDish ? 'Updating...' : 'Adding...') : (selectedDish ? 'Update Dish' : 'Add Dish')}</span>
              </button>
              {selectedDish && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full bg-gray-200 text-black py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-black mb-6">Menu Items ({dishes.length})</h2>
          
          {dishes.length > 0 ? (
            <div className="space-y-3">
              {dishes.map((dish) => (
                <div key={dish.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex-1 flex items-center">
                    {dish.image_url && (
                      <img
                        src={dish.image_url}
                        alt={dish.name}
                        className="h-16 w-16 object-cover rounded-lg border border-gray-200 mr-4"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-black">{dish.name}</h4>
                        <span className="font-bold text-black">${dish.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2 py-1 bg-black text-white text-xs rounded-full font-medium">
                          {dish.type}
                        </span>
                        {dish.prep_time > 0 && (
                          <span className="text-xs text-gray-500">{dish.prep_time} min</span>
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
                  </div>
                  <div className="flex items-center ml-4 space-x-2">
                    <button
                      onClick={() => handleEditDish(dish)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Dish"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4 1a1 1 0 01-1.213-1.213l1-4a4 4 0 01.828-1.414z" /></svg>
                    </button>
                    <button
                      onClick={() => handleRemoveDish(dish.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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