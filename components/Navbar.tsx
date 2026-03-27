import React from 'react';
import { translations, Language } from '../translations';
import { Drama, ViewMode } from '../types';

interface NavbarProps {
  viewMode: ViewMode;
  navigate: (path: string) => void;
  setSearchQuery: (query: string) => void;
  searchQuery: string;
  handleSearch: (e: React.FormEvent) => void;
  setShowSuggestions: (show: boolean) => void;
  showSuggestions: boolean;
  isSuggestionsLoading: boolean;
  suggestions: Drama[];
  handleDramaClick: (drama: Drama) => void;
  language: Language;
  setLanguage: (lang: (l: Language) => Language) => void;
  user: any;
  setIsMobileMenuOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  handleCategoryClick: (slug: string) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  navigate,
  setSearchQuery,
  searchQuery,
  handleSearch,
  setShowSuggestions,
  showSuggestions,
  isSuggestionsLoading,
  suggestions,
  handleDramaClick,
  language,
  setLanguage,
  user,
  setIsMobileMenuOpen,
  isMobileMenuOpen,
  handleCategoryClick,
  t,
}) => {
  if (viewMode === ViewMode.PLAYING || viewMode === ViewMode.LOGIN || viewMode === ViewMode.DASHBOARD) return null;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300 pointer-events-none">
      <div className="bg-gradient-to-b from-slate-950/80 to-transparent pt-4 pb-12">
        <div className="max-w-7xl mx-auto px-6 pointer-events-auto">
          <div className="glass-light backdrop-blur-2xl border border-white/10 rounded-[2rem] px-6 md:px-10 py-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            {/* Logo */}
            <div
              className="flex items-center gap-4 cursor-pointer group"
              onClick={() => {
                navigate('/');
                setSearchQuery('');
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:rotate-12 group-active:scale-90 transition-all duration-500">
                <i className="fas fa-film"></i>
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                DRACINDO
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-10">
              <button onClick={() => handleCategoryClick('trending')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-400 transition-colors">{t('trending')}</button>
              <button onClick={() => handleCategoryClick('indo-dubbed')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-400 transition-colors">{t('indoDubbed')}</button>
              <button onClick={() => handleCategoryClick('must-watch')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-400 transition-colors">{t('mustWatch')}</button>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-4">
              {/* Search Bar - Modern Compact */}
              <form onSubmit={handleSearch} className="relative hidden md:block group/search">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 w-48 lg:w-64 transition-all"
                />
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs group-focus-within/search:text-indigo-400 transition-colors"></i>

                {/* Suggestions Dropdown */}
                {showSuggestions && (searchQuery.trim().length >= 2) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                    {isSuggestionsLoading ? (
                      <div className="p-4 text-center">
                        <i className="fas fa-circle-notch animate-spin text-indigo-500"></i>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="py-2">
                        <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 mb-1">Recommended</div>
                        {suggestions.map((drama) => (
                          <button
                            key={drama.id}
                            onClick={() => handleDramaClick(drama)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left group"
                          >
                            <img src={drama.cover_image} className="w-8 h-10 object-cover rounded-md border border-white/10" referrerPolicy="no-referrer" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{drama.title}</div>
                              <div className="text-[10px] text-slate-500 truncate">{drama.tags ? (typeof drama.tags === 'string' ? drama.tags.split(',')[0] : drama.tags[0]) : ''}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">No results found</div>
                    )}
                  </div>
                )}
              </form>

              <button
                onClick={() => setLanguage(l => l === 'en' ? 'id' : 'en')}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black hover:bg-white/10 transition-all"
              >
                {language.toUpperCase()}
              </button>

              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="group flex items-center gap-3 pl-4 border-l border-white/10"
                >
                  <div className="text-right hidden xl:block">
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">{user.email.split('@')[0]}</div>
                    <div className="text-[8px] font-bold text-indigo-400 uppercase tracking-[0.2em]">ADMIN PANEL</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-all">
                    <i className="fas fa-user-gear"></i>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="group relative bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 overflow-hidden"
                >
                  <span className="relative z-10">Sign In</span>
                  <i className="fas fa-arrow-right text-[8px] group-hover:translate-x-1 transition-transform relative z-10"></i>
                </button>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
              >
                <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
