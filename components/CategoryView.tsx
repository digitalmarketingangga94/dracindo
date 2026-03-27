import React from 'react';
import DramaCard from './DramaCard';
import { Drama, PaginationMeta } from '../types';
import { translations } from '../translations';

interface CategoryViewProps {
  currentCategoryTitle: string;
  searchMeta: PaginationMeta | null;
  t: (key: keyof typeof translations['en']) => string;
  navigate: (path: string) => void;
  searchResults: Drama[];
  handleDramaClick: (drama: Drama) => void;
  handleLoadMoreSearch: () => void;
  isLoadingMore: boolean;
}

const CategoryView: React.FC<CategoryViewProps> = ({
  currentCategoryTitle,
  searchMeta,
  t,
  navigate,
  searchResults,
  handleDramaClick,
  handleLoadMoreSearch,
  isLoadingMore,
}) => (
  <div className="px-4 md:px-8 py-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
    <div className="flex items-center justify-between mb-12">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          {currentCategoryTitle}
        </h2>
        <p className="text-slate-500 text-sm">
          {searchMeta ? `${searchMeta.total} ${t('titlesAvailable')}` : t('exploreLibrary')}
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-2 font-bold text-sm"
      >
        <i className="fas fa-times"></i> {t('close')}
      </button>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
      {searchResults.map((drama, index) => (
        <div key={`${drama.id}-${index}`} className="animate-in fade-in zoom-in duration-300" style={{ animationDelay: `${(index % 6) * 50}ms` }}>
          <DramaCard
            drama={drama}
            onClick={handleDramaClick}
          />
        </div>
      ))}
    </div>

    {searchMeta?.has_more && (
      <div className="mt-16 flex justify-center">
        <button
          onClick={handleLoadMoreSearch}
          disabled={isLoadingMore}
          className="group relative px-10 py-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] overflow-hidden transition-all hover:border-indigo-500/50 active:scale-95 disabled:opacity-50 text-slate-900 dark:text-white"
        >
          <span className="relative z-10 flex items-center gap-3">
            {isLoadingMore ? (
              <><i className="fas fa-circle-notch animate-spin text-indigo-600 dark:text-indigo-500"></i> {t('loading')}</>
            ) : (
              <>{t('loadMore')} <i className="fas fa-chevron-down text-indigo-600 dark:text-indigo-500 group-hover:translate-y-1 transition-transform"></i></>
            )}
          </span>
        </button>
      </div>
    )}
  </div>
);

export default CategoryView;
