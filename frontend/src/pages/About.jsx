import React from 'react';
import { FaLeaf, FaHandHoldingUsd, FaRecycle, FaHandHoldingWater, FaShoppingBasket, FaPiggyBank } from 'react-icons/fa';
import Subscribe from './Subscribe';

export default function About() {
  return (
    <div className="min-h-screen max-w-[1440px] mx-auto   py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="w-full text-center mb-16">
        <h1 className="text-4xl font-extrabold text-green-700 sm:text-5xl">
          About Us
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Delivering the freshest groceries directly to your doorstep. We are committed to quality, sustainability, and your satisfaction.
        </p>
      </div>

      {/* Our Story Section */}
      <div className="w-full mb-16 ">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
          
          {/* Images Grid */}
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
            <img 
              src="https://retailinsider.b-cdn.net/wp-content/uploads/2020/03/shutterstock_373602469.jpg" 
              alt="Grocery delivery" 
              className="w-full h-full object-cover rounded-xl shadow-sm"
            />
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&h=400&q=80" 
              alt="Fresh vegetables stand" 
              className="w-full h-full object-cover rounded-xl shadow-sm"
            />
            <img 
              src="https://cdn.metro-online.com/-/media/Project/MCW/PK_Metro/2020-to-2021/Product-world-small-banners/14-Grocery-World.jpg?rev=8746957d463b4e61bc45e75c415024d3" 
              alt="Grocery delivery interaction" 
              className="w-full h-full object-cover rounded-xl shadow-sm"
            />
            <img 
              src="https://img-cdn.misfitsmarket.com/melodious-taiyaki-9pkr2z/aH6BNUMqNJQqILDE_20240730_Assortment_4_Fill.jpg" 
              alt="Fresh vegetables closeup" 
              className="w-full h-full object-cover rounded-xl shadow-sm"
            />
          </div>

          {/* Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
           
            <h2 className="text-3xl lg:text-4xl font-bold text-green-700 mb-6">
              Fresh, Healthy, and Delivered!
            </h2>
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-4">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            {/* <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p> */}
          </div>
          
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="w-full mb-16 ">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-12">
          Why Choose us?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-12 lg:gap-x-24 gap-y-10">
          
          {/* Feature 1 */}
          <div className="flex items-start flex-row gap-6">
            <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-xl bg-slate-50 border border-slate-100 text-green-700">
              <FaLeaf className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Freshness & Quality Guaranteed</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start flex-row gap-6">
            <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-xl bg-slate-50 border border-slate-100 text-green-700">
              <FaHandHoldingUsd className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Affordable & Great Value</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start flex-row gap-6">
            <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-xl bg-slate-50 border border-slate-100 text-green-700">
              <FaRecycle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Sustainable & Locally Sourced</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-start flex-row gap-6">
            <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-xl bg-slate-50 border border-slate-100 text-green-700">
              <FaHandHoldingWater className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Safe, Hygienic, & Trusted</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="flex items-start flex-row gap-6">
            <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-xl bg-slate-50 border border-slate-100 text-green-700">
              <FaShoppingBasket className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Easy & Convenient Shopping</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="flex items-start flex-row gap-6">
            <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-xl bg-slate-50 border border-slate-100 text-green-700">
              <FaPiggyBank className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Smart Savings & Best Prices</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Subscribe Section */}
      <Subscribe />

    </div>
  );
}
