import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface DashboardPageProps {
  onBack: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onBack }) => {
  const [user, setUser] = useState<any>(null);
  const [injectedKeywordsText, setInjectedKeywordsText] = useState('');
  const [isUpdatingSitemap, setIsUpdatingSitemap] = useState(false);
  const [injectedKeywords, setInjectedKeywords] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [headerScripts, setHeaderScripts] = useState('');
  const [isUpdatingScripts, setIsUpdatingScripts] = useState(false);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'header_scripts')
      .single();
    
    if (data) setHeaderScripts(data.value);
    else if (error) console.error('Error fetching settings:', error);
  };

  const saveScripts = async () => {
    setIsUpdatingScripts(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'header_scripts', value: headerScripts }, { onConflict: 'key' });
    
    if (error) alert('Failed to save scripts');
    else alert('Header scripts updated successfully!');
    setIsUpdatingScripts(false);
  };

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    const { data, error } = await supabase
      .from('page_analytics')
      .select('*')
      .order('view_count', { ascending: false });
    
    if (error) console.error('Error fetching analytics:', error);
    else setAnalytics(data || []);
    setIsLoadingAnalytics(false);
  };

  const fetchInjectedKeywords = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'active_keywords')
        .single();
      if (data && !error) {
        setInjectedKeywords(JSON.parse(data.value) as string[]);
      } else {
        setInjectedKeywords([]);
      }
    } catch (e) {
      console.error('Failed to load injected keywords', e);
    }
  };

  const fetchData = () => {
    if (!user) return;
    fetchAnalytics();
    fetchSettings();
    fetchInjectedKeywords();
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) window.location.href = '/';
  };

  const saveToSitemap = async () => {
    setIsUpdatingSitemap(true);
    const keywordsList = injectedKeywordsText
      .split(/[\n,]/)
      .map(k => k.trim())
      .filter(k => k.length > 0);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'active_keywords', value: JSON.stringify(keywordsList) }, { onConflict: 'key' });
      if (error) throw error;
      setInjectedKeywords(keywordsList);
      setInjectedKeywordsText('');
      alert(`${keywordsList.length} keyword berhasil diinjeksi ke sitemap!`);
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan keyword');
    } finally {
      setIsUpdatingSitemap(false);
    }
  };

  const removeKeyword = async (keyword: string) => {
    const updated = injectedKeywords.filter(k => k !== keyword);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'active_keywords', value: JSON.stringify(updated) }, { onConflict: 'key' });
    if (!error) setInjectedKeywords(updated);
    else alert('Gagal menghapus keyword');
  };

  const clearAllKeywords = async () => {
    if (!confirm('Clear all injected keywords from sitemap?')) return;
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'active_keywords', value: '[]' }, { onConflict: 'key' });
    if (!error) {
      setInjectedKeywords([]);
      alert('Semua keyword berhasil dihapus.');
    } else {
      alert('Gagal menghapus semua keyword');
    }
  };



  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center text-red-500 mb-8">
          <i className="fas fa-lock text-3xl"></i>
        </div>
        <h1 className="text-3xl font-black text-white mb-4">Restricted Access</h1>
        <p className="text-slate-400 max-w-sm mb-10 leading-relaxed">
          This dashboard contains high-level administrative tools. Please sign in with an authorized account.
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
        >
          LOG IN AS ADMIN
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white animate-fade-in pb-20">
      {/* Top Header */}
      <nav className="border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <i className="fas fa-user-shield"></i>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter">ADMIN DASHBOARD</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-xs font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest mr-4">Preview Site</button>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-red-500 hover:border-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter mb-2 italic">KEYWORD INJECTION</h2>
                  <p className="text-slate-500 text-sm">Dynamic SEO URL & Sitemap generation tool</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-400">{injectedKeywords.length}</div>
                  <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">Injected Keywords</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-md relative overflow-hidden group/card shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover/card:opacity-10 transition-opacity">
                  <i className="fas fa-syringe text-9xl"></i>
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">
                       Enter Metadata Keywords
                    </label>
                    <textarea
                      value={injectedKeywordsText}
                      onChange={(e) => setInjectedKeywordsText(e.target.value)}
                      placeholder="nonton film drakor&#10;film drakor indo&#10;ceo drakor"
                      className="w-full h-64 bg-slate-900/50 border border-white/10 rounded-3xl p-8 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm leading-loose shadow-inner"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-4">
                    <button
                      onClick={saveToSitemap}
                      disabled={isUpdatingSitemap}
                      className="group relative px-12 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95"
                    >
                      {isUpdatingSitemap ? (
                        <span className="flex items-center gap-3">
                          <i className="fas fa-rotate animate-spin"></i> SYNCING...
                        </span>
                      ) : (
                        <span className="flex items-center gap-3">
                          <i className="fas fa-bolt-lightning text-yellow-400 group-hover:scale-125 transition-transform"></i>
                          INJECT TO SITEMAP
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={() => setInjectedKeywordsText('')}
                      className="px-8 py-5 border border-white/10 bg-white/5 text-slate-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                      Clear All
                    </button>
                    <a 
                      href="/sitemap-keyword.xml" 
                      target="_blank" 
                      className="ml-auto flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                    >
                      View XML <i className="fas fa-external-link text-[8px]"></i>
                    </a>
                  </div>

                  <div className="mt-8 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <i className="fas fa-circle-info"></i> Best Practices
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500 font-medium">
                      <li className="flex items-start gap-3">
                        <i className="fas fa-check text-emerald-500 mt-1"></i>
                        <span>Gunakan satu baris untuk satu keyword (newline).</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fas fa-check text-emerald-500 mt-1"></i>
                        <span>Focus on high-volume search terms for better SEO.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Active Keywords Chips — inside card */}
                  {injectedKeywords.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">
                          <i className="fas fa-tag mr-2 text-indigo-500"></i>
                          Active Keywords ({injectedKeywords.length})
                        </h4>
                        <button
                          onClick={clearAllKeywords}
                          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-colors"
                        >
                          <i className="fas fa-trash-alt text-[9px]"></i> Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {injectedKeywords.map((kw, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-lg text-xs font-medium text-indigo-300 hover:border-red-500/40 hover:bg-red-500/10 transition-all"
                          >
                            <span>{kw}</span>
                            <button
                              onClick={() => removeKeyword(kw)}
                              className="text-indigo-400/40 hover:text-red-400 transition-colors"
                              title="Remove"
                            >
                              <i className="fas fa-times text-[9px]"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Script Injection Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter mb-2 italic">SCRIPT INJECTION</h2>
                  <p className="text-slate-500 text-sm">Inject custom scripts (GA, Pixels, etc.) into head tag</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-md relative overflow-hidden group/card shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover/card:opacity-10 transition-opacity">
                  <i className="fas fa-code text-9xl"></i>
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Paste Code Here (&lt;script&gt; tags, etc.)</label>
                    <textarea
                      value={headerScripts}
                      onChange={(e) => setHeaderScripts(e.target.value)}
                      placeholder="<!-- Google Analytics -->\n<script>...</script>"
                      className="w-full h-48 bg-slate-900/50 border border-white/10 rounded-3xl p-6 text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-xs leading-loose"
                    />
                  </div>
                  <button
                    onClick={saveScripts}
                    disabled={isUpdatingScripts}
                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                  >
                    {isUpdatingScripts ? 'Saving...' : 'SAVE SCRIPTS'}
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Side Info / Stats / Analytics */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-chart-pie text-indigo-500"></i> PAGE ANALYTICS
                </h3>
                <button onClick={fetchAnalytics} className="text-slate-500 hover:text-white transition-colors">
                  <i className={`fas fa-sync-alt text-xs ${isLoadingAnalytics ? 'animate-spin' : ''}`}></i>
                </button>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {analytics.length > 0 ? analytics.map((page, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-white truncate">{page.path === '/' ? 'Home (/) ' : page.path}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Visit Count</div>
                    </div>
                    <div className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-lg text-xs font-black">
                      {page.view_count.toLocaleString()}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-30 text-xs font-bold uppercase tracking-widest">No analytics data yet</div>
                )}
              </div>
            </section>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">

              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-xl font-black mb-6 flex items-center gap-3 italic">
                <i className="fas fa-chart-line"></i> ENGINE STATUS
              </h3>
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">SEO Server</span>
                  <span className="flex items-center gap-2 font-black text-xs uppercase">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">API Latency</span>
                  <span className="font-black text-xs">24ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Supabase Auth</span>
                  <span className="font-black text-xs text-emerald-400">ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8">System Notifications</h3>
              <div className="space-y-6">
                <div className="flex gap-4 p-4 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                    <i className="fas fa-bell text-xs"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">Welcome to Admin Panel</h4>
                    <p className="text-[10px] text-slate-500">You now have access to administrative tools.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
