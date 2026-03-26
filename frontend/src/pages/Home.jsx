import React, { useRef, useState, useEffect } from 'react'
import BannerSlider from '../component/BannerSlider';
import ProductCard from '../component/ProductCard';
import ProductSlider from '../component/ProductSlider';
import { allProducts } from '../data/products';
import cat1 from '../Image/cat1.png';
import cat2 from '../Image/cat2.png';
import cat3 from '../Image/cat3.png';
import cat4 from '../Image/cat4.png';
import cat5 from '../Image/cat5.png';
import cat6 from '../Image/cat6.png';
import subbanner1 from '../Image/sub-banner-1.png';
import subbanner2 from '../Image/sub-banner-2.png';
import subbanner3 from '../Image/sub-banner-3.png';
import cmsbanner1 from '../Image/cms-banner-1.png';
import cmsbanner2 from '../Image/cms-banner-2.png';
import bannerImg from '../Image/banner-img.jpg';
import Newsletter from '../component/Newsletter';


function Home() {
  const scrollRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Fresh Fruits');
  const [isPending, setIsPending] = useState(false);

  const categories = ['Fresh Fruits', 'Milk & Dairies', 'Vegetables'];

  const handleTabChange = (category) => {
    if (category === activeTab) return;
    setIsPending(true);
    setTimeout(() => {
      setActiveTab(category);
      setIsPending(false);
    }, 200);
  };

  const filteredProducts = allProducts.filter(product => product.category === activeTab);

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
            <div className='text-center mb-6'>
              <h2 className=" text-2xl sm:text-3xl font-medium text-[#2e3d30] border-b border-gray-200 pb-5">Featured Categories</h2>
            </div>

            <div
              ref={scrollRef}
              className='flex overflow-x-auto no-scrollbar pb-6 gap-6 md:gap-10 lg:gap-14 px-5 sm:px-8 scroll-smooth w-full cursor-grab'
            >
              {[
                { name: 'Vegetables', img: cat1 },
                { name: 'Fresh Fruit', img: cat2 },
                { name: 'Baking', img: cat3 },
                { name: 'Drinks', img: cat4 },
                { name: 'Cheese', img: cat5 },
                { name: 'Milk', img: cat6 },
                { name: 'Vegetables', img: cat1 },
                { name: 'Fresh Fruit', img: cat2 },
                { name: 'Baking', img: cat3 },
                { name: 'Drinks', img: cat4 },
                { name: 'Cheese', img: cat5 },
                { name: 'Milk', img: cat6 },
              ].map((category, index) => (
                <div key={index} className='group cursor-pointer text-center flex-shrink-0'>
                  <div className='w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-green-100 mb-3'>
                    <img src={category.img} alt={category.name} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' />
                  </div>
                  <span className='text-sm sm:text-base font-semibold text-gray-700 group-hover:text-[#38b47e] transition-colors'>
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Sub Banners */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8 mb-10'>
            {[
              { img: subbanner1, title: 'Fresh Organic Products', discount: '10% Discount', link: '/shop' },
              { img: subbanner2, title: 'Strawberry & Lemon', discount: '20% Discount', link: '/shop' },
              { img: subbanner3, title: 'Fresh Bilberry Products', discount: '30% Discount', link: '/shop' },
            ].map((banner, index) => (
              <div key={index} className='group relative rounded-lg overflow-hidden cursor-pointer h-64 w-full'>
                {/* Image background with zoom effect */}
                <div className='absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105'>
                  <img src={banner.img} alt={banner.title} className='w-full h-full object-cover' />
                </div>

                {/* Content Overlay */}
                <div className='relative h-full flex flex-col justify-center p-8 z-10'>
                  <span className='text-lg text-gray-700 mb-2 block'>
                    {banner.discount}
                  </span>
                  <h3 className='text-2xl font-semibold text-[#2e3d30] mb-4 max-w-[180px] leading-tight'>
                    {banner.title}
                  </h3>
                  <div className='flex items-center gap-1 group/btn'>
                    <span className='text-sm text-gray-800 border-b border-gray-800 hover:border-none'>
                      Shop Now
                    </span>
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
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleTabChange(category)}
                    className={`text-sm sm:text-base font-medium transition-all duration-300 relative pb-1 ${activeTab === category
                      ? "text-[#38b47e] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#38b47e]"
                      : "text-gray-500 hover:text-[#38b47e]"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className={`grid grid-cols-1 min-[425px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 transition-all duration-300 ${isPending ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* 5. Save Banners */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-16'>
            {[
              {
                img: cmsbanner1,
                title: 'Enjoy 15% OFF For All Gegetable And Fruit',
                accentColor: 'text-[#253D4E]'
              },
              {
                img: cmsbanner2,
                title: 'Organic Save 17% On Organic Juice',
                accentColor: 'text-[#253D4E]'
              },
            ].map((banner, index) => (
              <div
                key={index}
                className='group relative rounded-lg overflow-hidden cursor-pointer h-[220px] sm:h-[280px] w-full shadow-sm'
              >
                {/* Full Image Background */}
                <div className='absolute inset-0 transition-transform duration-1000 ease-out group-hover:scale-105'>
                  <img src={banner.img} alt="" className='w-full h-full object-cover' />
                </div>

                {/* Text Content - Positioned Left */}
                <div className='relative h-full flex flex-col justify-center items-start p-8 sm:p-12 z-10 w-full sm:w-2/3'>
                  <h3 className={`text-xl sm:text-2xl lg:text-2xl font-semibold ${banner.accentColor} mb-6 sm:mb-8 max-w-[180px] sm:max-w-[280px] leading-tight`}>
                    {banner.title}
                  </h3>
                  <button className='bg-[#38b47e] text-white px-5 py-2.5 sm:py-2.5 rounded-md font-medium text-sm sm:text-base transition-all duration-300 hover:bg-[#2e3d30] transform active:scale-95 shadow-md'>
                    Shop Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 6. Featured Products Slider (Responsive Grid UI) */}
          <ProductSlider title="Featured Products" products={allProducts} className="mt-12 mb-4" />
        </main>

        {/* 7. Deal Banner */}
        <div
          className="relative bg-no-repeat bg-cover bg-center sm:bg-[position:80%_center] bg-scroll lg:bg-fixed py-16 md:py-16 lg:py-20 xl:py-28 w-full"
          style={{ backgroundImage: `url(${bannerImg})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-0"></div>

          {/* Content Wrapper to align text with the rest of the site */}
          <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-4 w-full">
            <p className="text-sm sm:text-xl md:text-2xl font-medium text-[#79a206] uppercase tracking-wider mb-5">UP TO 35% OFF</p>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-medium text-[#252525] leading-[1.15] mb-6 max-w-[500px]">
              Fresh Organic Food <br /> Health Benefits
            </h2>

            <p className="text-base sm:text-xl md:text-2xl text-[#333333] mb-6 font-medium">
              Starting At Only <span className="text-[#79a206]">$59.00</span>
            </p>

            <button className='bg-[#79a206]  text-white px-5 py-2.5 sm:py-2.5 rounded-md font-medium text-sm sm:text-base transition-all duration-300 hover:bg-[#5d7d04] transform active:scale-95 shadow-md'>
              Shop Now
            </button>
          </div>

        </div>

        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-4 py-4 sm:py-6 md:py-8">

          {/* 8. Top Selling Products Slider (Responsive Grid UI) */}
          <ProductSlider title="Top Selling Products" products={allProducts} className="mt-6" />

          {/* 9. Newsletter */}
          <Newsletter className="w-full pt-6 mt-8" />


        </main>
      </div>
    </>
  )
}

export default Home;
