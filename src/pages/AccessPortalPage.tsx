import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Store, ArrowRight, Users, ChefHat, Lock, Key } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function AccessPortalPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen animated-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-48 pb-20 lg:pt-56 lg:pb-32">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <div className="slide-in">
            <h1 className="heading-xl mb-8">
              Access Your
              <span className="gradient-text block mt-2">Portal</span>
            </h1>
            <p className="text-body max-w-4xl mx-auto mb-20">
              Already have an account? Choose your access level below to manage your restaurant operations 
              and access your personalized dashboard.
            </p>
            <div className="inline-flex items-center space-x-3 glass px-8 py-4 rounded-full border border-gray-200 shadow-sm mb-12">
              <Lock className="w-6 h-6 text-black" />
              <span className="text-black font-semibold text-lg">Secure Access Portal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Login Options */}
      <section className="py-20 lg:py-32">
        <div className="max-w-6xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Admin Login Card */}
            <div className="card p-12 hover-lift">
              <div className="text-center mb-10">
                <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <h3 className="heading-md mb-4">Admin Portal</h3>
                <p className="text-gray-600 font-medium text-lg leading-relaxed">
                  Comprehensive system administration for managing restaurants, creating accounts, 
                  and overseeing the entire ServeNow platform.
                </p>
              </div>

              <div className="space-y-6 mb-10">
                <div className="flex items-center space-x-4 text-gray-700">
                  <div className="w-3 h-3 bg-black rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-lg">Create and manage restaurant accounts</span>
                </div>
                <div className="flex items-center space-x-4 text-gray-700">
                  <div className="w-3 h-3 bg-black rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-lg">Generate secure manager credentials</span>
                </div>
                <div className="flex items-center space-x-4 text-gray-700">
                  <div className="w-3 h-3 bg-black rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-lg">System-wide analytics and reporting</span>
                </div>
                <div className="flex items-center space-x-4 text-gray-700">
                  <div className="w-3 h-3 bg-black rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-lg">Platform configuration and settings</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/admin/login')}
                className="w-full btn-primary flex items-center justify-center space-x-3 group"
              >
                <span>Access Admin Portal</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-6 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-medium mb-2">Demo Credentials:</p>
                  <p className="text-sm font-mono text-black">admin@servenow.com / admin123</p>
                </div>
              </div>
            </div>

            {/* Manager Login Card */}
            <div className="card p-12 hover-lift">
              <div className="text-center mb-10">
                <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Store className="w-12 h-12 text-white" />
                </div>
                <h3 className="heading-md mb-4">Manager Portal</h3>
                <p className="text-gray-600 font-medium text-lg leading-relaxed">
                  Complete restaurant management dashboard for daily operations, menu management, 
                  and customer order processing.
                </p>
              </div>

              <div className="space-y-6 mb-10">
                <div className="flex items-center space-x-4 text-gray-700">
                  <div className="w-3 h-3 bg-black rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-lg">View and edit restaurant details</span>
                </div>
                <div className="flex items-center space-x-4 text-gray-700">
                  <div className="w-3 h-3 bg-black rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-lg">Manage menu items and pricing</span>
                </div>
                <div className="flex items-center space-x-4 text-gray-700">
                  <div className="w-3 h-3 bg-black rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-lg">Process and track customer orders</span>
                </div>
                <div className="flex items-center space-x-4 text-gray-700">
                  <div className="w-3 h-3 bg-black rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-lg">Generate QR codes and analytics</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/manager/login')}
                className="w-full btn-primary flex items-center justify-center space-x-3 group"
              >
                <span>Access Manager Portal</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-6 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-medium mb-2">Credentials Required:</p>
                  <p className="text-sm text-black">Manager ID and Access Key provided by admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="section-padding bg-black">
        <div className="max-w-6xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-white mb-6">Enterprise-Grade Security</h2>
            <p className="text-xl text-gray-300 font-medium max-w-3xl mx-auto">
              Your data and restaurant operations are protected by industry-leading security measures.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-dark rounded-2xl p-8 text-center border border-white/10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Secure Authentication</h3>
              <p className="text-gray-300 font-medium leading-relaxed">
                Multi-factor authentication and role-based access control for maximum security.
              </p>
            </div>
            
            <div className="glass-dark rounded-2xl p-8 text-center border border-white/10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Key className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Encrypted Data</h3>
              <p className="text-gray-300 font-medium leading-relaxed">
                All data is encrypted in transit and at rest using industry-standard protocols.
              </p>
            </div>
            
            <div className="glass-dark rounded-2xl p-8 text-center border border-white/10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Access Control</h3>
              <p className="text-gray-300 font-medium leading-relaxed">
                Granular permissions ensure users only access what they need for their role.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6">Why Choose ServeNow?</h2>
            <p className="text-body max-w-3xl mx-auto">
              Built specifically for restaurants by industry experts who understand your unique challenges.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center hover-lift">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Intuitive Management</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                User-friendly interface designed specifically for restaurant owners and staff. 
                No technical expertise required.
              </p>
            </div>
            
            <div className="card p-8 text-center hover-lift">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Reliable & Secure</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                99.9% uptime guarantee with enterprise-grade security. Your data is always 
                safe and accessible when you need it.
              </p>
            </div>
            
            <div className="card p-8 text-center hover-lift">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Restaurant Focused</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Built by restaurant industry veterans who understand your workflow, 
                challenges, and growth requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-black">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <div className="glass-dark rounded-3xl p-16">
            <h2 className="heading-lg text-white mb-8">Need Help Getting Started?</h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-medium">
              Our support team is here to help you access your account or get started with ServeNow.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => navigate('/contact')}
                className="px-10 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-3"
              >
                <span>Contact Support</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/features')}
                className="px-10 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-black transition-all duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}