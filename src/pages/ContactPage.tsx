import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, Send, Clock, Users, Shield, Copy, CheckCircle, MapPin, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    plan: 'starter',
    locations: '1'
  });

  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert('Thank you for your message! We\'ll get back to you within 2-4 hours during business hours.');
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      message: '',
      plan: 'starter',
      locations: '1'
    });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhoneClick = () => {
    window.open('tel:+15551234567', '_self');
  };

  const handleEmailClick = () => {
    window.open('mailto:hello@servenow.com', '_self');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/15551234567?text=Hi, I\'m interested in ServeNow for my restaurant', '_blank');
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedContact(type);
      setTimeout(() => setCopiedContact(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      subtitle: "Speak directly with our team",
      contact: "+1 (555) 123-4567",
      action: handlePhoneClick,
      copyText: "+15551234567",
      copyType: "phone"
    },
    {
      icon: Mail,
      title: "Email Us",
      subtitle: "Send us a detailed message",
      contact: "hello@servenow.com",
      action: handleEmailClick,
      copyText: "hello@servenow.com",
      copyType: "email"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      subtitle: "Chat with us instantly",
      contact: "+1 (555) 123-4567",
      action: handleWhatsAppClick,
      copyText: "+15551234567",
      copyType: "whatsapp"
    }
  ];

  return (
    <div className="min-h-screen animated-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-48 pb-20 lg:pt-56 lg:pb-32">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <div className="slide-in">
            <h1 className="heading-xl mb-8">
              Get in Touch
              <span className="gradient-text block mt-2">We're Here to Help</span>
            </h1>
            <p className="text-body max-w-4xl mx-auto mb-20">
              Ready to transform your restaurant? Our team of experts is standing by to help you get started 
              with ServeNow and answer any questions you might have.
            </p>
            <div className="inline-flex items-center space-x-3 glass px-8 py-4 rounded-full border border-gray-200 shadow-sm mb-12">
              <Clock className="w-6 h-6 text-black" />
              <span className="text-black font-semibold text-lg">Response within 2-4 hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section className="py-20 lg:py-32">
        <div className="max-w-6xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-6">Contact Us Instantly</h2>
            <p className="text-body max-w-3xl mx-auto">
              Choose your preferred way to reach us. We're available through multiple channels for your convenience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className="card p-8 text-center hover-lift">
                  <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2">{method.title}</h3>
                  <p className="text-gray-600 font-medium mb-4">{method.subtitle}</p>
                  <p className="text-lg font-semibold text-black mb-6">{method.contact}</p>
                  <div className="space-y-3">
                    <button
                      onClick={method.action}
                      className="w-full btn-primary"
                    >
                      {method.title}
                    </button>
                    <button
                      onClick={() => copyToClipboard(method.copyText, method.copyType)}
                      className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      {copiedContact === method.copyType ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          <span>Copy {method.copyType === 'email' ? 'Email' : 'Number'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="card p-10">
              <h2 className="heading-lg mb-6">Send us a Message</h2>
              <p className="text-gray-600 mb-8 font-medium text-lg leading-relaxed">
                Fill out the form below and we'll get back to you within 2-4 hours during business hours. 
                For urgent matters, please call us directly.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-3">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none font-medium text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-3">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none font-medium text-lg"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-3">Restaurant Name</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none font-medium text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-3">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none font-medium text-lg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-3">Interested Plan</label>
                    <select
                      name="plan"
                      value={formData.plan}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none font-medium text-lg"
                    >
                      <option value="starter">Starter Plan</option>
                      <option value="professional">Professional Plan</option>
                      <option value="enterprise">Enterprise Plan</option>
                      <option value="custom">Custom Solution</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-3">Number of Locations</label>
                    <select
                      name="locations"
                      value={formData.locations}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none font-medium text-lg"
                    >
                      <option value="1">1 Location</option>
                      <option value="2-5">2-5 Locations</option>
                      <option value="6-10">6-10 Locations</option>
                      <option value="11+">11+ Locations</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-black mb-3">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none font-medium text-lg"
                    placeholder="Tell us about your restaurant, current challenges, and how we can help you succeed..."
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-5 rounded-xl font-bold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Why Choose Us */}
              <div className="card-dark p-10">
                <h3 className="text-3xl font-bold text-white mb-8">Why Choose ServeNow?</h3>
                
                <div className="space-y-8">
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2 text-xl">Quick Setup</h4>
                      <p className="text-gray-300 font-medium leading-relaxed">Get up and running in under 24 hours with our guided onboarding process</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2 text-xl">Expert Support</h4>
                      <p className="text-gray-300 font-medium leading-relaxed">Dedicated onboarding specialist and ongoing support from restaurant experts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2 text-xl">Enterprise Security</h4>
                      <p className="text-gray-300 font-medium leading-relaxed">Bank-level security with 99.9% uptime guarantee for your peace of mind</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="card p-8">
                <h4 className="text-2xl font-bold text-black mb-6">Business Hours</h4>
                <div className="space-y-4 text-gray-700 font-medium text-lg">
                  <div className="flex justify-between items-center">
                    <span>Monday - Friday</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Saturday</span>
                    <span className="font-semibold">10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sunday</span>
                    <span className="font-semibold">Closed</span>
                  </div>
                </div>
              </div>

              {/* Office Location */}
              <div className="card p-8">
                <h4 className="text-2xl font-bold text-black mb-6">Our Office</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-black text-lg">ServeNow Headquarters</p>
                      <p className="text-gray-600 font-medium">123 Restaurant Tech Blvd<br />Suite 456<br />San Francisco, CA 94105</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Globe className="w-6 h-6 text-black flex-shrink-0" />
                    <p className="text-gray-600 font-medium">Serving restaurants worldwide</p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="card p-8 text-center">
                <h4 className="text-2xl font-bold text-black mb-4">Response Time</h4>
                <p className="text-gray-600 font-medium text-lg leading-relaxed">
                  We typically respond within <strong className="text-black">2-4 hours</strong> during business hours. 
                  For urgent matters, please call us directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}