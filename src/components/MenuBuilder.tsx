import React, { useState, useEffect, useRef } from 'react';
import { Menu, Eye, Copy, Download, CheckCircle, Star, TrendingUp } from 'lucide-react';
import { supabase, Dish } from '../lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';

interface MenuBuilderProps {
  restaurantId: string;
  restaurantName: string;
}

export default function MenuBuilder({ restaurantId, restaurantName }: MenuBuilderProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [menuUrl, setMenuUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const qrCodeRef = useRef<HTMLCanvasElement>(null);

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
        .order('type', { ascending: true });

      if (error) {
        console.error('Error loading dishes:', error);
        return;
      }

      setDishes(dishesData || []);
    } catch (error) {
      console.error('Error loading dishes:', error);
    }
  };

  const toggleTag = (dishId: number | string, tag: string) => {
    const updateDishTags = async () => {
      try {
        const dish = dishes.find(d => String(d.id) === String(dishId));
        if (!dish) return;

        const hasTag = dish.tags.includes(tag);
        const newTags = hasTag 
          ? dish.tags.filter(t => t !== tag)
          : [...dish.tags, tag];

        const { error } = await supabase
          .from('dishes')
          .update({ tags: newTags })
          .eq('id', dishId);

        if (error) {
          console.error('Error updating dish tags:', error);
          return;
        }

        // Reload dishes to get updated data
        await loadDishes();
      } catch (error) {
        console.error('Error updating dish tags:', error);
      }
    };

    updateDishTags();
  };

  const generateMenu = () => {
    const url = `${window.location.origin}/menu/${restaurantId}`;
    setMenuUrl(url);
    setQrCodeGenerated(true);
  };

  const copyUrl = async () => {
    if (menuUrl) {
      try {
        await navigator.clipboard.writeText(menuUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const downloadQR = () => {
    if (qrCodeRef.current) {
      const canvas = qrCodeRef.current;
      const link = document.createElement('a');
      link.download = `${restaurantName}-menu-qr.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const dishesByType = dishes.reduce<Record<string, Dish[]>>((acc, dish) => {
    if (!acc[dish.type]) {
      acc[dish.type] = [];
    }
    acc[dish.type].push(dish);
    return acc;
  }, {});

  return (
    <div>
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Generate Menu</h3>
          
          <button
            onClick={generateMenu}
            disabled={dishes.length === 0}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Generate Menu Page</span>
          </button>
          
          {menuUrl && (
            <div className="mt-4 space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Menu URL:</p>
                <p className="text-sm font-mono text-black break-all">{menuUrl}</p>
              </div>
              
              <button
                onClick={copyUrl}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copiedUrl ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">QR Code</h3>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {qrCodeGenerated && menuUrl ? (
                <QRCodeCanvas
                  value={menuUrl}
                  size={200}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                  ref={qrCodeRef}
                />
              ) : (
                <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Generate menu to create QR code</p>
                </div>
              )}
            </div>
            {qrCodeGenerated && menuUrl && (
              <button
                onClick={downloadQR}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download QR Code</span>
              </button>
            )}
          </div>
        </div>

        {menuUrl && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Quick Preview</h3>
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Menu Page</span>
            </a>
          </div>
        )}

        {Object.entries(dishesByType).map(([type, dishesOfType]) => (
          <div key={type} className="mb-8">
            <h4 className="text-xl font-bold text-black mb-4 border-b-2 border-gray-200 pb-2 uppercase tracking-wide bg-gray-50 px-2 py-1 rounded">
              {type}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {dishesOfType.map((dish) => (
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
                  <span className="text-lg font-bold text-black mt-auto">${dish.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}