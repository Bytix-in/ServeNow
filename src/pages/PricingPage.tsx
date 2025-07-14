import React from 'react';
import { Check, Star, Zap, Crown, ArrowRight, DollarSign, Users, Building, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PricingPage() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      icon: Zap,
      description: "Perfect for small restaurants and cafes getting started",
      features: [
        "Up to 50 menu items",
        "Basic QR code ordering",
        "Order management dashboard",
        "Basic analytics & reports",
        "Email support",
        "1 restaurant location",
        "Mobile-optimized menus",
        "Customer order history"
      ],
      popular: false,
      cta: "Get Custom Quote"
    },
    {
      name: "Professional",
      icon: Star,
      description: "Ideal for growing restaurants and small chains",
      features: [
        "Unlimited menu items",
        "Advanced QR code ordering",
        "Real-time order tracking",
        "Advanced analytics & reports",
        "Priority email & chat support",
        "Up to 5 restaurant locations",
        "Staff management tools",
        "Customer reviews system",
        "Marketing & promotion tools",
        "Inventory management",
        "Custom branding options"
      ],
      popular: true,
      cta: "Get Custom Quote"
    },
    {
      name: "Enterprise",
      icon: Crown,
      description: "For restaurant chains and large-scale operations",
      features: [
        "Everything in Professional",
        "Unlimited restaurant locations",
        "Multi-location management",
        "Advanced reporting suite",
        "24/7 phone & priority support",
        "Custom integrations & API access",
        "Dedicated account manager",
        "White-label options",
        "Advanced security features",
        "Custom training programs",
        "SLA guarantees",
        "On-premise deployment options"
      ],
      popular: false,
      cta: "Contact Sales Team"
    }
  ];

  const pricingFactors = [
    {
      icon: Building,
      title: "Number of Locations",
      description: "Pricing scales with the number of restaurant locations you manage. Single location to enterprise chains."
    },
    {
      icon: DollarSign,
      title: "Monthly Order Volume",
      description: "Cost varies based on your monthly order volume and transaction count. Pay for what you use."
    },
    {
      icon: Star,
      title: "Feature Requirements",
      description: "Different pricing tiers unlock advanced features and capabilities. Choose what you need."
    },
    {
      icon: Headphones,
      title: "Support Level",
      description: "Premium support options available including dedicated account management for enterprise."
    }
  ];

  const faqs = [
    {
      question: "How is pricing calculated?",
      answer: "Our pricing is based on four main factors: number of restaurant locations, monthly order volume, feature tier, and support level. We create custom quotes tailored to your specific needs and usage patterns."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! We offer a 14-day free trial for all plans. No credit card required to get started. You'll have access to all features during the trial period."
    },
    {
      question: "Can I change plans anytime?",
      answer: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. Enterprise customers can also arrange custom payment terms."
    },
    {
      question: "Are there any setup fees?",
      answer: "No setup fees or hidden costs. We include free onboarding and setup assistance with all plans. Our team will help you get started at no additional charge."
    },
    {
      question: "Do you offer discounts for annual payments?",
      answer: "Yes, we offer significant discounts for annual payments. Contact our sales team to learn about current promotional offers and volume discounts."
    }
  ];

  const handleCTAClick = (cta: string) => {
    navigate('/contact');
  };

  return (
    <div className="min-h-screen animated-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-48 pb-20 lg:pt-56 lg:pb-32">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <div className="slide-in">
            <h1 className="heading-xl mb-8">
              Simple, Transparent
              <span className="gradient-text"> Pricing</span>
            </h1>
            <p className="text-body max-w-4xl mx-auto mb-20">
              Our flexible pricing model adapts to your restaurant's specific needs. No hidden fees, 
              no surprises - just transparent pricing that scales with your business.
            </p>
            <div className="inline-flex items-center space-x-3 glass px-8 py-4 rounded-full border border-gray-200 shadow-sm mb-12">
              <Check className="w-6 h-6 text-black" />
              <span className="text-black font-semibold text-lg">Custom Pricing for Every Business</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Factors */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6">Pricing Based On Your Needs</h2>
            <p className="text-body max-w-3xl mx-auto">
              Our flexible pricing model considers these key factors to create the perfect plan for your restaurant
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {pricingFactors.map((factor, index) => {
              const Icon = factor.icon;
              return (
                <div key={index} className="card p-8 text-center hover-lift">
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">{factor.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">{factor.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="section-padding bg-black">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-white mb-6">Choose Your Plan</h2>
            <p className="text-xl text-gray-300 font-medium max-w-3xl mx-auto">
              All plans include our core features with no hidden fees. Get a custom quote based on your specific requirements.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div 
                  key={index} 
                  className={`relative glass-dark rounded-2xl p-10 border-2 transition-all duration-300 hover-lift ${
                    plan.popular 
                      ? 'border-white scale-105' 
                      : 'border-white/20'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-white text-black px-8 py-3 rounded-full text-sm font-bold">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-10 h-10 text-black" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">{plan.name}</h3>
                    <p className="text-gray-300 font-medium mb-6 leading-relaxed">{plan.description}</p>
                    <div className="text-center">
                      <span className="text-3xl font-black text-white">Custom Pricing</span>
                      <p className="text-sm text-gray-400 mt-2">Tailored to your specific needs</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-white flex-shrink-0" />
                        <span className="text-gray-300 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    onClick={() => handleCTAClick(plan.cta)}
                    className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 ${
                      plan.popular
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'border-2 border-white text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-6">All Plans Include</h2>
            <p className="text-body max-w-3xl mx-auto">
              Core features available in every plan, ensuring you have everything needed to run your restaurant efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              "QR Code Generation",
              "Order Management", 
              "Menu Builder",
              "Customer Support",
              "Mobile Optimized",
              "Cloud Storage",
              "Security & Backups",
              "Regular Updates",
              "Analytics Dashboard",
              "Payment Processing",
              "Multi-device Access",
              "Data Export"
            ].map((feature, index) => (
              <div key={index} className="card p-6 text-center">
                <Check className="w-10 h-10 text-black mx-auto mb-4" />
                <h3 className="text-lg font-bold text-black">{feature}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-black">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-white mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300 font-medium">
              Everything you need to know about our pricing and plans
            </p>
          </div>
          
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-dark rounded-2xl p-8 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">{faq.question}</h3>
                <p className="text-gray-300 font-medium leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <div className="card p-16">
            <h2 className="heading-lg mb-8">Ready to Get Started?</h2>
            <p className="text-body mb-12">
              Contact us for a custom quote tailored to your restaurant's specific needs and requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => navigate('/contact')}
                className="btn-primary flex items-center space-x-3"
              >
                <span>Get Custom Quote</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="btn-secondary"
              >
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}