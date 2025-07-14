import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Mail, Zap, Globe, BarChart3, Clock, Users, Shield, ChefHat, ArrowRight, Star, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Deploy in minutes, not months. Get your restaurant online instantly with our streamlined setup process."
    },
    {
      icon: Globe,
      title: "Cloud-Based",
      description: "Access from anywhere, anytime. Your data is secure and always available across all devices."
    },
    {
      icon: BarChart3,
      title: "Analytics Driven",
      description: "Make data-driven decisions with comprehensive insights, reports, and real-time analytics."
    }
  ];

  const benefits = [
    "Reduce order processing time by 60%",
    "Increase customer satisfaction scores",
    "Streamline kitchen operations",
    "Boost revenue with data insights",
    "Eliminate paper menus forever",
    "Scale across multiple locations"
  ];

  const testimonials = [
    {
      quote: "ServeNow transformed our restaurant operations completely. Orders are faster, customers are happier.",
      author: "Maria Rodriguez",
      role: "Restaurant Owner"
    },
    {
      quote: "The QR code ordering system reduced our wait times significantly. Highly recommended!",
      author: "James Chen",
      role: "Cafe Manager"
    },
    {
      quote: "Best investment we made for our restaurant. The analytics help us make better decisions daily.",
      author: "Sarah Johnson",
      role: "Restaurant Chain Owner"
    }
  ];

  return (
    <div className="min-h-screen animated-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="section-padding pt-32">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center slide-in">
            <div className="mb-12">
              <div className="inline-flex items-center space-x-3 glass px-8 py-4 rounded-full border border-gray-200 mb-8 shadow-sm">
                <Rocket className="w-6 h-6 text-black" />
                <span className="text-black font-semibold text-lg">Revolutionary Restaurant Management</span>
              </div>
            </div>
            
            <h1 className="heading-xl mb-8 text-shadow">
              The type of Serve <span className="gradient-text">You deserve</span>
            </h1>
            
            <p className="text-body max-w-4xl mx-auto mb-16">
              Streamline operations, boost efficiency, and delight customers with our comprehensive 
              restaurant management platform. From menu management to order tracking, we've got you covered.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <button
                onClick={() => navigate('/contact')}
                className="btn-primary flex items-center space-x-3"
              >
                <Rocket className="w-6 h-6" />
                <span>Get Started Today</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => navigate('/contact')}
                className="btn-secondary flex items-center space-x-3"
              >
                <Mail className="w-6 h-6" />
                <span>Schedule Demo</span>
              </button>
            </div>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto stagger-animation">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="card p-8 text-center">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="heading-md mb-4">{feature.title}</h3>
                    <p className="text-gray-600 font-medium leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-black">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-white mb-6">
              Transform Your Restaurant Operations
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
              Join hundreds of restaurants already experiencing these incredible benefits
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-4 glass-dark p-6 rounded-xl">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-black" />
                </div>
                <span className="text-white font-semibold text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6">What Our Customers Say</h2>
            <p className="text-body max-w-3xl mx-auto">
              Don't just take our word for it. Here's what restaurant owners are saying about ServeNow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8 text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-black fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 font-medium text-lg mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-bold text-black text-lg">{testimonial.author}</div>
                  <div className="text-gray-600 font-medium">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="section-padding bg-black">
        <div className="max-w-6xl mx-auto container-padding text-center">
          <div className="glass-dark rounded-3xl p-16">
            <h2 className="heading-lg text-white mb-8">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-medium">
              Join hundreds of restaurants already transforming their operations with ServeNow. 
              Our expert team will guide you through easy onboarding and setup.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="glass rounded-xl p-8 border border-white/10">
                <Clock className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Quick Setup</h3>
                <p className="text-gray-300 font-medium">Get up and running in under 24 hours</p>
              </div>
              
              <div className="glass rounded-xl p-8 border border-white/10">
                <Users className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Expert Support</h3>
                <p className="text-gray-300 font-medium">Dedicated onboarding specialist assigned</p>
              </div>
              
              <div className="glass rounded-xl p-8 border border-white/10">
                <Shield className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Enterprise Security</h3>
                <p className="text-gray-300 font-medium">Bank-level security for your data</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/contact')}
              className="px-12 py-5 bg-white text-black font-black rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-4 mx-auto text-lg"
            >
              <Mail className="w-6 h-6" />
              <span>Contact Us Now for Easy Onboarding</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6">Why Choose ServeNow?</h2>
            <p className="text-body max-w-3xl mx-auto">
              We're not just another software company. We're restaurant technology specialists.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="heading-md mb-4">Easy Management</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Intuitive interface designed specifically for restaurant owners and staff. No technical expertise required.
              </p>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="heading-md mb-4">Secure & Reliable</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Enterprise-grade security with 99.9% uptime guarantee. Your data is always safe and accessible.
              </p>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <h3 className="heading-md mb-4">Restaurant Focused</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Built by restaurant industry experts who understand your unique challenges and requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto container-padding py-12">
          <div className="text-center text-gray-600">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-black text-2xl">ServeNow</span>
            </div>
            <p className="font-medium text-lg">&copy; 2025 ServeNow SaaS. All rights reserved. Transforming restaurants worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}