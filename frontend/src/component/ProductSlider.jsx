import React, { useRef, useEffect } from 'react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import ProductCard from './ProductCard';

const ProductSlider = ({ title, products, className = '' }) => {
  const scrollRef = useRef(null);

  const scrollSlider = (direction) => {
    const el = scrollRef.current;
    if (el && el.children.length > 0) {
      const cardWidth = el.children[0].offsetWidth;
      const gap = parseInt(window.getComputedStyle(el).gap) || 0;
      const scrollAmount = (cardWidth + gap) * 2;
      
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // useEffect(() => {
  //   const setupDragScroll = (el) => {
  //     if (!el) return null;
  //     let isDown = false;
  //     let startX;
  //     let scrollLeft;

  //     const onWheel = (e) => {
  //       if (e.deltaY === 0) return;
  //       e.preventDefault();
  //       el.scrollTo({
  //         left: el.scrollLeft + (e.deltaY * 3),
  //         behavior: 'smooth'
  //       });
  //     };

  //     const mouseDown = (e) => {
  //       isDown = true;
  //       el.classList.add('cursor-grabbing');
  //       el.classList.remove('cursor-grab');
  //       startX = e.pageX - el.offsetLeft;
  //       scrollLeft = el.scrollLeft;
  //     };

  //     const mouseLeave = () => {
  //       isDown = false;
  //       el.classList.remove('cursor-grabbing');
  //       el.classList.add('cursor-grab');
  //     };

  //     const mouseUp = () => {
  //       isDown = false;
  //       el.classList.remove('cursor-grabbing');
  //       el.classList.add('cursor-grab');
  //     };

  //     const mouseMove = (e) => {
  //       if (!isDown) return;
  //       e.preventDefault();
  //       const x = e.pageX - el.offsetLeft;
  //       const walk = (x - startX) * 2.5; 
  //       el.scrollLeft = scrollLeft - walk;
  //     };

  //     el.addEventListener('wheel', onWheel, { passive: false });
  //     el.addEventListener('mousedown', mouseDown);
  //     el.addEventListener('mouseleave', mouseLeave);
  //     el.addEventListener('mouseup', mouseUp);
  //     el.addEventListener('mousemove', mouseMove);

  //     return () => {
  //       el.removeEventListener('wheel', onWheel);
  //       el.removeEventListener('mousedown', mouseDown);
  //       el.removeEventListener('mouseleave', mouseLeave);
  //       el.removeEventListener('mouseup', mouseUp);
  //       el.removeEventListener('mousemove', mouseMove);
  //     };
  //   };

  //   const cleanup = setupDragScroll(scrollRef.current);

  //   return () => {
  //     if (cleanup) cleanup();
  //   };
  // }, []);

  return (
    <div className={`relative group/slider ${className}`}>
      {title && <h2 className="text-3xl font-semibold text-[#31353C] mb-8 border-b border-gray-200 pb-5">{title}</h2>}

      <div className="relative">
        <button
          onClick={() => scrollSlider('left')}
          className="absolute -left-2 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-[var(--primary)] hover:text-white transition-all duration-300 opacity-0 group-hover/slider:opacity-100 cursor-pointer hidden mb:flex"
          aria-label="Previous products"
        >
          <HiOutlineChevronLeft size={24} />
        </button>

        <button
          onClick={() => scrollSlider('right')}
          className="absolute -right-2 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-xl border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-[var(--primary)] hover:text-white transition-all duration-300 opacity-0 group-hover/slider:opacity-100 cursor-pointer hidden mb:flex"
          aria-label="Next products"
        >
          <HiOutlineChevronRight size={24} />
        </button>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto no-scrollbar scroll-smooth gap-3 sm:gap-6 pb-4 cursor-grab"
        >
          {products.map((product) => (
            <div
              key={product._id || product.id}
              className="w-full min-[425px]:w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] xl:w-[calc(20%-1.2rem)] flex-shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;
