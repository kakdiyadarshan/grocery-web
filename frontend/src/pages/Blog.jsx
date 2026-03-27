import React, { useEffect } from 'react';
import Subscribe from './Subscribe';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBlogs } from '../redux/slice/blog.slice';
import Newsletter from '../component/Newsletter';

function Blog() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { blogs, loading } = useSelector((state) => state.blog);

    useEffect(() => {
        dispatch(getAllBlogs());
    }, [dispatch]);

    return (
        <div className="min-h-screen  px-4 sm:px-6 lg:px-8">

            <div className="bg-[#f8f9fa] border-b border-gray-100 py-10 md:py-14 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1440px] mx-auto px-2 md:px-0 lg:px-4">
                    <h1 className="text-3xl md:text-[40px] font-bold text-[#1a1a1a] mb-3 tracking-tight">Blog</h1>
                    <div className="flex items-center gap-2 text-[13px] md:text-sm text-gray-400 font-medium">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="text-gray-300 font-light">&gt;</span>
                        <span className="text-gray-600">Blog</span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {blogs && blogs.length > 0 ? (
                            blogs.map((post) => (
                                <div
                                    key={post._id}
                                    className="flex flex-col group cursor-pointer border border-gray-100 rounded-lg overflow-hidden bg-white hover:shadow-md transition-all duration-300"
                                    onClick={() => navigate(`/blog/${post._id}`)}
                                >
                                    <div className="overflow-hidden h-56 bg-gray-100">
                                        <img
                                            src={post.heroImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'}
                                            alt={post.blogTitle}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex flex-col flex-grow p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="py-1 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full">
                                                {post.blogCategoryId?.blogCategoryName || 'Uncategorized'}
                                            </span>
                                            <span className="text-gray-400 text-xs font-medium">
                                                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-black/80 transition-colors mb-3 leading-snug group-hover:text-primary">
                                            {post.blogTitle}
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-5 leading-relaxed line-clamp-2">
                                            {post.blogDesc}
                                        </p>
                                        <div className="mt-auto">
                                            <Link
                                                to={`/blog/${post._id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-2 text-primary tracking-wide font-bold hover:gap-3 transition-all text-sm group/btn"
                                            >
                                                Read More
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20">
                                <h2 className="text-2xl font-bold text-gray-400">No blogs found</h2>
                                <p className="text-gray-500 mt-2">Check back later for new content</p>
                            </div>
                        )}
                    </div>
                )}

                {/* <Subscribe /> */}

                {/* Newsletter */}
                <Newsletter className="w-full pt-6 mt-8" />
            </main>
        </div>
    );
}

export default Blog;