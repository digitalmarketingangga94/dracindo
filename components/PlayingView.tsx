import React, { useRef } from 'react';
import { DramaDetail, ChapterVideo, VideoStream } from '../types';
import { translations } from '../translations';

interface PlayingViewProps {
  selectedDrama: DramaDetail | null;
  currentEpisode: number;
  currentVideoData: ChapterVideo | null;
  selectedStream: VideoStream | null;
  setSelectedStream: (stream: VideoStream) => void;
  isVideoLoading: boolean;
  handlePrevEpisode: () => void;
  handleNextEpisode: () => void;
  navigate: (path: string) => void;
  slugify: (text: string) => string;
  t: (key: keyof typeof translations['en']) => string;
}

const PlayingView: React.FC<PlayingViewProps> = ({
  selectedDrama,
  currentEpisode,
  currentVideoData,
  selectedStream,
  setSelectedStream,
  isVideoLoading,
  handlePrevEpisode,
  handleNextEpisode,
  navigate,
  slugify,
  t,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  if (!selectedDrama) return null;
  
  return (
    <div className="min-h-screen bg-black flex flex-col animate-in fade-in duration-700">
      {/* Top Header */}
      <div className="p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-10">
        <button
          onClick={() => {
            const slug = slugify(selectedDrama.title);
            navigate(`/drama/${selectedDrama.id}/${slug}`);
          }}
          className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors"
        >
          <i className="fas fa-chevron-left"></i>
          <div>
            <h2 className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{selectedDrama.title}</h2>
            <p className="text-[10px] uppercase tracking-widest opacity-60">{t('episode')} {currentEpisode}</p>
          </div>
        </button>
        <div className="flex items-center gap-4">
          {currentVideoData && (
            <select
              value={selectedStream?.quality}
              onChange={(e) => {
                const stream = currentVideoData.stream_url.find(s => s.quality === parseInt(e.target.value));
                if (stream) setSelectedStream(stream);
              }}
              className="bg-white/10 text-white text-xs font-bold border border-white/20 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {currentVideoData.stream_url.map(s => (
                <option key={s.quality} value={s.quality} className="bg-slate-900">{s.quality}p</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Video Player Container */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden group">
        {isVideoLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">{t('loading')}</p>
          </div>
        ) : selectedStream ? (
          <video
            ref={videoRef}
            src={selectedStream.url}
            controls
            autoPlay
            className="w-full h-full max-h-screen object-contain"
            onEnded={handleNextEpisode}
          />
        ) : (
          <div className="text-center p-8">
            <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4 opacity-40"></i>
            <p className="text-slate-400 font-bold">{t('restrictedStream')}</p>
          </div>
        )}

        {/* Quick Controls Overlay on Desktop */}
        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-8 items-center pointer-events-none">
          <button
            onClick={handlePrevEpisode}
            disabled={currentEpisode <= 1}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-3 text-white pointer-events-auto disabled:opacity-20 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <i className="fas fa-backward-step"></i> {t('prev')}
          </button>
          <button
            onClick={handleNextEpisode}
            disabled={currentEpisode >= (selectedDrama.chapters?.length || selectedDrama.episode_count || 0)}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-3 text-white pointer-events-auto disabled:opacity-20 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            {t('next')} <i className="fas fa-forward-step"></i>
          </button>
        </div>
      </div>

      {/* Bottom Description (Mobile Friendly) */}
      <div className="bg-slate-950 p-6 border-t border-white/5 md:hidden">
        <h3 className="font-bold text-white mb-2">{t('episode')} {currentEpisode}</h3>
        <p className="text-slate-400 text-sm line-clamp-3">{selectedDrama.introduction}</p>
      </div>
    </div>
  );
};

export default PlayingView;
