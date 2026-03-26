import React, { useState, useEffect } from 'react';
import image1 from '../Image/banner1.png';
import image2 from '../Image/banner2.png';

const slides = [
    {
        id: 1,
        image: image1,
        title: 'Fresh Vegetables',
        subtitle: 'Big Discount',
        description: 'Save up to 50% off on your first order',
        buttonText: 'Shop Now',
        link: '/shop',
        bgColor: 'bg-[#f1fcf1]'
    },
    {
        id: 2,
        image: image2,
        title: 'Organic Fruits',
        subtitle: 'Great Offers',
        description: 'Fresh from the farm to your doorstep',
        buttonText: 'Shop Now',
        link: '/shop',
        bgColor: 'bg-[#f1fcf1]'
    }
];

const BannerSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <div className="relative w-full max-w-[1440px] mx-auto overflow-hidden rounded-2xl shadow-sm">
            {/* Slides Container */}
            <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] w-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`min-w-full flex justify-start items-center px-6 py-10 md:px-16 md:py-12 min-h-[400px] md:min-h-[500px] bg-no-repeat bg-center bg-cover ${slide.bgColor}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className="flex flex-row w-full justify-between items-center gap-8 translate-x-0 md:translate-x-12">

                            {/* Text Section */}
                            <div className={`flex-1 text-left transition-all duration-700 delay-300 ${currentSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                                <h2 className="text-4xl md:text-6xl font-medium text-gray-700 mb-2">
                                    {slide.title}
                                </h2>
                                <h1 className="text-3xl sm:text-4xl md:text-6xl font-medium text-gray-700 mb-4 md:mb-8 leading-tight">
                                    {slide.subtitle}
                                </h1>
                                <p className="text-sm sm:text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-sm md:max-w-xl">
                                    {slide.description}
                                </p>
                                <button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-2.5 rounded-lg font-medium text-base transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg shadow-[#38b47e]/20">
                                    {slide.buttonText}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all duration-500 ${currentSlide === index
                            ? 'w-2.5 bg-[var(--primary)]'
                            : 'w-2.5 bg-white'
                            }`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default BannerSlider;
