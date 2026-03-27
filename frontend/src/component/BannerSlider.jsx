import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBanners } from '../redux/slice/banner.slice';

const BannerSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const dispatch = useDispatch();
    const { banners, loading } = useSelector((state) => state.banner);
    console.log(banners);

    useEffect(() => {
        dispatch(fetchBanners());
    }, [dispatch]);

    const bannerList = Array.isArray(banners)
        ? banners
        : Array.isArray(banners?.data)
            ? banners.data
            : [];

    console.log(bannerList);
    

    const activeSlides = bannerList.length > 0
        ? bannerList
            .map((banner, index) => ({
            id: banner._id || index + 1,
            image: banner.image?.url || '',
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            description: banner.description || '',
            buttonText: banner.buttonText || 'Shop Now',
            link: banner.link || '/shop',
            bgColor: banner.bgColor || 'bg-[#f1fcf1]',
            titleStyle: banner.titleStyle,
            subtitleStyle: banner.subtitleStyle
        }))
        : [];

    useEffect(() => {
        if (activeSlides.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1));
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [activeSlides.length, currentSlide]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    if (loading && activeSlides.length === 0) {
        return (
            <div className="w-full max-w-[1440px] mx-auto h-[400px] md:h-[500px] flex items-center justify-center bg-gray-50 rounded-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    if (!loading && activeSlides.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full max-w-[1440px] mx-auto overflow-hidden rounded-xl">
            {/* Slides Container */}
            <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] w-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {activeSlides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`min-w-full flex justify-start items-center px-6 py-10 md:px-16 md:py-12 min-h-[400px] md:min-h-[500px] bg-no-repeat bg-center bg-cover ${slide.bgColor}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className="flex flex-row w-full justify-between items-center gap-8 translate-x-0 md:translate-x-12">

                            {/* Text Section */}
                            <div className={`flex-1 text-left transition-all duration-700 delay-300 ${currentSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                                <h2
                                    className="text-3xl md:text-4xl font-medium mb-2"
                                    style={{ color: slide.titleStyle?.color || '#374151' }}
                                >
                                    {slide.title}
                                </h2>
                                <h1
                                    className="text-xl md:text-2xl font-medium mb-4 md:mb-8 leading-tight"
                                    style={{ color: slide.subtitleStyle?.color || '#374151' }}
                                >
                                    {slide.subtitle}
                                </h1>
                                <p className="text-sm sm:text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-sm md:max-w-xl">
                                    {slide.description}
                                </p>
                                <button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-2.5 rounded-lg font-medium text-base transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg shadow-[#38b47e]/20"
                                    onClick={() => window.location.href = slide.link}
                                >
                                    {slide.buttonText}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Dots */}
            {activeSlides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {activeSlides.map((_, index) => (
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
            )}
        </div>
    );
};

export default BannerSlider;

