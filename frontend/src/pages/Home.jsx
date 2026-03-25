import React, { useRef, useState, useEffect } from 'react'
import BannerSlider from '../component/BannerSlider';
import cat1 from '../Image/cat1.png';
import cat2 from '../Image/cat2.png';
import cat3 from '../Image/cat3.png';
import cat4 from '../Image/cat4.png';
import cat5 from '../Image/cat5.png';
import cat6 from '../Image/cat6.png';
import subbanner1 from '../Image/sub-banner-1.png';
import subbanner2 from '../Image/sub-banner-2.png';
import subbanner3 from '../Image/sub-banner-3.png';
import image1 from '../Image/02_4f606a6b-57e8-4991-8605-fa3ba641c0c0.webp';
import image2 from '../Image/03_5f4ee6dc-f7e4-4a0a-b988-d9b893ead0a0.webp';
import image3 from '../Image/04_26183b2f-eb65-48de-b9c1-ac376c5b9e37.webp';
import image4 from '../Image/05_aa60bf65-3569-4105-8cd6-c4c0274d7dab.webp';
import image5 from '../Image/06.webp';
import { AiFillStar } from "react-icons/ai";
import cmsbanner1 from '../Image/cms-banner-1.png';
import cmsbanner2 from '../Image/cms-banner-2.png';



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

  const allProducts = [
    {
      id: 1,
      title: "Natural & Delicious Red Beetroot Slices",
      brand: "Omnilert",
      image: image1,
      price: "$19.00",
      originalPrice: null,
      discount: null,
      rating: 4,
      category: "Fresh Fruits"
    },
    {
      id: 2,
      title: "Curate Mango Mallika Large Premium",
      brand: "Fruity-Liscious",
      image: image2,
      price: "$32.00",
      originalPrice: "$35.00",
      discount: "-9%",
      rating: 4,
      category: "Fresh Fruits"
    },
    {
      id: 3,
      title: "Soft Drink 7 Up Lemon Flavour Can, 250 ml",
      brand: "BrightFruit",
      image: image3,
      price: "$12.00",
      originalPrice: null,
      discount: null,
      rating: 0,
      category: "Fresh Fruits"
    },
    {
      id: 4,
      title: "Essence Of Malabar Raw Natural Coconut",
      brand: "Fruity-Liscious",
      image: image4,
      price: "$15.00",
      originalPrice: null,
      discount: null,
      rating: 3,
      category: "Fresh Fruits"
    },
    {
      id: 5,
      title: "Fresh Standard Quality Babugosha /Nashpati",
      brand: "Omnilert",
      image: image5,
      price: "$36.00",
      originalPrice: "$40.00",
      discount: "-10%",
      rating: 4,
      category: "Fresh Fruits"
    },
    {
      id: 6,
      title: "Fresh Organic Broccoli",
      brand: "GreenFarm",
      image: image1,
      price: "$10.00",
      originalPrice: null,
      discount: null,
      rating: 5,
      category: "Fresh Fruits"
    },
    {
      id: 7,
      title: "Amul Taaza Milk 1L",
      brand: "Amul",
      image: image3,
      price: "$5.00",
      originalPrice: null,
      discount: null,
      rating: 5,
      category: "Fresh Fruits"
    },
    {
      id: 8,
      title: "Organic Spinach Fresh",
      brand: "Omnilert",
      image: image1,
      price: "$8.00",
      originalPrice: null,
      discount: null,
      rating: 4,
      category: "Fresh Fruits"
    },
    {
      id: 9,
      title: "Dairy Milk Chocolate 100g",
      brand: "Cadbury",
      image: image3,
      price: "$2.50",
      originalPrice: null,
      discount: null,
      rating: 5,
      category: "Fresh Fruits"
    },
    {
      id: 10,
      title: "Fresh Green Apple",
      brand: "Omnilert",
      image: image2,
      price: "$12.00",
      originalPrice: "$15.00",
      discount: "-20%",
      rating: 4,
      category: "Fresh Fruits"
    },
    {
      id: 11,
      title: "Fresh Organic Broccoli",
      brand: "GreenFarm",
      image: image1,
      price: "$10.00",
      originalPrice: null,
      discount: null,
      rating: 5,
      category: "Vegetables"
    },
    {
      id: 12,
      title: "Organic Carrots",
      brand: "NatureFresh",
      image: image2,
      price: "$6.50",
      originalPrice: "$8.00",
      discount: "19% OFF",
      rating: 4,
      category: "Vegetables"
    },
    {
      id: 13,
      title: "Fresh Spinach Bunch",
      brand: "GreenLeaf",
      image: image3,
      price: "$4.00",
      originalPrice: null,
      discount: null,
      rating: 5,
      category: "Vegetables"
    },
    {
      id: 14,
      title: "Red Bell Peppers",
      brand: "FarmPick",
      image: image4,
      price: "$7.25",
      originalPrice: "$9.00",
      discount: "20% OFF",
      rating: 4,
      category: "Vegetables"
    },
    {
      id: 15,
      title: "Fresh Cauliflower",
      brand: "OrganicHub",
      image: image5,
      price: "$5.75",
      originalPrice: null,
      discount: null,
      rating: 3,
      category: "Vegetables"
    },
    {
      id: 16,
      title: "Amul Taaza Milk 1L",
      brand: "Amul",
      image: image1,
      price: "$5.00",
      originalPrice: null,
      discount: null,
      rating: 5,
      category: "Milk & Dairies"
    },
    {
      id: 17,
      title: "Amul Gold Full Cream Milk 1L",
      brand: "Amul",
      image: image2,
      price: "$6.50",
      originalPrice: "$7.50",
      discount: "13% OFF",
      rating: 5,
      category: "Milk & Dairies"
    },
    {
      id: 18,
      title: "Mother Dairy Toned Milk 1L",
      brand: "Mother Dairy",
      image: image3,
      price: "$5.20",
      originalPrice: null,
      discount: null,
      rating: 4,
      category: "Milk & Dairies"
    },
    {
      id: 19,
      title: "Nestle A+ Slim Milk 1L",
      brand: "Nestle",
      image: image4,
      price: "$5.80",
      originalPrice: "$6.50",
      discount: "11% OFF",
      rating: 4,
      category: "Milk & Dairies"
    },
    {
      id: 20,
      title: "Britannia Fresh Paneer 200g",
      brand: "Britannia",
      image: image5,
      price: "$4.50",
      originalPrice: null,
      discount: null,
      rating: 5,
      category: "Milk & Dairies"
    }
  ];

  const filteredProducts = allProducts.filter(product => product.category === activeTab);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      let isDown = false;
      let startX;
      let scrollLeft;

      const onWheel = (e) => {
        if (e.deltaY === 0) return;
        e.preventDefault();
        el.scrollTo({
          left: el.scrollLeft + (e.deltaY * 3), // Slightly increased for better response
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
        const walk = (x - startX) * 3; // Scroll-fast multiplier
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
    }
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
                <div key={product.id} className="group relative bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col cursor-pointer transition-all duration-300 hover:border-[#38b47e] hover:shadow-xl hover:shadow-green-50/50">
                  {/* Discount Badge */}
                  {product.discount && (
                    <span className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-[#FF4F4F] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      {product.discount}
                    </span>
                  )}

                  {/* Product Image */}
                  <div className="h-28 sm:h-44 flex items-center justify-center mb-3 sm:mb-4 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col flex-grow space-y-1 sm:space-y-2">
                    <span className="text-[10px] sm:text-sm text-[#8D949C] uppercase tracking-wider font-medium">
                      {product.brand}
                    </span>

                    <h3 className="text-sm sm:text-base font-semibold text-[#31353C] leading-tight line-clamp-1 group-hover:text-[#38b47e] transition-colors">
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {[...Array(5)].map((_, i) => (
                        <AiFillStar
                          key={i}
                          className={`text-[10px] sm:text-base ${i < product.rating ? "text-[#FFB81C]" : "text-[#E6E8EA]"}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-baseline gap-1.5 sm:gap-2 mt-auto">
                      <span className="text-sm sm:text-base font-semibold text-[#00B880]">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs sm:text-base text-[#A2A9B1] line-through font-medium">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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

          {/* 6. Featured Products */}
          <div className="mt-8">
            <h2 className="text-3xl font-semibold text-[#31353C] mb-8 border-b border-gray-200 pb-5">Featured Products</h2>

            <div className="grid grid-cols-1 min-[425px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              {[
                {
                  id: 1,
                  title: "Natural & Delicious Red Beetroot Slices",
                  brand: "Omnilert",
                  image: image1,
                  price: "$19.00",
                  originalPrice: null,
                  discount: null,
                  rating: 4
                },
                {
                  id: 2,
                  title: "Curate Mango Mallika Large Premium",
                  brand: "Fruity-Liscious",
                  image: image2,
                  price: "$32.00",
                  originalPrice: "$35.00",
                  discount: "-9%",
                  rating: 4
                },
                {
                  id: 3,
                  title: "Soft Drink 7 Up Lemon Flavour Can, 250 ml",
                  brand: "BrightFruit",
                  image: image3,
                  price: "$12.00",
                  originalPrice: null,
                  discount: null,
                  rating: 0
                },
                {
                  id: 4,
                  title: "Essence Of Malabar Raw Natural Coconut",
                  brand: "Fruity-Liscious",
                  image: image4,
                  price: "$15.00",
                  originalPrice: null,
                  discount: null,
                  rating: 3
                },
                {
                  id: 5,
                  title: "Fresh Standard Quality Babugosha /Nashpati",
                  brand: "Omnilert",
                  image: image5,
                  price: "$36.00",
                  originalPrice: "$40.00",
                  discount: "-10%",
                  rating: 4
                }
              ].map((product) => (
                <div key={product.id} className="group relative bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col cursor-pointer transition-all duration-300 hover:border-[#38b47e] hover:shadow-xl hover:shadow-green-50/50">
                  {/* Discount Badge */}
                  {product.discount && (
                    <span className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-[#FF4F4F] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      {product.discount}
                    </span>
                  )}

                  {/* Product Image */}
                  <div className="h-28 sm:h-44 flex items-center justify-center mb-3 sm:mb-4 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col flex-grow space-y-1 sm:space-y-2">
                    <span className="text-[10px] sm:text-sm text-[#8D949C] uppercase tracking-wider font-medium">
                      {product.brand}
                    </span>

                    <h3 className="text-sm sm:text-base font-semibold text-[#31353C] leading-tight line-clamp-1 group-hover:text-[#38b47e] transition-colors">
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {[...Array(5)].map((_, i) => (
                        <AiFillStar
                          key={i}
                          className={`text-[10px] sm:text-base ${i < product.rating ? "text-[#FFB81C]" : "text-[#E6E8EA]"}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-baseline gap-1.5 sm:gap-2 mt-auto">
                      <span className="text-sm sm:text-base font-semibold text-[#00B880]">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs sm:text-base text-[#A2A9B1] line-through font-medium">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </main>
      </div>
    </>
  )
}

export default Home;
