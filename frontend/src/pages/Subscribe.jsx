import React from 'react';
import subscribeimg from "../assets/image/subscribeimg.png"

export default function Subscribe() {
    return (
        <div className="bg-[#e4fce7] relative overflow-hidden my-20 py-12 px-6 sm:px-12  lg:px-24 xl:px-32 flex flex-col md:flex-row items-center justify-between min-h-[400px] rounded-sm ">
            
            {/* Content Section */}
            <div className="relative z-10 w-full  flex flex-col gap-5 text-center md:text-left mb-8 md:mb-0">
                <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] leading-tight">
                    Stay Home & Get Your Daily <br className="hidden lg:block" /> Needs From Our Shop
                </h2>
                <p className="text-[var(--text-secondary)] text-md sm:text-base lg:text-lg mb-2">
                    Subscribe to our latest newsletter to get news about special discounts.
                </p>

                {/* Input Form */}
                <form className="flex flex-col sm:flex-row gap-2 sm:gap-0 w-full max-w-md mx-auto md:mx-0 " onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="email"
                        placeholder="Email"
                        className="flex-grow px-5 py-3 sm:py-4 rounded-md sm:rounded-none sm:rounded-l-md focus:outline-none text-[var(--text-secondary)] w-full border-none"
                        required
                    />
                    <button
                        type="submit"
                        className=" cursor-pointer  bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition duration-300 text-[var(--btn-text)] font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-md sm:rounded-none sm:rounded-r-md whitespace-nowrap"
                    >
                        Subscribe
                    </button>
                </form>
            </div>

            {/* Image Section */}
           
                <img
                    src={subscribeimg}
                    alt="Delivery Person"
                    className=" absolute xl:right-[0] lg:right-[-5%] md:right-[-10%] sm:right-[-30%] right-[-60%]    min-w-[450px] bottom-0   "
                />
            
        </div>
    );
}

