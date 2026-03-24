import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from './Blog';

function BlogDetails() {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === parseInt(id));

  if (!post) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Blog Post Not Found</h2>
        <Link to="/blog" className="text-[var(--primary)] hover:underline font-medium">
          &larr; Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto p-4 sm:p-6 lg:p-8 mt-10 mb-20 animate-fade-in">
      <Link to="/blog" className="text-[var(--primary)] hover:underline mb-8 inline-block font-medium">
        &larr; Back to Blogs
      </Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="w-full h-[300px] sm:h-[400px] md:h-[450px] relative">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="p-6 sm:p-8 md:p-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-[#e4fce7] text-[var(--primary)] px-4 py-1.5 rounded-full font-medium text-sm">
              Nutrition
            </span>
            <span className="text-[var(--text-secondary)] font-medium text-sm">
              {post.date}
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-8 leading-tight">
            {post.title}
          </h1>
          
          <div className="prose prose-lg max-w-none text-[var(--text-secondary)]">
            <p className="text-lg sm:text-xl font-medium leading-relaxed mb-6">
              {post.description}
            </p>
            
            <p className="mb-6 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in erat at turpis ullamcorper pulvinar. Proin non risus nisl. Nullam congue purus sit amet libero luctus, id lacinia lectus laoreet. Nam mattis justo ac mauris semper, non gravida turpis volutpat. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
            </p>
            
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-4">The Benefits of Healthy Choices</h3>
            
            <p className="mb-6 leading-relaxed">
              Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Maecenas tincidunt facilisis libero non consectetur. Donec congue iaculis tellus non scelerisque. Curabitur convallis, lacus et fringilla tincidunt, purus magna hendrerit est, et feugiat sem dui et augue.
            </p>

            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Rich in essential vitamins and minerals</li>
              <li>Boosts immune system naturally</li>
              <li>Supports healthy digestion</li>
              <li>Improves overall energy levels</li>
            </ul>
            
            <p className="mb-6 leading-relaxed">
              Suspendisse potenti. Mauris eget orci et quam aliquam semper. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi fermentum tristique commodo. Sed vel vehicula sapien. Aenean non mi ut est vestibulum hendrerit eu a libero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogDetails;