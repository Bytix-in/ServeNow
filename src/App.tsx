import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import AccessPortalPage from './pages/AccessPortalPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManagerLogin from './pages/ManagerLogin';
import ManagerDashboard from './pages/ManagerDashboard';
import RestaurantDetails from './pages/RestaurantDetails';
import PublicMenuPage from './pages/PublicMenuPage';
import OrderStatusPage from './pages/OrderStatusPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/access" element={<AccessPortalPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/restaurant/:managerId" element={<RestaurantDetails />} />
        <Route path="/manager/login" element={<ManagerLogin />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/menu/:managerId" element={<PublicMenuPage />} />
        <Route path="/order-status/:orderId" element={<OrderStatusPage />} />
      </Routes>
    </Router>
  );
}

export default App;