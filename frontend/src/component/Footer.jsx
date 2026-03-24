import React from 'react';
import {  ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal, FaCcDiscover } from 'react-icons/fa';
import { TiMessages } from 'react-icons/ti';

const Footer = () => {
    // const scrollToTop = () => {
    //     window.scrollTo({
    //         top: 0,
    //         behavior: 'smooth'
    //     });
    // };

    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8 relative mt-12">
            <div className="container mx-auto px-4 lg:px-6">
                
                {/* Scroll To Top Button  */}
                {/* <button 
                    onClick={scrollToTop}
                    className="absolute bottom-20 right-6 sm:right-10 w-10 h-10 bg-[var(--primary)] text-white rounded-full flex items-center justify-center hover:bg-[var(--primary-hover)] transition-colors shadow-md z-10"
                    aria-label="Scroll to top"
                >
                    <ChevronUp className="w-5 h-5 stroke-[2.5]" />
                </button> */}

               
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 lg:gap-8 pb-12">
                    
                    {/* Column 1: Contact Us */}
                    <div className="lg:border-r border-gray-100 lg:pr-8">
                        <h3 className="text-[16px] sm:text-[17px] font-bold text-[var(--text-gray)] mb-6 tracking-wide">Contact Us</h3>
                        <div className="text-[14.5px] text-gray-500 leading-relaxed mb-5">
                            <p>Gromend - Grocery Store</p>
                            <p>507-Union Trade Ipsum Doler</p>
                            <p>Centre France</p>
                        </div>
                        <p className="text-[14.5px] text-gray-500 mb-6 font-medium tracking-wide">hello@blocks.com</p>
                        <p className="text-[18px] sm:text-[20px] font-bold text-[var(--primary)] tracking-wider mb-6">
                            +81 520-150-001
                        </p>
                        
                        <div className="flex items-center gap-3.5 mt-2">
                            <TiMessages className="w-9 h-9 text-[var(--primary)] stroke-[1.5]" />
                            <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-[var(--text-gray)] tracking-wide">Online Chat</span>
                                <span className="text-[13.5px] text-[var(--text-gray)] font-medium">Get Expert Help</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Column 2: Quick Links */}
                    <div className="lg:pl-6">
                        <h3 className="text-[16px] sm:text-[17px] font-bold text-[var(--text-gray)] mb-6 tracking-wide">Category</h3>
                        <ul className="flex flex-col gap-3">
                            <li><Link to="/" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Chips & Namkeens</Link></li>
                            <li><Link to="/" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Vegetables</Link></li>
                            <li><Link to="/" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Fruits</Link></li>
                            <li><Link to="/" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Dry fruits</Link></li>
                            <li><Link to="/" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Bakery & Snacks</Link></li>
                            <li><Link to="/" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Ice Cream & Frozen</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Information */}
                    <div>
                        <h3 className="text-[16px] sm:text-[17px] font-bold text-[var(--text-gray)] mb-6 tracking-wide">Information</h3>
                        <ul className="flex flex-col gap-3">
                            <li><Link to="/policy-buyers" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Policy for Buyers</Link></li>
                            <li><Link to="/shipping-refund" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Shipping & Refund</Link></li>
                            <li><Link to="/policy-sellers" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Policy for Sellers</Link></li>
                            <li><Link to="/delivery-information" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Delivery Information</Link></li>
                            <li><Link to="/terms-conditions" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Terms & Conditions</Link></li>
                            <li><Link to="/faqs" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Need Help ? */}
                    <div>
                        <h3 className="text-[16px] sm:text-[17px] font-bold text-[var(--text-gray)] mb-6 tracking-wide">Need Help ?</h3>
                        <ul className="flex flex-col gap-3">
                            <li><Link to="/aboutus" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">About Us</Link></li>
                            <li><Link to="/contact" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Contact</Link></li>
                            <li><Link to="/shipping" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Shipping</Link></li>
                            <li><Link to="/privacy-policy" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Privacy Policy</Link></li>
                            <li><Link to="/sitemap" className="text-[14.5px] text-gray-500 hover:text-[var(--primary)] transition-colors inline-block">Sitemap</Link></li>
                        </ul>
                    </div>

                </div>
                <div className="border-t border-gray-100 pt-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                    
                    {/* Social Icons */}
                    <div className="flex items-center gap-3">
                        <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all">
                            <FaFacebookF className="w-4 h-4" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all">
                            <FaInstagram className="w-4 h-4" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all">
                            <FaYoutube className="w-4 h-4" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all">
                            <FaTwitter className="w-4 h-4" />
                        </a>
                    </div>

                    <p className="text-[13.5px] text-gray-500 text-center">
                        &copy; 2026, Gromend - Grocery Store (Password: demo) Powered by Shopify
                    </p>

                    {/* Payment Icons */}
                    <div className="flex items-center gap-2 sm:gap-3 text-3xl opacity-80">
                        <FaCcVisa className="text-[#1a1f71]" />
                        <FaCcMastercard className="text-[#eb001b]" />
                        <FaCcAmex className="text-[#002663]" />
                        <FaCcPaypal className="text-[#003087]" />
                        <FaCcDiscover className="text-[#e2531a]" />
                    </div>

                </div>

            </div>
        </footer>
    );
};


export default Footer;