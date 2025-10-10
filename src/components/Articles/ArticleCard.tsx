import React from 'react';
import Link from 'next/link';

interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  subheader: string;
  coverImageUrl: string;
  tags: string;
  created_at: string;
  likes?: number;
  views?: number;
  commentCount?: number;
}

interface ArticleCardProps {
  article: ArticleListItem;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <Link 
      href={`/articles/${article.slug || article.id}`}
      className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md active:bg-blue-50 transition-all bg-white"
    >
      <div className="flex">
        {/* Article Image */}
        {article.coverImageUrl && (
          <div className="flex-shrink-0">
            <img 
              src={article.coverImageUrl} 
              alt={article.title}
              className="w-24 h-24 sm:w-32 sm:h-32 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* Article Content */}
        <div className="flex-1 p-3 sm:p-4 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {article.title}
          </h2>
          
          <p className="text-gray-600 line-clamp-2 text-sm hidden sm:block mb-2">
            {article.subheader}
          </p>
          
          <div className="flex flex-col gap-2">
            {/* Date and Tags */}
            <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
              <span className="flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(article.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </span>
              {article.tags && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                  {article.tags}
                </span>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center">
                <svg className="w-3.5 h-3.5 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                {article.likes || 0}
              </span>
              
              <span className="flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.views || 0}
              </span>
              
              <span className="flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {article.commentCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(ArticleCard);
