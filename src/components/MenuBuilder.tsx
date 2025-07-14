import React, { useState, useEffect, useRef } from 'react';
import { Menu, Eye, Copy, Download, CheckCircle, Star, TrendingUp } from 'lucide-react';
import { supabase, Dish } from '../lib/supabase';

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

  const toggleTag = (dishId: number, tag: string) => {
    const updateDishTags = async () => {
      try {
        const dish = dishes.find(d => d.id === dishId);
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
    generateQRCode(url);
  };

  const generateQRCode = (url: string) => {
    if (qrCodeRef.current && window.QRCode) {
      qrCodeRef.current.innerHTML = '';
      
      window.QRCode.toCanvas(qrCodeRef.current, url, {
        width: 200,
        height: 200,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error: any) => {
        if (error) {
          console.error('QR Code generation failed:', error);
        } else {
          setQrCodeGenerated(true);
        }
      });
    }
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
      const canvas = qrCodeRef.current.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `${restaurantName}-menu-qr.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
  };

  const dishesByType = dishes.reduce((acc, dish) => {
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
            <div ref={qrCodeRef} className="flex justify-center mb-4">
              {!qrCodeGenerated && (
                <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Generate menu to create QR code</p>
                </div>
              )}
            </div>
            
            {qrCodeGenerated && (
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
      </div>
    </div>
  );
}