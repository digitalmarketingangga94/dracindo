import React from 'react';
import CategorySection from './CategorySection';
import { Drama } from '../types';
import { translations } from '../translations';

interface HomeViewProps {
  trendingDramas: Drama[];
  mustSeeDramas: Drama[];
  hiddenGems: Drama[];
  indoDramas: Drama[];
  handleDramaClick: (drama: Drama) => void;
  handleCategoryClick: (slug: string) => void;
  isAppLoading: boolean;
  t: (key: keyof typeof translations['en']) => string;
}

const HomeView: React.FC<HomeViewProps> = ({
  trendingDramas,
  mustSeeDramas,
  hiddenGems,
  indoDramas,
  handleDramaClick,
  handleCategoryClick,
  isAppLoading,
  t,
}) => (
  <div className="space-y-4 md:space-y-8 animate-fade-in">
    {/* Hero Section - More Immersive */}
    <section className="relative h-[85vh] min-h-[500px] overflow-hidden group">
      {trendingDramas.length > 0 ? (
        <>
          <img
            src={trendingDramas[0].cover_image}
            alt={trendingDramas[0].title}
            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 hero-mask"
            referrerPolicy="no-referrer"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 hero-gradient" />

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 p-8 md:p-20 w-full z-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <span className="glass-light backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.2em] uppercase border border-white/20">
                  <i className="fas fa-fire mr-2 text-orange-500"></i> {t('trending')}
                </span>
                <span className="text-white/60 text-[10px] font-black tracking-[0.2em] uppercase">
                  {trendingDramas[0].episode_count} {t('episodes')}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <i key={i} className={`fas fa-star text-[10px] ${i <= (trendingDramas[0].score ? Math.round(trendingDramas[0].score / 2) : 4) ? 'text-yellow-400' : 'text-white/20'}`}></i>
                  ))}
                </div>
              </div>

              <h1 className="text-5xl md:text-8xl font-black text-white mb-8 line-clamp-2 leading-[1.1] tracking-tighter drop-shadow-2xl animate-fade-in" style={{ animationDelay: '400ms' }}>
                {trendingDramas[0].title}
              </h1>

              <p className="text-slate-300 text-base md:text-xl mb-10 line-clamp-3 md:line-clamp-2 max-w-3xl leading-relaxed drop-shadow-lg animate-fade-in" style={{ animationDelay: '600ms' }}>
                {trendingDramas[0].introduction}
              </p>

              <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '800ms' }}>
                <button
                  onClick={() => handleDramaClick(trendingDramas[0])}
                  className="group relative bg-white text-slate-950 px-10 py-5 rounded-2xl font-black flex items-center overflow-hidden transition-all hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative flex items-center group-hover:text-white transition-colors">
                    <i className="fas fa-play mr-3"></i> {t('play').toUpperCase()}
                  </span>
                </button>
                <button
                  onClick={() => handleDramaClick(trendingDramas[0])}
                  className="glass-light backdrop-blur-md text-white px-10 py-5 rounded-2xl font-black flex items-center border border-white/20 transition-all hover:bg-white/10"
                >
                  <i className="fas fa-circle-info mr-3"></i> DETAILS
                </button>
              </div>
            </div>
          </div>

          {/* Visual Flair */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
        </>
      ) : (
        <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <i className="fas fa-clapperboard text-8xl text-slate-800"></i>
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-indigo-600 animate-[loading_1.5s_infinite]"></div>
            </div>
          </div>
        </div>
      )}
    </section>

    {/* Categories Grid - More Spaced and Refined */}
    <div className="relative z-20 -mt-20 space-y-4 md:space-y-12 pb-20">
      <CategorySection
        title={t('trending')}
        icon="fas fa-fire"
        dramas={trendingDramas}
        onDramaClick={handleDramaClick}
        onViewAll={() => handleCategoryClick('trending')}
        viewAllLabel={t('viewAll')}
        loading={isAppLoading && trendingDramas.length === 0}
      />
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>
      <CategorySection
        title={t('indoDubbed')}
        icon="fas fa-microphone"
        dramas={indoDramas}
        onDramaClick={handleDramaClick}
        onViewAll={() => handleCategoryClick('indo-dubbed')}
        viewAllLabel={t('viewAll')}
        loading={isAppLoading && indoDramas.length === 0}
      />
      <CategorySection
        title={t('mustWatch')}
        icon="fas fa-crown"
        dramas={mustSeeDramas}
        onDramaClick={handleDramaClick}
        onViewAll={() => handleCategoryClick('must-watch')}
        viewAllLabel={t('viewAll')}
        loading={isAppLoading && mustSeeDramas.length === 0}
      />
      <CategorySection
        title={t('hiddenTreasures')}
        icon="fas fa-gem"
        dramas={hiddenGems}
        onDramaClick={handleDramaClick}
        onViewAll={() => handleCategoryClick('hidden-gems')}
        viewAllLabel={t('viewAll')}
        loading={isAppLoading && hiddenGems.length === 0}
      />
    </div>
  </div>
);

export default HomeView;
