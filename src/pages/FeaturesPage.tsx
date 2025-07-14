import React from 'react';
import { 
  Utensils, 
  QrCode, 
  BarChart3, 
  Users, 
  Shield, 
  Clock, 
  Smartphone, 
  Cloud, 
  Zap,
  CheckCircle,
  Star,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function FeaturesPage() {
  const features = [
    {
      icon: Utensils,
      title: "Advanced Menu Management",
      description: "Create, edit, and organize your restaurant menu with our intuitive drag-and-drop interface. Add photos, descriptions, pricing, and manage availability in real-time.",
      benefits: ["Drag & drop menu builder", "Real-time updates across all platforms", "Multi-language support", "Nutritional information tracking", "Seasonal menu scheduling", "Bulk import/export capabilities"]
    },
    {
      icon: QrCode,
      title: "Smart QR Code Ordering",
      description: "Generate custom QR codes for contactless ordering. Customers can scan and order directly from their phones with a seamless, branded experience.",
      benefits: ["Contactless ordering experience", "Instant QR generation", "Table-specific codes", "Custom branding options", "Order customization", "Payment integration"]
    },
    {
      icon: BarChart3,
      title: "Comprehensive Analytics",
      description: "Get detailed insights into your restaurant's performance with real-time analytics, sales tracking, and predictive reporting.",
      benefits: ["Real-time sales tracking", "Popular items analysis", "Customer behavior insights", "Revenue forecasting", "Peak hours analysis", "Inventory optimization"]
    },
    {
      icon: Users,
      title: "Staff Management System",
      description: "Manage your restaurant staff efficiently with role-based access, scheduling tools, and performance tracking.",
      benefits: ["Role-based access control", "Staff scheduling tools", "Performance tracking", "Communication hub", "Training modules", "Payroll integration"]
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with data encryption, compliance standards, and regular security audits to protect your business.",
      benefits: ["256-bit data encryption", "GDPR & PCI compliant", "Regular security audits", "Secure payment processing", "Data backup & recovery", "Access logging"]
    },
    {
      icon: Clock,
      title: "Real-time Order Management",
      description: "Receive and manage orders in real-time with instant notifications, order tracking, and kitchen display integration.",
      benefits: ["Live order tracking", "Push notifications", "Kitchen display system", "Order history", "Status updates", "Customer communication"]
    }
  ];

  const additionalFeatures = [
    { icon: Smartphone, title: "Mobile Optimized", description: "Perfect experience on all devices and screen sizes" },
    { icon: Cloud, title: "Cloud-Based Platform", description: "Access from anywhere with automatic updates" },
    { icon: Zap, title: "Lightning Fast Performance", description: "Optimized for speed with sub-second load times" },
    { icon: Star, title: "Customer Review System", description: "Collect and manage customer feedback seamlessly" },
    { icon: TrendingUp, title: "Growth & Marketing Tools", description: "Built-in promotion and loyalty features" },
    { icon: CheckCircle, title: "Easy Setup & Migration", description: "Get started in minutes with guided setup" }
  ];

  const integrations = [
    "Point of Sale (POS) Systems",
    "Payment Processors",
    "Delivery Platforms",
    "Accounting Software",
    "Inventory Management",
    "Marketing Tools"
  ];

  return (
    <div className="min-h-screen geometric-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-48 pb-20 lg:pt-56 lg:pb-32">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <div className="slide-in">
            <h1 className="heading-xl mb-8">
              Powerful Features for
              <span className="gradient-text block mt-2">Modern Restaurants</span>
            </h1>
            <p className="text-body max-w-4xl mx-auto mb-20">
              Everything you need to run a successful restaurant, all in one comprehensive platform. 
              Designed by restaurant experts, built for the future.
            </p>
            <div className="inline-flex items-center space-x-3 glass px-8 py-4 rounded-full border border-gray-200 shadow-sm mb-12">
              <CheckCircle className="w-6 h-6 text-black" />
              <span className="text-black font-semibold text-lg">50+ Features Included</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6">Core Features</h2>
            <p className="text-body max-w-3xl mx-auto">
              Comprehensive tools designed to streamline every aspect of your restaurant operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card p-10 fade-in-up">
                  <div className="flex items-start space-x-8">
                    <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="heading-md mb-4">{feature.title}</h3>
                      <p className="text-gray-600 mb-6 font-medium leading-relaxed text-lg">{feature.description}</p>
                      <ul className="space-y-3">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                            <span className="text-gray-700 font-medium">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="section-padding bg-black">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-white mb-6">Additional Capabilities</h2>
            <p className="text-xl text-gray-300 font-medium max-w-3xl mx-auto">
              Even more features to supercharge your restaurant operations and customer experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="glass-dark rounded-2xl p-8 border border-white/10 hover:bg-white/5 transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 font-medium leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6">Seamless Integrations</h2>
            <p className="text-body max-w-3xl mx-auto">
              Connect with your existing tools and services. ServeNow integrates with all major restaurant technology platforms.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {integrations.map((integration, index) => (
              <div key={index} className="card p-8 text-center">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{integration}</h3>
                <p className="text-gray-600 font-medium">Seamless integration available</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="section-padding bg-black">
        <div className="max-w-6xl mx-auto container-padding text-center">
          <div className="glass-dark rounded-3xl p-16">
            <h2 className="heading-lg text-white mb-8">Why ServeNow Stands Out</h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-medium">
              While others offer basic features, we provide a complete restaurant transformation platform.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {[
                { number: "50+", label: "Features Included" },
                { number: "99.9%", label: "Uptime Guarantee" },
                { number: "24/7", label: "Support Available" },
                { number: "500+", label: "Happy Restaurants" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-black text-white mb-2">{stat.number}</div>
                  <div className="text-gray-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => window.location.href = '/contact'}
              className="px-12 py-5 bg-white text-black font-black rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-4 mx-auto text-lg"
            >
              <span>See All Features in Action</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <div className="card p-16">
            <h2 className="heading-lg mb-8">Ready to Transform Your Restaurant?</h2>
            <p className="text-body mb-12">
              Join thousands of restaurants already using ServeNow to streamline their operations and delight customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => window.location.href = '/contact'}
                className="btn-primary flex items-center space-x-3"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => window.location.href = '/contact'}
                className="btn-secondary"
              >
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}