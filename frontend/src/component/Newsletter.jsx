import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NewsletterImage from '../Image/newsletter.png';
import { subscribeNewsletter } from '../redux/slice/subscribe.slice';

const Newsletter = ({ className = "w-full py-6 mt-10" }) => {
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();
    const { submitLoading } = useSelector(state => state.subscribe);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(subscribeNewsletter(email));
        if (result.type.endsWith('/fulfilled')) {
            setEmail('');
        }
    };

    return (
        <div className={className}>
            <div
                className="relative overflow-hidden rounded-md bg-[#DDEEE5] bg-no-repeat bg-cover bg-center sm:bg-right min-h-[380px] flex items-center"
                style={{ backgroundImage: `url(${NewsletterImage})` }}
            >
                <div className="relative z-10 p-6 md:p-10 lg:p-20 w-full lg:w-1/2">
                    {/* LEFT CONTENT */}
                    <div className="text-left">
                        {/* Title */}
                        <h2 className="text-[#253D4E] text-2xl sm:text-3xl font-medium leading-tight">
                            Stay Home & Get Your Daily <br className="hidden sm:block" />
                            Needs From Our Shop
                        </h2>

                        {/* Description */}
                        <p className="text-[#7E7E7E] mt-4 text-sm">
                            Subscribe to our latest newsletter to get news about special discounts.
                        </p>

                        {/* Input + Button */}
                        <form className="mt-8 flex flex-col sm:flex-row gap-2 sm:gap-0 w-full max-w-md mx-auto md:mx-0 " onSubmit={handleSubmit}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-grow px-5 py-3 sm:py-4 rounded-md sm:rounded-none sm:rounded-l-md focus:outline-none text-[var(--text-secondary)] w-full border-none"
                                required
                            />
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className={`cursor-pointer bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition duration-300 text-[var(--btn-text)] font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-md sm:rounded-none sm:rounded-r-md whitespace-nowrap ${submitLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {submitLoading ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Newsletter;
