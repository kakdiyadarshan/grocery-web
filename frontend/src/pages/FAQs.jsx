import React, { useState } from 'react';
import Subscribe from './Subscribe';

const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);

const faqCategories = [
  {
    category: "General",
    faqs: [
      {
        question: "What is Blinkit and why was the name changed?",
        answer: [
          { type: "paragraph", content: "Blinkit is leading the charge in transforming India's vast, unorganised grocery landscape through cutting-edge technology and innovation. Blinkit is India's largest and most convenient hyper-local delivery company, which enables you to order grocery, fruits & vegetables, and other daily essential products, directly via your mobile or web browser." },
          { type: "paragraph", content: "To know the reason why we changed our brand name from Grofers to Blinkit, read this blog post." }
        ]
      },
      {
        question: "What kind of products does Blinkit sell?",
        answer: [
          { type: "paragraph", content: "Blinkit provides You with a variety of products across multiple categories including fresh fruits and vegetables, groceries, snacks, beverages, home and household essentials, beauty and hygiene, and baby care. We are continuously adding to our inventory to serve you better." }
        ]
      },
      {
        question: "What cities and locations does Blinkit operate in?",
        answer: [
          { type: "paragraph", content: "We currently operate in multiple major cities across India. You can enter your delivery location on our app or website to check if we service your area." }
        ]
      }
    ]
  },
  {
    category: "Miscellaneous",
    faqs: [
      {
        question: "How do I place an order?",
        answer: [
          { type: "paragraph", content: "Simply browse through our catalog, add the items you need to your cart, set your delivery address, and proceed to checkout using your preferred payment method." }
        ]
      },
      {
        question: "How can I get support for an item which isn't working correctly?",
        answer: [
          { type: "paragraph", content: "You can reach out to our customer support team directly from the app via the 'Help & Support' section, and our associates will assist you." }
        ]
      }
    ]
  },
  {
    category: "Delivery",
    faqs: [
      {
        question: "How much time does delivery take?",
        answer: [
          { type: "paragraph", content: "We aim to deliver your groceries in 10 minutes or less! Delivery times may slightly vary based on traffic and weather conditions, but we always optimize for speed." }
        ]
      },
      {
        question: "Are there any delivery charges?",
        answer: [
          { type: "paragraph", content: "Delivery charges vary based on your location and the total order value. The exact delivery fee will be displayed at checkout before you complete your payment." }
        ]
      }
    ]
  }
];

function FAQItem({ faq, isFirstOpen }) {
  const [isOpen, setIsOpen] = useState(isFirstOpen);

  return (
    <div className="border-t border-gray-200 py-5">
      <div 
        className="flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="sm:text-xl text-lg font-semibold text-[var(--text-primary)]">
          {faq.question}
        </h3>
        <div className="flex-shrink-0 ml-4">
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>
      
      {isOpen && (
        <div className="mt-4 space-y-4">
          {faq.answer.map((block, i) => {
            if (block.type === 'paragraph') {
              return (
                <p key={i} className="text-base text-[var(--text-secondary)] leading-relaxed font-normal">
                  {block.content}
                </p>
              );
            }
            if (block.type === 'list') {
              return (
                <ul key={i} className="list-disc pl-5 mt-2 space-y-1 ext-base text-[var(--text-secondary)] leading-relaxed font-normal">
                  {block.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

function CategoryPanel({ categoryGroup, isDefaultOpen }) {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl  border border-gray-200 overflow-hidden mb-4">
      <div 
        className="flex justify-between items-center px-6 py-6 cursor-pointer select-none bg-[var(--bg-secondary)] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="sm:text-3xl text-2xl font-bold text-[var(--text-primary)]">
          {categoryGroup.category}
        </h2>
        <div>
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>
      
      {isOpen && (
        <div className="px-6 pb-2">
          {categoryGroup.faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} isFirstOpen={isDefaultOpen && index === 0} />
          ))}
        </div>
      )}
    </div>
  );
}

function FAQs() {
  return (
    <div className="w-full max-w-[1440px] mx-auto  min-h-screen pt-12 pb-24">
      <div className="w-full  px-4 sm:px-6 lg:px-8">
        <div className="mb-20">
          {faqCategories.map((group, index) => (
            <CategoryPanel 
              key={index} 
              categoryGroup={group} 
              isDefaultOpen={index === 0} 
            />
          ))}
        </div>
        
        <Subscribe />
      </div>
    </div>
  );
}

export default FAQs;