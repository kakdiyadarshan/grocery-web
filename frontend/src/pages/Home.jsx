import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BannerSlider from '../component/BannerSlider';
import ProductCard from '../component/ProductCard';
import ProductSlider from '../component/ProductSlider';

import subbanner1 from '../Image/sub-banner-1.png';
import subbanner2 from '../Image/sub-banner-2.png';
import subbanner3 from '../Image/sub-banner-3.png';
import cmsbanner1 from '../Image/cms-banner-1.png';
import cmsbanner2 from '../Image/cms-banner-2.png';
import bannerImg from '../Image/banner-img.jpg';
import Newsletter from '../component/Newsletter';

import { useDispatch, useSelector } from 'react-redux';

import { getAllProducts, getBestSellingProducts, getFeaturedProducts } from '../redux/slice/product.slice';
import { fetchOfferBanners } from '../redux/slice/offerbanner.slice';


function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories: apiCategories } = useSelector((state) => state.category);
  const { products: apiProducts, allProducts, featuredProducts, bestSellingProducts } = useSelector((state) => state.product);
  const { offerbanners } = useSelector((state) => state.offerbanner);

  useEffect(() => {
    dispatch(getAllProducts({ paginate: false }));
    dispatch(getFeaturedProducts());
    dispatch(fetchOfferBanners());
    dispatch(getBestSellingProducts());
  }, [dispatch]);

  const scrollRef = useRef(null);
  const [isPending, setIsPending] = useState(false);

  const availableFeaturedCategories = useMemo(() => {
    if (!apiCategories || !allProducts) return [];
    return apiCategories.filter(cat =>
      allProducts.some(product => {
        const productCatName = typeof product.category === 'object' ? product.category?.categoryName : product.category;
        return productCatName === cat.categoryName;
      })
    );
  }, [apiCategories, allProducts]);

  const categories = useMemo(() => {
    return availableFeaturedCategories.map(c => c.categoryName).slice(0, 3);
  }, [availableFeaturedCategories]);

  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  const handleTabChange = (category) => {
    if (category === activeTab) return;
    setIsPending(true);
    setTimeout(() => {
      setActiveTab(category);
      setIsPending(false);
    }, 200);
  };

  const filteredProducts = apiProducts?.length > 0 ? apiProducts.filter(product => {
    const catName = typeof product.category === 'object' ? product.category?.categoryName : product.category;
    return catName === activeTab;
  }) : [];

  useEffect(() => {
    const setupDragScroll = (el) => {
      if (!el) return null;
      let isDown = false;
      let startX;
      let scrollLeft;

      const onWheel = (e) => {
        if (e.deltaY === 0) return;
        e.preventDefault();
        el.scrollTo({
          left: el.scrollLeft + (e.deltaY * 3),
          behavior: 'smooth'
        });
      };

      const mouseDown = (e) => {
        isDown = true;
        el.classList.add('cursor-grabbing');
        el.classList.remove('cursor-grab');
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
      };

      const mouseLeave = () => {
        isDown = false;
        el.classList.remove('cursor-grabbing');
        el.classList.add('cursor-grab');
      };

      const mouseUp = () => {
        isDown = false;
        el.classList.remove('cursor-grabbing');
        el.classList.add('cursor-grab');
      };

      const mouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 3;
        el.scrollLeft = scrollLeft - walk;
      };

      el.addEventListener('wheel', onWheel, { passive: false });
      el.addEventListener('mousedown', mouseDown);
      el.addEventListener('mouseleave', mouseLeave);
      el.addEventListener('mouseup', mouseUp);
      el.addEventListener('mousemove', mouseMove);

      return () => {
        el.removeEventListener('wheel', onWheel);
        el.removeEventListener('mousedown', mouseDown);
        el.removeEventListener('mouseleave', mouseLeave);
        el.removeEventListener('mouseup', mouseUp);
        el.removeEventListener('mousemove', mouseMove);
      };
    };

    const cleanupCat = setupDragScroll(scrollRef.current);

    return () => {
      if (cleanupCat) cleanupCat();
    };
  }, []);


  return (
    <>
      <div className='bg-white min-h-screen'>
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-4 py-4 sm:py-6 md:py-8">

          {/* 1. Banner Slider */}
          <BannerSlider />

          {/* 2. Featured Categories */}
          <div className='mt-16 pb-12'>
            <div className='mb-6'>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#31353C] border-b border-gray-200 pb-5">Featured Categories</h2>
            </div>

            <div
              ref={scrollRef}
              className='flex overflow-x-auto no-scrollbar pt-4 pb-6 gap-6 md:gap-10 lg:gap-14 px-5 sm:px-8 scroll-smooth w-full cursor-grab'
            >
              {availableFeaturedCategories?.map((category, index) => (
                <div key={category._id || index}
                  className='group cursor-pointer text-center flex-shrink-0'
                  onClick={() => navigate(`/shop?category=${encodeURIComponent(category.categoryName)}`)}
                >
                  <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-green-100 mb-3'>
                    <img src={category.categoryImage?.url} alt={category.categoryName} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' />
                  </div>
                  <span className='text-sm sm:text-base font-semibold text-gray-700 group-hover:text-[var(--primary)] transition-colors'>
                    {category.categoryName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Sub Banners */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8 mb-10'>
            {(offerbanners?.length > 0 ? offerbanners.slice(0, 3) : [
              { image: { url: subbanner1 }, title: 'Fresh Organic Products', subtitle: '10% Discount', link: '/shop' },
              { image: { url: subbanner2 }, title: 'Strawberry & Lemon', subtitle: '20% Discount', link: '/shop' },
              { image: { url: subbanner3 }, title: 'Fresh Bilberry Products', subtitle: '30% Discount', link: '/shop' },
            ]).map((banner, index) => (
              <div key={index} className='group relative rounded-lg overflow-hidden cursor-pointer h-64 w-full'>
                {/* Image background with zoom effect */}
                <div className='absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105'>
                  <img src={banner.image?.url} alt={banner.title} className='w-full h-full object-cover' />
                </div>

                {/* Content Overlay */}
                <div className={`relative h-full flex flex-col justify-center p-8 z-10 w-full ${banner.textPosition === 'center' ? 'items-center text-center' : banner.textPosition === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
                  <span
                    className='block mb-2'
                    style={{
                      color: banner.subtitleStyle?.color || '#374151',
                      fontSize: banner.subtitleStyle?.fontSize || '18px'
                    }}
                  >
                    {banner.subtitle}
                  </span>
                  <h3
                    className='font-semibold mb-4 max-w-[200px] leading-tight'
                    style={{
                      color: banner.titleStyle?.color || '#2e3d30',
                      fontSize: banner.titleStyle?.fontSize || '24px'
                    }}
                  >
                    {banner.title}
                  </h3>
                  <div className='flex items-center gap-1 group/btn'>
                    <button
                      onClick={() => window.location.href = banner.link}
                      className='text-sm text-gray-800 border-b border-gray-800 hover:border-none'>
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 4. Popular Products with Tabs */}
          <div className='py-8 mb-8'>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 pb-5 gap-4">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#31353C]">Popular Products</h2>
              <div className="flex flex-wrap gap-4 sm:gap-8">
                {categories.map((category, index) => (
                  <button
                    key={`${category}-${index}`}
                    onClick={() => handleTabChange(category)}
                    className={`text-sm sm:text-base font-medium transition-all duration-300 relative pb-1 ${activeTab === category
                      ? "text-[var(--primary-hover)] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[var(--primary-hover)]"
                      : "text-gray-500 hover:text-[var(--primary-hover)]"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className={`grid grid-cols-1 min-[425px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 transition-all duration-300 ${isPending ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>

          {/* 5. Save Banners */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-16'>
            {(offerbanners?.length >= 5 ? offerbanners.slice(3, 5) : [
              {
                image: { url: cmsbanner1 },
                title: 'Enjoy 15% OFF For All Gegetable And Fruit',
                titleStyle: { color: '#253D4E' },
                link: '/shop'
              },
              {
                image: { url: cmsbanner2 },
                title: 'Organic Save 17% On Organic Juice',
                titleStyle: { color: '#253D4E' },
                link: '/shop'
              },
            ]).map((banner, index) => (
              <div
                key={index}
                className='group relative rounded-lg overflow-hidden cursor-pointer h-[220px] sm:h-[280px] w-full shadow-sm'
              >
                {/* Full Image Background */}
                <div className='absolute inset-0 transition-transform duration-1000 ease-out group-hover:scale-105'>
                  <img src={banner.image?.url} alt="" className='w-full h-full object-cover' />
                </div>

                {/* Text Content */}
                <div className={`relative h-full flex flex-col justify-center p-8 sm:p-12 z-10 w-full ${banner.textPosition === 'center' ? 'items-center text-center' : banner.textPosition === 'right' ? 'items-end text-right' : 'items-start text-left sm:w-2/3'}`}>
                  <h3
                    className='font-semibold mb-6 sm:mb-8 max-w-[200px] sm:max-w-[320px] leading-tight'
                    style={{
                      color: banner.titleStyle?.color || '#253D4E',
                      fontSize: banner.titleStyle?.fontSize || '24px'
                    }}
                  >
                    {banner.title}
                  </h3>
                  <button
                    onClick={() => window.location.href = banner.link}
                    className='bg-[var(--primary)] text-white px-5 py-2.5 sm:py-2.5 rounded-md font-medium text-sm sm:text-base transition-all duration-300 hover:bg-[var(--primary-hover)] transform active:scale-95 shadow-md'>
                    Shop Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 6. Featured Products Slider (Responsive Grid UI) */}
          <ProductSlider title="Featured Products" products={featuredProducts} className="mt-12 mb-4" />
        </main>

        {/* 7. Deal Banner */}
        <div
          className="relative bg-no-repeat bg-cover bg-center sm:bg-[position:80%_center] bg-scroll lg:bg-fixed py-16 md:py-16 lg:py-20 xl:py-28 w-full"
          style={{ backgroundImage: `url(${bannerImg})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-0"></div>

          {/* Content Wrapper to align text with the rest of the site */}
          <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-4 w-full">
            <p className="text-sm sm:text-xl md:text-2xl font-medium text-[var(--primary)] uppercase tracking-wider mb-5">UP TO 35% OFF</p>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-medium text-[#252525] leading-[1.15] mb-6 max-w-[500px]">
              Fresh Organic Food <br /> Health Benefits
            </h2>

            <p className="text-base sm:text-xl md:text-2xl text-[#333333] mb-6 font-medium">
              Starting At Only <span className="text-[var(--primary)]">$59.00</span>
            </p>

            <button
              onClick={() => window.location.href = '/shop'}
              className='bg-[var(--primary)] text-white px-5 py-2.5 sm:py-2.5 rounded-md font-medium text-sm sm:text-base transition-all duration-300 hover:bg-[var(--primary-hover)] transform active:scale-95 shadow-md'>
              Shop Now
            </button>
          </div>

        </div>

        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-4 py-4 sm:py-6 md:py-8">

          {/* 8. Top Selling Products Slider (Responsive Grid UI) */}
          <ProductSlider title="Top Selling Products" products={bestSellingProducts} className="mt-6" />

          {/* 9. Newsletter */}
          <Newsletter className="w-full pt-6 mt-8" />


        </main>
      </div>
    </>
  )
}

export default Home;
