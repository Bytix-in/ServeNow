import React from 'react';
import { 
  LayoutDashboard, 
  Utensils, 
  Table, 
  QrCode, 
  Settings,
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Users
} from 'lucide-react';

interface ManagerSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  restaurantName: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ManagerSidebar({ 
  currentPage, 
  onPageChange, 
  onLogout, 
  restaurantName, 
  isCollapsed, 
  onToggleCollapse 
}: ManagerSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dishes', label: 'Dish Management', icon: Utensils },
    { id: 'menu-builder', label: 'Menu Builder', icon: QrCode },
    { id: 'tables', label: 'Table Setup', icon: Table },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300`}>
      {/* Logo/Brand */}
      <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-gray-200`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-black">ServeNow</h1>
              <p className="text-xs text-gray-600 truncate">{restaurantName}</p>
            </div>
          )}
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className={`mt-4 w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-end'} text-gray-400 hover:text-black transition-colors`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}