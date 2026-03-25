import React from 'react';
import Subscribe from './Subscribe';
import { Link, useNavigate } from 'react-router-dom';

export const blogPosts = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
        date: 'June 20, 2024',
        title: 'Real Tastes of Best beverages',
        description: 'Fashion is not merely about clothing; it is an embodiment of elegance, sophistication, and self-expression.',
        link: '#'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
        date: 'June 20, 2024',
        title: 'Some Good Aspects of Online Ordering',
        description: 'Technology has become an integral part of our lives, revolutionizing the way we work and communicate ourselves.',
        link: '#'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&q=80&w=800',
        date: 'June 20, 2024',
        title: 'Buy Fresh And Healthy Vegetables',
        description: 'Trends are patterns or shifts in behavior, preferences, or ideas that gain popularity within a specific industry or society.',
        link: '#'
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1498837167922-41c66c958cb6?auto=format&fit=crop&q=80&w=800',
        date: 'June 20, 2024',
        title: 'The Importance of a Balanced Diet',
        description: 'A balanced diet rich in fruits and vegetables can significantly improve overall health and well-being.',
        link: '#'
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
        date: 'June 20, 2024',
        title: 'Quick and Healthy Summer Recipes',
        description: 'Discover delicious and easy-to-make recipes that will keep you refreshed and energized during the hot summer months.',
        link: '#'
    },
    {
        id: 6,
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800',
        date: 'June 20, 2024',
        title: 'Benefits of Plant-Based Diets',
        description: 'Exploring the various environmental and health benefits of adopting a plant-based lifestyle.',
        link: '#'
    }
];

function Blog() {
    const navigate = useNavigate();

    return (
        <div className="w-full max-w-[1440px]  mx-auto p-4 sm:p-6 lg:p-8 mt-10 mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                    <div
                        key={post.id}
                        className="flex flex-col group cursor-pointer border border-[var(--border)] rounded-lg overflow-hidden"
                        onClick={() => navigate(`/blog/${post.id}`)}
                    >
                        <div className="overflow-hidden h-64 bg-gray-100">
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex flex-col flex-grow p-4">
                            <span className="text-[var(--text-secondary)] font-medium text-sm mb-2">{post.date}</span>
                            <h3 className="text-xl font-medium text-[var(--text-primary)] transition-colors cursor-pointer mb-3 leading-snug group-hover:text-[var(--primary)]">
                                {post.title}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed line-clamp-3">
                                {post.description}
                            </p>
                            <div className="mt-auto">
                                <Link
                                    to={`/blog/${post.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[#0ead69] tracking-wider font-medium hover:text-[var(--primary)] text-sm underline"
                                >
                                    Read More
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Subscribe />

        </div>
    );
}

export default Blog;