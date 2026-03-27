import React from 'react';
import { DramaDetail } from '../types';
import { translations } from '../translations';

interface DetailViewProps {
  selectedDrama: DramaDetail | null;
  navigate: (path: string) => void;
  playEpisode: (index: number) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const DetailView: React.FC<DetailViewProps> = ({ selectedDrama, navigate, playEpisode, t }) => {
  if (!selectedDrama) return null;
  return (
    <div className="relative min-h-screen bg-slate-950 text-white animate-fade-in overflow-hidden">
      {/* Background Ambient Effect */}
      <div className="absolute inset-0 z-0">
        <img
          src={selectedDrama.cover_image}
          className="w-full h-full object-cover opacity-20 blur-3xl scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 mb-12 text-slate-400 hover:text-white transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all">
            <i className="fas fa-arrow-left text-sm"></i>
          </div>
          <span className="font-black text-xs uppercase tracking-widest">{t('close')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Side Info */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-32">
              <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 aspect-[2/3] group/poster">
                <img src={selectedDrama.cover_image} alt={selectedDrama.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/poster:scale-105" referrerPolicy="no-referrer" />
              </div>
              <div className="mt-10 space-y-4">
                <button
                  onClick={() => playEpisode(1)}
                  className="group w-full relative bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <i className="fas fa-play text-xs"></i> {t('play').toUpperCase()}
                  </span>
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center backdrop-blur-md">
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{t('rating')}</div>
                    <div className="text-2xl font-black text-yellow-400">{selectedDrama.score || '8.9'}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center backdrop-blur-md">
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{t('episodes')}</div>
                    <div className="text-2xl font-black text-indigo-400">{selectedDrama.episode_count || '70'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Info */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="flex flex-wrap gap-3 mb-8">
              {selectedDrama.tags?.map((tag, i) => (
                <span key={i} className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-white mb-10 leading-[1.1] tracking-tighter">{selectedDrama.title}</h1>

            <div className="mb-16">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                {t('introduction')} <div className="h-px flex-1 bg-white/10"></div>
              </h3>
              <p className="text-slate-400 leading-relaxed text-lg max-w-4xl font-medium">
                {selectedDrama.introduction}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/10">
              <h3 className="text-xl font-black text-white mb-10 flex items-center justify-between">
                <span>{t('episodes')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Available Now</span>
                </div>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: selectedDrama.episode_count || selectedDrama.chapters?.length || 0 }).map((_, idx) => {
                  const epNum = idx + 1;
                  const chapter = selectedDrama.chapters?.[idx];
                  return (
                    <button
                      key={epNum}
                      onClick={() => playEpisode(epNum)}
                      className="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all text-left"
                    >
                      <div className="flex items-center gap-5">
                        <span className="text-[10px] font-black text-slate-500 group-hover:text-indigo-400 transition-colors tracking-widest">
                          {epNum.toString().padStart(2, '0')}
                        </span>
                        <span className="text-sm font-bold text-slate-300 group-hover:text-white line-clamp-1 transition-colors">
                          {chapter?.chapter_name || `${t('episode')} ${epNum}`}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <i className="fas fa-play text-[8px] text-white"></i>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;
