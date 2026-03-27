import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { dramaApi } from './services/apiService';
import { ViewMode, DramaDetail, PaginationMeta, ChapterVideo, VideoStream, DramaResponse } from './types';
import { supabase } from './services/supabaseClient';
import { Language, translations } from './translations';
import { slugify } from './services/utils';

// Lazy Loaded Components
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';

const Footer = lazy(() => import('./components/Footer'));
const DetailView = lazy(() => import('./components/DetailView'));
const PlayingView = lazy(() => import('./components/PlayingView'));
const SearchView = lazy(() => import('./components/SearchView'));
const CategoryView = lazy(() => import('./components/CategoryView'));
const SitemapView = lazy(() => import('./components/SitemapView'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const DashboardPage = lazy(() => import('./components/DashboardPage'));


const LoadingFallback = () => (
  <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-md flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <div className="w-20 h-20 border-t-4 border-indigo-500 border-solid rounded-full animate-spin shadow-[0_0_50px_rgba(99,102,241,0.3)]"></div>
      <p className="text-white text-xs font-black uppercase tracking-[0.5em] animate-pulse">Loading</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.HOME);
  const [language, setLanguage] = useState<Language>('id');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const t = (key: keyof typeof translations['en']) => translations[language][key];

  const [trendingDramas, setTrendingDramas] = useState<any[]>([]);
  const [mustSeeDramas, setMustSeeDramas] = useState<any[]>([]);
  const [hiddenGems, setHiddenGems] = useState<any[]>([]);
  const [indoDramas, setIndoDramas] = useState<any[]>([]);
  const [allDramas, setAllDramas] = useState<any[]>([]);

  const [selectedDrama, setSelectedDrama] = useState<DramaDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchMeta, setSearchMeta] = useState<PaginationMeta | null>(null);
  const [searchPage, setSearchPage] = useState(1);

  // Video Player States
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [currentVideoData, setCurrentVideoData] = useState<ChapterVideo | null>(null);
  const [selectedStream, setSelectedStream] = useState<VideoStream | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentCategoryTitle, setCurrentCategoryTitle] = useState<string>('');
  const [currentCategoryFetcher, setCurrentCategoryFetcher] = useState<((page: number) => Promise<DramaResponse>) | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // SEO Schema Injection
  useEffect(() => {
    const videoScriptId = 'video-schema-jsonld';
    const seriesScriptId = 'series-schema-jsonld';

    [videoScriptId, seriesScriptId].forEach(id => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    });

    if (viewMode === ViewMode.PLAYING && selectedDrama && selectedStream) {
      const videoSchema = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": `${selectedDrama.title} - Episode ${currentEpisode}`,
        "description": selectedDrama.introduction,
        "thumbnailUrl": selectedDrama.cover_image,
        "uploadDate": "2024-01-01T08:00:00+00:00",
        "duration": "PT2M33S",
        "embedUrl": window.location.href,
        "contentUrl": selectedStream.url,
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/WatchAction",
          "userInteractionCount": selectedDrama.play_count || 0
        }
      };

      const script = document.createElement('script');
      script.id = videoScriptId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(videoSchema);
      document.head.appendChild(script);
    }

    if (viewMode === ViewMode.DETAIL && selectedDrama) {
      const seriesSchema = {
        "@context": "https://schema.org",
        "@type": "TVSeries",
        "name": selectedDrama.title,
        "description": selectedDrama.introduction,
        "image": selectedDrama.cover_image,
        "genre": selectedDrama.tags || [],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": selectedDrama.score || "8.9",
          "bestRating": "10",
          "worstRating": "1",
          "ratingCount": Math.floor((selectedDrama.play_count || 1000) / 10)
        }
      };

      const script = document.createElement('script');
      script.id = seriesScriptId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(seriesSchema);
      document.head.appendChild(script);
    }

    return () => {
      [videoScriptId, seriesScriptId].forEach(id => {
        const script = document.getElementById(id);
        if (script) script.remove();
      });
    };
  }, [viewMode, selectedDrama, currentEpisode, selectedStream]);

  // SEO Metadata Update
  useEffect(() => {
    let title = "Dracindo - Premium Drama Streaming Experience";
    let desc = "Stream the latest Asian dramas with Indonesian subtitles in HD quality. Join the Dracindo community today.";

    if (viewMode === ViewMode.PLAYING && selectedDrama) {
      title = `${t('play')} ${selectedDrama.title} - Episode ${currentEpisode} | Dracindo`;
      desc = `Nonton ${selectedDrama.title} episode ${currentEpisode} sub Indo. ${selectedDrama.introduction.slice(0, 150)}...`;
    } else if (viewMode === ViewMode.DETAIL && selectedDrama) {
      title = `${selectedDrama.title} - Nonton Sub Indo HD | Dracindo`;
      desc = `Informasi lengkap drama ${selectedDrama.title}. ${selectedDrama.introduction.slice(0, 160)}...`;
    } else if (viewMode === ViewMode.SEARCH) {
      title = `"${searchQuery}" | Dracindo`;
      desc = `"${searchQuery}". Temukan drama Asia favorit Anda di Dracindo.`;
    } else if (viewMode === ViewMode.CATEGORY) {
      title = `${currentCategoryTitle} | Dracindo`;
      desc = `Koleksi lengkap drama ${currentCategoryTitle} dengan subtitle Indonesia.`;
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);
  }, [viewMode, selectedDrama, searchQuery, currentCategoryTitle, currentEpisode, language]);

  const fetchInitialData = useCallback(async () => {
    setIsAppLoading(true);
    try {
      const currentPath = window.location.pathname;
      
      // Only attempt Supabase calls if configured
      if (import.meta.env.VITE_SUPABASE_URL) {
        const [analyticsData, scriptsData] = await Promise.all([
          supabase.from('page_analytics').select('*').eq('path', currentPath).single(),
          supabase.from('site_settings').select('value').eq('key', 'header_scripts').single()
        ]);
        
        if (analyticsData.data) {
          await supabase.from('page_analytics').update({ view_count: analyticsData.data.view_count + 1 }).eq('path', currentPath);
        } else {
          await supabase.from('page_analytics').insert({ path: currentPath, view_count: 1 });
        }

        if (scriptsData.data?.value) {
          const scriptId = 'injected-header-scripts';
          if (!document.getElementById(scriptId)) {
            const container = document.createElement('div');
            container.id = scriptId;
            container.style.display = 'none';
            container.innerHTML = scriptsData.data.value;
            
            Array.from(container.childNodes).forEach(node => {
              if (node.nodeName === 'SCRIPT') {
                const s = document.createElement('script');
                const oldS = node as HTMLScriptElement;
                Array.from(oldS.attributes).forEach(attr => s.setAttribute(attr.name, attr.value));
                s.innerHTML = oldS.innerHTML;
                document.head.appendChild(s);
              } else {
                document.head.appendChild(node);
              }
            });
          }
        }
      }

      const [trending, mustSee, gems, indo, list] = await Promise.all([
        dramaApi.getTrending(1),
        dramaApi.getMustSees(1),
        dramaApi.getHiddenGems(1),
        dramaApi.getIndoDubbed(1),
        dramaApi.getDramas(1)
      ]);
      setTrendingDramas(trending?.data || []);
      setMustSeeDramas(mustSee?.data || []);
      setHiddenGems(gems?.data || []);
      setIndoDramas(indo?.data || []);
      setAllDramas(list?.data || []);
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setIsAppLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    syncPathToState();
  };

  const syncPathToState = useCallback(async () => {
    const path = window.location.pathname;
    if (!path || path === '/') {
      setViewMode(ViewMode.HOME);
      setSelectedDrama(null);
      return;
    }

    const parts = path.split('/');
    if (parts[1] === 'drama' && parts[2]) {
      const dramaId = parts[2];
      setIsRouteLoading(true);
      try {
        const detail = await dramaApi.getDramaDetail(dramaId);
        setSelectedDrama(detail);
        setViewMode(ViewMode.DETAIL);
      } catch (error) {
        console.error("Error fetching detail from path", error);
        navigate('/');
      } finally {
        setIsRouteLoading(false);
      }
    }
    else if (parts[1] === 'play' && parts[2] && parts[3]) {
      const dramaId = parts[2];
      const episode = parseInt(parts[3]);
      setIsRouteLoading(true);
      try {
        const detail = await dramaApi.getDramaDetail(dramaId);
        setSelectedDrama(detail);
        setViewMode(ViewMode.PLAYING);
        await loadEpisode(dramaId, episode);
      } catch (error) {
        console.error("Error playing from path", error);
        navigate('/');
      } finally {
        setIsRouteLoading(false);
      }
    }
    else if (parts[1] === 'search' && parts[2]) {
      const query = decodeURIComponent(parts[2]).replace(/-/g, ' ');
      setSearchQuery(query);
      setIsSearching(true);
      setSearchPage(1);
      setViewMode(ViewMode.SEARCH);
      try {
        const response = await dramaApi.searchDramas(query, 1);
        setSearchResults(response.data || []);
        setSearchMeta(response.meta?.pagination || null);
      } catch (error) {
        console.error("Search error from path", error);
      } finally {
        setIsSearching(false);
      }
    }
    else if (parts[1] === 'category' && parts[2]) {
      const slug = parts[2];
      let fetcher = null;
      let title = "";

      if (slug === 'trending') {
        fetcher = dramaApi.getTrending;
        title = translations[language]['trending'];
      } else if (slug === 'indo-dubbed') {
        fetcher = dramaApi.getIndoDubbed;
        title = translations[language]['indoDubbed'];
      } else if (slug === 'must-watch') {
        fetcher = dramaApi.getMustSees;
        title = translations[language]['mustWatch'];
      } else if (slug === 'hidden-gems') {
        fetcher = dramaApi.getHiddenGems;
        title = translations[language]['hiddenTreasures'];
      }

      if (fetcher) {
        setIsRouteLoading(true);
        setViewMode(ViewMode.CATEGORY);
        setCurrentCategoryTitle(title);
        setCurrentCategoryFetcher(() => fetcher);
        setSearchPage(1);
        try {
          const response = await fetcher(1);
          setSearchResults(response.data || []);
          setSearchMeta(response.meta?.pagination || null);
        } catch (error) {
          console.error("Category fetch error from path", error);
        } finally {
          setIsRouteLoading(false);
        }
      }
    }
    else if (parts[1] === 'sitemap') {
      setViewMode(ViewMode.SITEMAP);
    }
    else if (parts[1] === 'login') {
      setViewMode(ViewMode.LOGIN);
    }
    else if (parts[1] === 'dashboard') {
      setViewMode(ViewMode.DASHBOARD);
    }
  }, [language]);

  useEffect(() => {
    syncPathToState();
    window.addEventListener('popstate', syncPathToState);
    return () => window.removeEventListener('popstate', syncPathToState);
  }, [syncPathToState]);

  const handleDramaClick = async (drama: any) => {
    const slug = slugify(drama.title);
    navigate(`/drama/${drama.id}/${slug}`);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSuggestionsLoading(true);
        try {
          const response = await dramaApi.searchDramas(searchQuery, 1);
          setSuggestions(response.data.slice(0, 6) || []);
        } catch (error) {
          console.error("Suggestions error", error);
        } finally {
          setIsSuggestionsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const searchSlug = searchQuery.trim().toLowerCase().replace(/\s+/g, '-');
    navigate(`/search/${searchSlug}`);
  };

  const handleLoadMoreSearch = async () => {
    if (!searchMeta?.has_more || isLoadingMore) return;
    setIsLoadingMore(true);
    const nextPage = searchPage + 1;
    try {
      let response;
      if (viewMode === ViewMode.SEARCH) {
        response = await dramaApi.searchDramas(searchQuery, nextPage);
      } else if (viewMode === ViewMode.CATEGORY && currentCategoryFetcher) {
        response = await currentCategoryFetcher(nextPage);
      }

      if (response) {
        setSearchResults(prev => [...prev, ...(response.data || [])]);
        setSearchMeta(response.meta?.pagination || null);
        setSearchPage(nextPage);
      }
    } catch (error) {
      console.error("Load more error", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleCategoryClick = (slug: string) => {
    navigate(`/category/${slug}`);
  };

  const loadEpisode = async (bookId: string, episode: number) => {
    setIsVideoLoading(true);
    try {
      const response = await dramaApi.getVideo(bookId, episode);
      if (response.success && response.data.length > 0) {
        const videoData = response.data[0];
        setCurrentVideoData(videoData);
        setCurrentEpisode(episode);
        const bestQuality = [...videoData.stream_url].sort((a, b) => b.quality - a.quality)[0];
        setSelectedStream(bestQuality);
      } else {
        alert("Video for this episode is currently unavailable.");
      }
    } catch (error) {
      console.error("Error loading episode", error);
      alert("Failed to load video. Please try again later.");
    } finally {
      setIsVideoLoading(false);
    }
  };

  const playEpisode = (episodeIndex: number) => {
    if (!selectedDrama) return;
    const slug = slugify(selectedDrama.title);
    navigate(`/play/${selectedDrama.id}/${episodeIndex}/${slug}`);
  };

  const handleNextEpisode = () => {
    if (!selectedDrama) return;
    const nextEp = currentEpisode + 1;
    if (nextEp <= (selectedDrama.chapters?.length || selectedDrama.episode_count || 0)) {
      loadEpisode(selectedDrama.id, nextEp);
    }
  };

  const handlePrevEpisode = () => {
    if (!selectedDrama) return;
    const prevEp = currentEpisode - 1;
    if (prevEp >= 1) {
      loadEpisode(selectedDrama.id, prevEp);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <Suspense fallback={null}>
        <Navbar
          viewMode={viewMode}
          navigate={navigate}
          setSearchQuery={setSearchQuery}
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          setShowSuggestions={setShowSuggestions}
          showSuggestions={showSuggestions}
          isSuggestionsLoading={isSuggestionsLoading}
          suggestions={suggestions}
          handleDramaClick={handleDramaClick}
          language={language}
          setLanguage={setLanguage}
          user={user}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          handleCategoryClick={handleCategoryClick}
          t={t}
        />
      </Suspense>

      <main className="flex-1 relative">
        {(isRouteLoading || (isAppLoading && viewMode === ViewMode.HOME && !trendingDramas.length)) && (
          <LoadingFallback />
        )}

        <Suspense fallback={<LoadingFallback />}>
          {viewMode === ViewMode.HOME && (
            <HomeView
              trendingDramas={trendingDramas}
              mustSeeDramas={mustSeeDramas}
              hiddenGems={hiddenGems}
              indoDramas={indoDramas}
              handleDramaClick={handleDramaClick}
              handleCategoryClick={handleCategoryClick}
              isAppLoading={isAppLoading}
              t={t}
            />
          )}

          {viewMode === ViewMode.DETAIL && (
            <DetailView
              selectedDrama={selectedDrama}
              navigate={navigate}
              playEpisode={playEpisode}
              t={t}
            />
          )}

          {viewMode === ViewMode.PLAYING && (
            <PlayingView
              selectedDrama={selectedDrama}
              currentEpisode={currentEpisode}
              currentVideoData={currentVideoData}
              selectedStream={selectedStream}
              setSelectedStream={setSelectedStream}
              isVideoLoading={isVideoLoading}
              handlePrevEpisode={handlePrevEpisode}
              handleNextEpisode={handleNextEpisode}
              navigate={navigate}
              slugify={slugify}
              t={t}
            />
          )}

          {viewMode === ViewMode.SEARCH && (
            <SearchView
              searchQuery={searchQuery}
              isSearching={isSearching}
              searchResults={searchResults}
              searchMeta={searchMeta}
              t={t}
              language={language}
              navigate={navigate}
              handleDramaClick={handleDramaClick}
              handleLoadMoreSearch={handleLoadMoreSearch}
              isLoadingMore={isLoadingMore}
              trendingDramas={trendingDramas}
              viewMode={viewMode}
            />
          )}

          {viewMode === ViewMode.CATEGORY && (
            <CategoryView
              currentCategoryTitle={currentCategoryTitle}
              searchMeta={searchMeta}
              t={t}
              navigate={navigate}
              searchResults={searchResults}
              handleDramaClick={handleDramaClick}
              handleLoadMoreSearch={handleLoadMoreSearch}
              isLoadingMore={isLoadingMore}
            />
          )}

          {viewMode === ViewMode.SITEMAP && (
            <SitemapView
              language={language}
              t={t}
              navigate={navigate}
              trendingDramas={trendingDramas}
              slugify={slugify}
            />
          )}

          {viewMode === ViewMode.LOGIN && (
            <LoginPage onBack={() => navigate('/')} />
          )}

          {viewMode === ViewMode.DASHBOARD && (
            <DashboardPage onBack={() => navigate('/')} />
          )}
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer viewMode={viewMode} navigate={navigate} t={t} />
      </Suspense>
    </div>
  );
};

export default App;