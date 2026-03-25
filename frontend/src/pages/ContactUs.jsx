import React, { useState } from 'react';
import { Home, Phone, Mail, Info } from 'lucide-react';
import Subscribe from './Subscribe';
import axios from 'axios';
import { BASE_URL } from '../utils/baseUrl';

function ContactUs() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        comment: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/contact`, formData);
            if (response.data.success) {
                alert('Your message has been sent successfully!');
                setFormData({ name: '', email: '', phone: '', comment: '' });
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to send message. Please try again later.');
            console.error('Contact error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[1440px]  space-y-8  mx-auto p-4 sm:p-6 lg:p-8 mt-10 mb-20">


            <div className=" w-full flex flex-col lg:flex-row gap-8">
                {/* Left Section - Contact Form */}
                <div className="flex-1 w-full lg:w-2/3 border border-[var(--border)] rounded-lg p-6 sm:p-8 shadow-sm bg-[var(--bg-card)]">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Do You Have Any Questions?</h2>
                    <hr className="border-[var(--border)] my-6" />
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Name *"
                                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-secondary)] bg-[var(--input-bg)]"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Email *"
                                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-secondary)] bg-[var(--input-bg)]"
                                />
                            </div>
                        </div>

                        <div>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone number"
                                className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-secondary)] bg-[var(--input-bg)]"
                            />
                        </div>

                        <div>
                            <textarea
                                name="comment"
                                value={formData.comment}
                                onChange={handleChange}
                                required
                                placeholder="Comment *"
                                rows="4"
                                className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-secondary)] bg-[var(--input-bg)] resize-none"
                            ></textarea>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors text-[var(--btn-text)] font-medium py-3 px-9 rounded-md shadow-[var(--shadow)] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Section - Contact Info */}
                <div className=" flex-shrink w-full lg:w-1/3 border border-[var(--border)] rounded-lg p-6 sm:p-8 shadow-[var(--shadow)] bg-[var(--bg-card)] ">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Get in touch with us</h2>

                    <hr className="border-[var(--border)] my-6" />

                    <div className="space-y-6 text-base text-[var(--text-secondary)]">
                        {/* Address */}
                        <div className="flex items-start gap-4">
                            <Home className="w-5 h-5 text-[var(--text-primary)] flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-[var(--text-primary)] mb-1">Address:</p>
                                <p>33 New Montgomery St.</p>
                                <p>Ste 750 San Francisco,</p>
                                <p>CA, USA 94105</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 hidden"></div>

                        {/* Contact No */}
                        <div className="flex items-start gap-4 pt-1">
                            <Phone className="w-5 h-5 text-[var(--text-primary)] flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-[var(--text-primary)] mb-1">Contact No.:</p>
                                <p>(+91)7-723-4608</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 hidden"></div>

                        {/* Email */}
                        <div className="flex items-start gap-4 pt-1">
                            <Mail className="w-5 h-5 text-[var(--text-primary)] flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-[var(--text-primary)] mb-1">Email:</p>
                                <p>gromend@exampledemo.com</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 hidden"></div>

                        {/* Store Info */}
                        <div className="flex items-start gap-4 pt-1">
                            <Info className="w-5 h-5 text-[var(--text-primary)] flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-[var(--text-primary)] mb-1">Store Info:</p>
                                <p>Monday – Friday 10 AM – 8 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="w-full mt-8 lg:mt-12">
                <iframe
                    title="San Francisco Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098464!2d-122.50764017948534!3d37.75781499660172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA%2C%20USA!5e0!3m2!1sen!2sin!4v1703009026410!5m2!1sen!2sin"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className=" shadow-[var(--shadow)] border border-[var(--border)]"
                ></iframe>
            </div>

            <Subscribe />

        </div>
    );
}

export default ContactUs;