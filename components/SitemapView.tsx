import React, { useState } from 'react';
import { translations, Language } from '../translations';
import { Drama } from '../types';

interface SitemapViewProps {
  language: Language;
  t: (key: keyof typeof translations['en']) => string;
  navigate: (path: string) => void;
  trendingDramas: Drama[];
  slugify: (text: string) => string;
}

const SitemapView: React.FC<SitemapViewProps> = ({ language, t, navigate, trendingDramas, slugify }) => {
  const categories = [
    { id: 'trending', label: t('trending'), icon: 'fa-fire' },
    { id: 'indo-dubbed', label: t('indoDubbed'), icon: 'fa-microphone' },
    { id: 'must-watch', label: t('mustWatch'), icon: 'fa-crown' },
    { id: 'hidden-gems', label: t('hiddenTreasures'), icon: 'fa-gem' },
  ];

  const seoKeywords = [
    'Drama Korea Sub Indo', 'Drakor Terbaru 2024', 'Nonton Drama China', 
    'Drama Thailand Romantis', 'Drama Action Terbaik', 'Drama Sekolah Populer',
    'Drama Dubbing Indonesia', 'Rekomendasi Drakor', 'Drama Korea Komedi',
    'Nonton Drama Gratis', 'Drama Asia HD', 'Drama Box Office',
    'Drama Korea On-going', 'Drama China Romantis', 'Drama MyDramaList Top'
  ];

  const [injectedKeywordsText, setInjectedKeywordsText] = useState(seoKeywords.join(', '));
  const [currentKeywords, setCurrentKeywords] = useState<string[]>(seoKeywords);
  const [isUpdatingSitemap, setIsUpdatingSitemap] = useState(false);

  const handleInjectKeywords = () => {
    const list = injectedKeywordsText.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setCurrentKeywords(list);
  };

  const saveToSitemap = async () => {
    setIsUpdatingSitemap(true);
    try {
      const response = await fetch('/api/sitemap/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: currentKeywords })
      });
      const result = await response.json();
      if (result.success) alert(result.message);
    } catch (error) {
      console.error(error);
      alert('Failed to update sitemap file');
    } finally {
      setIsUpdatingSitemap(false);
    }
  };

  const [filter, setFilter] = useState('');
  const filteredKeywords = currentKeywords.filter(k => k.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="px-4 md:px-8 py-16 animate-in fade-in duration-500 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter italic">
            {t('sitemap').toUpperCase()}
          </h1>
          <p className="text-slate-500 text-lg max-w-xl font-medium">
            Discover our library through categories and high-performance SEO keywords. 
            <span className="text-indigo-500 font-bold ml-2">Dynamic Injection Mode Enabled.</span>
          </p>
        </div>
        <div className="relative w-full md:w-96 group">
          <input
            type="text"
            placeholder="Filter sitemap..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 pl-14 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
          />
          <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
        </div>
      </div>

      <div className="mb-20 bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] p-10 backdrop-blur-sm relative overflow-hidden group/admin">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover/admin:opacity-20 transition-opacity">
          <i className="fas fa-bolt-lightning text-8xl text-indigo-500"></i>
        </div>
        <h2 className="text-sm font-black text-indigo-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
          <i className="fas fa-syringe"></i> Keyword Injection Input
        </h2>
        <div className="space-y-6 relative z-10">
          <textarea
            value={injectedKeywordsText}
            onChange={(e) => setInjectedKeywordsText(e.target.value)}
            placeholder="Enter keywords separated by commas..."
            className="w-full h-32 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm leading-relaxed"
          />
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleInjectKeywords}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              Apply Injected Keywords
            </button>
            <button
              onClick={saveToSitemap}
              disabled={isUpdatingSitemap}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
            >
              {isUpdatingSitemap ? 'Syncing...' : 'Push to Sitemap.xml'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-4 space-y-10">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-8 flex items-center gap-4">
            Sections <div className="h-px flex-1 bg-slate-200 dark:bg-white/5"></div>
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/category/${cat.id}`)}
                className="group flex items-center justify-between p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
              >
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:rotate-6 transition-transform">
                    <i className={`fas ${cat.icon} text-2xl`}></i>
                  </div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{cat.label}</span>
                </div>
                <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:border-indigo-500/50 transition-all">
                  <i className="fas fa-chevron-right text-xs"></i>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-8 flex items-center gap-4">
            {t('exploreKeywords')} <div className="h-px flex-1 bg-slate-200 dark:bg-white/5"></div>
          </h2>
          <div className="flex flex-wrap gap-4 md:gap-6">
            {filteredKeywords.map((keyword, index) => (
              <button
                key={index}
                onClick={() => navigate(`/search/${slugify(keyword)}`)}
                className="px-10 py-5 rounded-[1.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 font-black text-sm hover:bg-slate-50 dark:hover:bg-indigo-600 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-500/50 transition-all shadow-sm active:scale-95"
              >
                <i className="fas fa-hashtag text-[8px] mr-3 opacity-30 group-hover:opacity-100"></i>
                {keyword}
              </button>
            ))}
            {filteredKeywords.length === 0 && (
              <div className="w-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem]">
                <i className="fas fa-search text-4xl text-slate-200 dark:text-white/5 mb-6"></i>
                <div className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">
                  No results for this query
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapView;
