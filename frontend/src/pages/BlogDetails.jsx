import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getBlogById } from '../redux/slice/blog.slice';
import Subscribe from './Subscribe';
import Newsletter from '../component/Newsletter';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function BlogDetails() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentBlog: post, loading } = useSelector((state) => state.blog);

    useEffect(() => {
        if (id) {
            dispatch(getBlogById(id));
        }
    }, [id, dispatch]);

    if (loading) {
        return (
            <div className="w-full min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-4 font-jost">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Blog Post Not Found</h2>
                <Link to="/blog" className="px-6 py-2.5 bg-primary text-white rounded-full hover:bg-primaryHover transition-colors font-semibold shadow-lg shadow-primary/30">
                    &larr; Back to Blogs
                </Link>
            </div>
        );
    }

    return (
        <>

            <div className="bg-[#f8f9fa] border-b border-gray-100 py-10 md:py-14 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1440px] mx-auto px-2 md:px-0 lg:px-4">
                    <h1 className="text-3xl md:text-[40px] font-bold text-[#1a1a1a] mb-3 tracking-tight">Blog</h1>
                    <div className="flex items-center gap-2 text-[13px] md:text-sm text-gray-400 font-medium">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="text-gray-300 font-light">&gt;</span>
                        <Link to="/blog" className="text-gray-600 hover:text-primary transition-colors">
                            Blog
                        </Link>
                        <span className="text-gray-300 font-light">&gt;</span>
                        <span className="text-gray-600">Blog Details</span>
                    </div>
                </div>
            </div>

            {/* <div className=" py-12 ">
                <div className=" mx-auto px-4 lg:px-6">
                    <h1 className="text-[28px] sm:text-[32px] font-bold text-[#1e5066] mb-3 text-left">Blog Details</h1>
                    <div className="flex items-center gap-1 text-[14px] text-gray-500 font-medium">
                        <Link to="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link to="/blog" className="hover:text-[var(--primary)] transition-colors">Blog</Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-[var(--primary)] font-bold">Blog Details</span>
                    </div>
                </div>
            </div> */}

            <div className="w-full container mx-auto px-4 py-4 sm:py-6 lg:py-8 mt-10 mb-20 animate-fade-in font-jost">

                <div className="">
                    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] relative rounded-lg overflow-hidden mb-8">
                        <img
                            src={post.heroImage}
                            alt={post.blogTitle}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="">
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <span className="bg-primary/10 text-primary py-1.5 rounded-full font-bold text-xs uppercase tracking-wider">
                                {post.blogCategoryId?.blogCategoryName || 'General'}
                            </span>
                            <span className="text-gray-400 font-medium text-sm">
                                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black/80 mb-8 leading-tight">
                            {post.blogTitle}
                        </h1>

                        <div className="max-w-none text-gray-600">
                            <p className="text-lg sm:text-xl font-medium leading-relaxed mb-10 text-gray-700 italic border-l-4 border-primary pl-6 py-2 bg-gray-50 rounded-r-lg">
                                {post.blogDesc}
                            </p>

                            {/* Render Sections */}
                            {post.section?.map((sec, index) => (
                                <div key={index} className="mb-12 last:mb-0">
                                    {sec.sectionTitle && (
                                        <h2 className="text-2xl sm:text-3xl font-bold text-black/80 mb-4 mt-8">
                                            {sec.sectionTitle}
                                        </h2>
                                    )}

                                    {sec.sectionDesc?.map((p, i) => (
                                        <p key={i} className="mb-4 leading-relaxed text-gray-600">
                                            {p}
                                        </p>
                                    ))}

                                    {sec.sectionPoints?.length > 0 && (
                                        <ul className="list-disc pl-6 mb-6 space-y-3 mt-4 text-gray-600">
                                            {sec.sectionPoints.map((point, i) => (
                                                <li key={i} className="pl-2">{point}</li>
                                            ))}
                                        </ul>
                                    )}

                                    {sec.sectionImg?.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                                            {sec.sectionImg.map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img}
                                                    alt=""
                                                    className="w-full h-full object-contain rounded-lg shadow-sm border border-gray-100 transition-transform hover:scale-[1.02] cursor-zoom-in"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Conclusion */}
                            {post.conclusion && (
                                <div className="mt-16 p-8 bg-gray-50 rounded-xl border border-gray-200">
                                    <h4 className="text-xl font-bold text-black/80 mb-3">Conclusion</h4>
                                    <p className="text-gray-700 italic leading-relaxed">
                                        {post.conclusion}
                                    </p>
                                </div>
                            )}

                            <div className=" mt-10 ">
                                <Link to="/blog" className="px-3 flex w-fit items-center gap-2 py-2.5 text-black  border  font-semibold "> <ChevronLeft className="w-4 h-4" /> Back to Blogs</Link>
                            </div>

                        </div>
                    </div>
                </div>

                {/* <Subscribe/> */}

                {/* Newsletter */}
                <Newsletter className="w-full pt-6 mt-8" />
            </div>
        </>
    );
}

export default BlogDetails;