import React from 'react';
import { FaLeaf, FaTruck, FaMedal, FaSmile } from 'react-icons/fa';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-extrabold text-green-700 sm:text-5xl">
          About Us
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Delivering the freshest groceries directly to your doorstep. We are committed to quality, sustainability, and your satisfaction.
        </p>
      </div>

      {/* Our Story Section */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden mb-16">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img 
              className="h-64 w-full object-cover md:w-96" 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Fresh vegetables in a grocery store" 
            />
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Started with a simple vision: to make fresh, healthy, and organic food accessible to everyone. We work directly with local farmers and trusted suppliers to bring you the best produce available.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Every product on our shelves is carefully selected. We believe that good food is the foundation of a happy life, and our mission is to provide you with the ingredients you need to create wholesome meals for your family.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6">
              <FaLeaf className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Fresh & Organic</h3>
            <p className="text-gray-600">
              We source organic and farm-fresh produce daily to ensure maximum nutrition and taste.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6">
              <FaTruck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
            <p className="text-gray-600">
              Get your fresh groceries delivered right to your door with our speedy delivery service.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6">
              <FaMedal className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Quality</h3>
            <p className="text-gray-600">
              We never compromise on quality. Every item passes strict quality checks.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6">
              <FaSmile className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Happy Customers</h3>
            <p className="text-gray-600">
              Your satisfaction is our top priority. Our support team is always ready to help.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
