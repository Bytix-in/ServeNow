import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 glass border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-black">ServeNow</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`nav-link text-lg ${
                  isActive(item.path)
                    ? 'text-black active'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate('/access')}
              className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
            >
              Access Portal
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-black hover:text-gray-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 font-semibold transition-all duration-300 rounded-lg ${
                    isActive(item.path)
                      ? 'text-black bg-gray-50'
                      : 'text-gray-600 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <button
                onClick={() => {
                  navigate('/access');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all duration-300 mt-4"
              >
                Access Portal
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}