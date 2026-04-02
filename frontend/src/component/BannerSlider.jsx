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
            subtitleStyle: banner.subtitleStyle,
            textPosition: banner.textPosition || 'left'
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
                        className={`min-w-full flex items-center px-6 py-10 md:px-16 md:py-12 min-h-[400px] md:min-h-[500px] bg-no-repeat bg-center bg-cover transition-all duration-1000 ${slide.bgColor} ${slide.textPosition === 'center' ? 'justify-center text-center' : slide.textPosition === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className={`flex flex-col w-full max-w-2xl transition-all duration-700 delay-300 ${currentSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>

                            {/* Main Title */}
                            <h2
                                className={`font-semibold mb-2 sm:mb-4 leading-tight slide-title-${index}`}
                                style={{ 
                                    color: slide.titleStyle?.color || '#1b1b1b',
                                }}
                            >
                                {slide.title}
                            </h2>

                            {/* Subtitle */}
                            <h1
                                className={`font-medium mb-4 md:mb-8 leading-tight slide-subtitle-${index}`}
                                style={{ 
                                    color: slide.subtitleStyle?.color || '#555555',
                                }}
                            >
                                {slide.subtitle}
                            </h1>

                            {/* Description (Optional) */}
                            {slide.description && (
                                <p className={`text-sm sm:text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-sm md:max-w-xl ${slide.textPosition === 'center' ? 'mx-auto' : slide.textPosition === 'right' ? 'ml-auto' : ''}`}>
                                    {slide.description}
                                </p>
                            )}

                            {/* Button */}
                            <div className={`flex ${slide.textPosition === 'center' ? 'justify-center' : slide.textPosition === 'right' ? 'justify-end' : 'justify-start'}`}>
                                <button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-2.5 rounded-lg font-bold text-sm sm:text-base transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg shadow-[#38b47e]/20 active:scale-95"
                                    onClick={() => window.location.href = slide.link}
                                >
                                    {slide.buttonText}
                                </button>
                            </div>

                            {/* Responsive scaling with dynamic classes */}
                            <style dangerouslySetInnerHTML={{ __html: `
                                .slide-title-${index} { 
                                    font-size: calc(${slide.titleStyle?.fontSize || '48px'} * 0.7); 
                                }
                                .slide-subtitle-${index} { 
                                    font-size: calc(${slide.subtitleStyle?.fontSize || '20px'} * 0.8); 
                                }
                                @media (min-width: 768px) {
                                    .slide-title-${index} { font-size: ${slide.titleStyle?.fontSize || '48px'} !important; }
                                    .slide-subtitle-${index} { font-size: ${slide.subtitleStyle?.fontSize || '20px'} !important; }
                                }
                            `}} />
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

