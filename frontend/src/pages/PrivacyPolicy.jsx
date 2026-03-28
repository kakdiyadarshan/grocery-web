import React, { useEffect } from 'react';
import Subscribe from './Subscribe';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPrivacy } from '../redux/slice/privacy.slice';
import Newsletter from '../component/Newsletter';
import { ChevronRight } from 'lucide-react';

const PrivacyPolicy = () => {

    const dispatch = useDispatch();
    const { privacy, loading } = useSelector((state) => state.privacy);

    useEffect(() => {
        dispatch(getAllPrivacy());
    }, [dispatch]);

    return (
        <div className="w-full">
            <div className="container mx-auto w-full space-y-8 py-12">
                <div className=" mx-auto px-4 lg:px-6">
                    <h1 className="text-[28px] sm:text-[32px] font-bold text-[#1e5066] mb-3 text-left">Privacy Policy</h1>
                    <div className="flex items-center gap-1 text-[14px] text-gray-500 font-medium">
                        <Link to="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-[var(--primary)] font-bold">Privacy Policy</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-7 xl:px-0 ">
                <div className="max-w-[950px] mx-auto lg:mx-0 px-2 md:px-0 lg:px-4">
                    <div className="space-y-12 md:space-y-14">
                        {privacy?.map(section => (
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
            <Newsletter className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-4 py-4 sm:py-6 pt-6 mt-8" />
        </div>
    );
}

export default PrivacyPolicy;