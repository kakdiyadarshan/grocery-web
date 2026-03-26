import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTerms } from '../redux/slice/terms.slice';
import Subscribe from './Subscribe';
import { Link } from 'react-router-dom';
import Newsletter from '../component/Newsletter';

const Termscondition = () => {

    const dispatch = useDispatch();
    const { terms, loading } = useSelector((state) => state.terms);

    useEffect(() => {
        dispatch(getAllTerms());
    }, [dispatch]);


    return (
        <>
            <div className="w-full">
                <div className="bg-[#f8f9fa] border-b border-gray-100 py-10 md:py-14 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-[1440px] mx-auto px-2 md:px-0 lg:px-4">
                        <h1 className="text-3xl md:text-[40px] font-bold text-[#1a1a1a] mb-3 tracking-tight">Terms and Conditions</h1>
                        <div className="flex items-center gap-2 text-[13px] md:text-sm text-gray-400 font-medium">
                            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                            <span className="text-gray-300 font-light">&gt;</span>
                            <span className="text-gray-600">Terms and Conditions</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-7 xl:px-0 py-10 md:py-16 mb-10">
                    <div className="max-w-[950px] mx-auto lg:mx-0 px-2 md:px-0 lg:px-4">
                        <div className="space-y-12 md:space-y-14">
                            {terms?.map(section => (
                                <div key={section.id} id={section.id} className="scroll-mt-8 md:scroll-mt-12">
                                    <div
                                        className="text-textSecondary text-sm leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-2 break-words"
                                        dangerouslySetInnerHTML={{ __html: section.description }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* <Subscribe /> */}

                {/* Newsletter */}
                <Newsletter className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-4 py-4 sm:py-6 md:py-8 pt-6 mt-8" />
            </div>
        </>
    );
};

export default Termscondition;