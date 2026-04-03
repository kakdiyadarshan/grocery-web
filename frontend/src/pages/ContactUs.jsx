import  { useState } from 'react';
import { Home, Phone, Mail, Info, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createContact } from '../redux/slice/contact.slice';
import { setAlert } from '../redux/slice/alert.slice';
import Newsletter from '../component/Newsletter';
import { Link } from 'react-router-dom';

function ContactUs() {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.contact);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        comment: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.comment) {
            dispatch(setAlert({ text: 'Please fill in all required fields.', type: 'error' }));
            return;
        }

        const resultAction = await dispatch(createContact(formData));
        if (createContact.fulfilled.match(resultAction)) {
            setFormData({ name: '', email: '', phone: '', comment: '' });
        }
    };

    return (
        <div className="w-full">

            <div className="bg-[#f8f9fa] border-b border-gray-100 py-10 md:py-14 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1440px] mx-auto px-2 md:px-0 lg:px-4">
                    <h1 className="text-3xl md:text-[40px] font-bold text-[#1a1a1a] mb-3 tracking-tight">Contact Us</h1>
                    <div className="flex items-center gap-2 text-[13px] md:text-sm text-gray-400 font-medium">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="text-gray-300 font-light">&gt;</span>
                        <span className="text-gray-600">Contact Us</span>
                    </div>
                </div>
            </div>

            <main className="container w-full max-w-[1440px] space-y-8 px-4 py-12">

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Section - Contact Form */}
                    <div className="flex-1 w-full lg:w-2/3 border border-[var(--border)] rounded-lg p-4 sm:p-8  bg-[var(--bg-card)]">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Do You Have Any Questions?</h2>
                        <hr className="border-[var(--border)] my-6" />
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Name"
                                        className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-secondary)] bg-[var(--input-bg)]"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email *"
                                        required
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
                                    placeholder="Comment"
                                    rows="4"
                                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-[var(--text-secondary)] bg-[var(--input-bg)] resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--primary-hover)] transition-colors text-[var(--btn-text)] font-medium py-3 px-9 rounded-md shadow-[var(--shadow)] flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Section - Contact Info */}
                    <div className=" flex-shrink w-full lg:w-1/3 border border-[var(--border)] rounded-lg p-4 sm:p-8 shadow-[var(--shadow)] bg-[var(--bg-card)] ">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Get in touch with us</h2>

                        <hr className="border-[var(--border)] my-6" />

                        <div className="space-y-6 text-[var(--text-secondary)]">
                            {/* Address */}
                            <div className="flex items-start gap-2 sm:gap-4">
                                <Home className="w-5 h-5 text-[var(--text-primary)] flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-semibold text-base text-[var(--text-primary)] mb-1">Address:</p>
                                    <p className="text-sm sm:text-base">
                                        33 New Montgomery St.
                                        Ste 750 San Francisco,
                                        CA, USA 94105
                                    </p>

                                </div>
                            </div>

                            <div className="border-t border-gray-100 hidden"></div>

                            {/* Contact No */}
                            <div className="flex items-start gap-2 sm:gap-4 pt-1">
                                <Phone className="w-5 h-5 text-[var(--text-primary)] flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-semibold text-base text-[var(--text-primary)] mb-1">Contact No.:</p>
                                    <p className="text-sm sm:text-base">(+91)7-723-4608</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 hidden"></div>

                            {/* Email */}
                            <div className="flex items-start gap-2 sm:gap-4 pt-1">
                                <Mail className="w-5 h-5 text-[var(--text-primary)] flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-semibold text-base text-[var(--text-primary)] mb-1">Email:</p>
                                    <p className="text-sm sm:text-base break-all">gromend@exampledemo.com</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 hidden"></div>

                            {/* Store Info */}
                            <div className="flex items-start gap-2 sm:gap-4 pt-1">
                                <Info className="w-5 h-5 text-[var(--text-primary)] flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-semibold text-base text-[var(--text-primary)] mb-1">Store Info:</p>
                                    <p className="text-sm sm:text-base">Monday – Friday 10 AM – 8 PM</p>
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

                {/* Newsletter */}
                <Newsletter className="w-full pt-10 mt-8" />

            </main>

        </div>
    );
}

export default ContactUs;