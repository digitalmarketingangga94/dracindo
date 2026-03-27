import React from 'react';
import { translations, Language } from '../translations';
import { ViewMode } from '../types';

interface FooterProps {
  viewMode: ViewMode;
  navigate: (path: string) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const Footer: React.FC<FooterProps> = ({ viewMode, navigate, t }) => {
  if (viewMode === ViewMode.PLAYING || viewMode === ViewMode.LOGIN || viewMode === ViewMode.DASHBOARD) return null;

  return (
    <footer className="bg-slate-950 border-t border-white/5 py-20 px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                <i className="fas fa-film text-xl"></i>
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">DRACINDO</span>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-10">
              Experience Asian storytelling like never before. Premium quality, instant access, and a community of drama lovers.
            </p>
            <div className="flex gap-4">
              {['instagram', 'twitter', 'tiktok', 'youtube'].map((icon) => (
                <a key={icon} href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all transform hover:-translate-y-1">
                  <i className={`fab fa-${icon} text-lg`}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-white mb-8 uppercase text-[10px] tracking-[0.3em] opacity-50">Discovery</h4>
            <ul className="space-y-4">
              {['Trending', 'Indo Dubbed', 'Must Watch', 'Hidden Gems'].map(item => (
                <li key={item}><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium text-sm">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white mb-8 uppercase text-[10px] tracking-[0.3em] opacity-50">Support</h4>
            <ul className="space-y-4">
              {['Help Center', 'API Documentation', 'Terms of Service', 'Privacy Policy'].map(item => (
                <li key={item}><a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium text-sm">{item}</a></li>
              ))}
              <li>
                <button
                  onClick={() => navigate('/sitemap')}
                  className="text-slate-400 hover:text-indigo-400 transition-colors font-medium text-sm text-left"
                >
                  {t('sitemap')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-slate-400 hover:text-indigo-400 transition-colors font-medium text-sm text-left"
                >
                  Admin Dashboard
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            &copy; 2024 DRACINDO PREMIUM EXPERIENCE. CRAFTED FOR FANS.
          </p>
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> System Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
