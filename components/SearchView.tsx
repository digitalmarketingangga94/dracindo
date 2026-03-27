import React from 'react';
import DramaCard from './DramaCard';
import { Drama, PaginationMeta } from '../types';
import { translations, Language } from '../translations';

interface SearchViewProps {
  searchQuery: string;
  isSearching: boolean;
  searchResults: Drama[];
  searchMeta: PaginationMeta | null;
  t: (key: keyof typeof translations['en']) => string;
  language: Language;
  navigate: (path: string) => void;
  handleDramaClick: (drama: Drama) => void;
  handleLoadMoreSearch: () => void;
  isLoadingMore: boolean;
  trendingDramas: Drama[];
  viewMode: any;
}

const SearchView: React.FC<SearchViewProps> = ({
  searchQuery,
  isSearching,
  searchResults,
  searchMeta,
  t,
  language,
  navigate,
  handleDramaClick,
  handleLoadMoreSearch,
  isLoadingMore,
  trendingDramas,
}) => (
  <div className="px-4 md:px-8 py-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
    <div className="flex items-center justify-between mb-12">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          {isSearching ? t('searching') : `"${searchQuery}"`}
        </h2>
        <p className="text-slate-500 text-sm">
          {searchResults.length} {searchMeta ? `${searchMeta.total}` : ''} {t('matchesFound')}
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-2 font-bold text-sm"
      >
        <i className="fas fa-times"></i> {t('closeSearch')}
      </button>
    </div>

    {searchResults.length > 0 ? (
      <>
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
              className="group relative px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] overflow-hidden transition-all hover:border-indigo-500/50 active:scale-95 disabled:opacity-50 text-white"
            >
              <span className="relative z-10 flex items-center gap-3">
                {isLoadingMore ? <i className="fas fa-circle-notch animate-spin"></i> : null}
                {isLoadingMore ? t('loadingMore') : t('exploreMore')}
              </span>
              <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        )}
      </>
    ) : !isSearching && (
      <div className="mt-12 animate-fade-in">
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 mb-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <i className="fas fa-robot text-4xl"></i>
            </div>

            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Search Intelligence Insight</p>
            <p className="text-slate-300 text-lg leading-relaxed font-medium">
              {language === 'id' ? (
                <>
                  Pencarian Anda untuk <span className="text-white font-black">"{searchQuery}"</span> membawa Anda ke koleksi eksklusif kami.
                  Meskipun kami saat ini tidak memiliki judul yang tepat dengan nama tersebut, algoritma kami merekomendasikan
                  karya-karya berikut yang mengeksplorasi tema ambisi, strategi, dan kisah
                  yang mungkin sedang Anda cari.
                </>
              ) : (
                <>
                  Your search for <span className="text-white font-black">"{searchQuery}"</span> has led you to our exclusive curation.
                  While we don't have an exact match at this moment, our neural recommendations suggest these masterpieces
                  that explore themes of ambition, strategy, and power dynamics similar to what you're looking for.
                </>
              )}
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-2xl shadow-indigo-600/30 transition-all transform hover:-translate-y-1"
          >
            {t('exploreLibraryBtn')}
          </button>
        </div>

        <div className="border-t border-white/5 pt-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{t('recommendedForYou')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
            {[...trendingDramas]
              .sort(() => 0.5 - Math.random())
              .slice(0, 20)
              .map((drama, index) => (
                <div key={`${drama.id}-rec-${index}`} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <DramaCard
                    drama={drama}
                    onClick={handleDramaClick}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default SearchView;
