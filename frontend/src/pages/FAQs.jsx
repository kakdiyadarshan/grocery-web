import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllFAQs } from '../redux/slice/faq.slice';
import Subscribe from './Subscribe';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Newsletter from '../component/Newsletter';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-gray-200 bg-white">
      <div
        className="flex justify-between items-center py-5 sm:py-6 cursor-pointer select-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="text-[14px] sm:text-[15px] font-bold text-[#1e293b] pr-6 w-full leading-snug"
          dangerouslySetInnerHTML={{ __html: question }}
        />
        <div className="flex-shrink-0 ml-4">
          {isOpen ? (
            <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full text-gray-700 flex items-center justify-center transition-colors">
              <Minus size={14} strokeWidth={2} />
            </div>
          ) : (
            <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full text-gray-500 group-hover:border-gray-700 group-hover:text-gray-700 flex items-center justify-center transition-colors">
              <Plus size={14} strokeWidth={2} />
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="pb-6 pr-8 animate-in fade-in duration-300">
          <div
            className="text-[14px] sm:text-[15px] text-gray-500 leading-[1.8] font-medium faq_answer prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 list-disc pl-4"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        </div>
      )}
    </div>
  );
}

function FAQs() {
  const dispatch = useDispatch();
  const { faqs, loading } = useSelector((state) => state.faq);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    dispatch(getAllFAQs());
  }, [dispatch]);

  useEffect(() => {
    if (faqs && faqs.length > 0 && !activeTab) {
      setActiveTab(faqs[0]._id);
    }
  }, [faqs, activeTab]);

  return (
    <>

      <div className="w-full">
        <div className="bg-[#f8f9fa] border-b border-gray-100 py-10 md:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1440px] mx-auto px-2 md:px-0 lg:px-4">
            <h1 className="text-3xl md:text-[40px] font-bold text-[#1a1a1a] mb-3 tracking-tight">Frequently Asked Questions</h1>
            <div className="flex items-center gap-2 text-[13px] md:text-sm text-gray-400 font-medium">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="text-gray-300 font-light">&gt;</span>
              <span className="text-gray-600">FAQs</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-white font-jost min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-20">

          <div className="mb-10 sm:mb-16">
            <p className="text-textSecondary text-[15px] sm:text-[16px] leading-[1.7] max-w-[900px] font-medium">
              We're here to assist you every step of the way. Explore our guides, FAQs, and expert help to make your shopping experience smooth, safe, and enjoyable.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-24 border-t border-gray-100">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : faqs && faqs.length > 0 ? (
            <div className="flex flex-col md:flex-row gap-0 md:gap-10 lg:gap-16 items-start">

              <div className="w-full md:w-[260px] lg:w-[280px] flex-shrink-0 flex flex-nowrap md:flex-col overflow-x-auto md:overflow-visible no-scrollbar mb-8 md:mb-0 border-b md:border-b-0 border-gray-100 pb-1 md:pb-0 relative z-10 md:sticky md:top-[120px]">
                {faqs.map((group) => {
                  const isActive = activeTab === group._id;
                  return (
                    <button
                      key={group._id}
                      onClick={() => setActiveTab(group._id)}
                      className={`text-left px-5 py-4 sm:py-5 whitespace-nowrap md:whitespace-normal font-[700] text-[13px] sm:text-[14px] transition-all border-b border-gray-100/80 outline-none
                        ${isActive
                          ? 'bg-green-100 text-primary'
                          : 'text-gray-500 hover:text-primary bg-white hover:bg-green-100'
                        }`}
                    >
                      <span dangerouslySetInnerHTML={{ __html: group.title }} />
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 w-full min-h-[400px]">
                {faqs.map((group) => {
                  if (activeTab !== group._id) return null;

                  return (
                    <div key={group._id} className="animate-in fade-in duration-500">
                      <div className="w-full border-b border-gray-200">
                        {group.faqs && group.faqs.length > 0 ? (
                          group.faqs.map((faq, idx) => (
                            <FAQItem
                              key={faq._id || idx}
                              question={faq.faqQuestion}
                              answer={faq.faqAnswer}
                            />
                          ))
                        ) : (
                          <div className="py-10 text-gray-500 text-[15px] font-medium border-t border-gray-200">
                            No questions available for this category yet.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="text-center py-24 text-gray-500 font-medium border-t border-gray-100">
              No FAQs available at the moment.
            </div>
          )}
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-4 py-4 sm:py-6 md:py-8">
          {/* <Subscribe /> */}

          {/* Newsletter */}
          <Newsletter className="w-full pt-6 mt-8" />
        </div>
      </div>
    </>
  );
}

export default FAQs;