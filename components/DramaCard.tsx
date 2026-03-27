
import React, { memo } from 'react';
import { Drama } from '../types';

interface DramaCardProps {
  drama: Drama;
  onClick: (drama: Drama) => void;
  variant?: 'large' | 'small';
}

const DramaCard: React.FC<DramaCardProps> = memo(({ drama, onClick, variant = 'small' }) => {
  return (
    <div 
      className={`relative group cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900 border border-white/5 ${variant === 'large' ? 'aspect-[2/3] w-full' : 'w-full aspect-[2/3]'}`}
      onClick={() => onClick(drama)}
    >
      <img 
        src={drama.cover_image} 
        alt={drama.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
        <div className="glass-light backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/20 tracking-wider">
          {drama.episode_count || 0} EP
        </div>
        {drama.score && (
          <div className="glass-light backdrop-blur-md text-yellow-400 text-[10px] font-black px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1">
            <i className="fas fa-star text-[8px]"></i> {drama.score}
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
        <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 leading-tight mb-2 group-hover:text-indigo-400 transition-colors">
          {drama.title}
        </h3>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{drama.is_finish === 1 ? 'Completed' : 'Ongoing'}</span>
          <div className="w-1 h-1 rounded-full bg-slate-600"></div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Watch Now</span>
        </div>
      </div>

      {/* Play Icon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
        <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 transform scale-50 group-hover:scale-100 transition-transform duration-500">
          <i className="fas fa-play text-lg ml-1"></i>
        </div>
      </div>
    </div>
  );
});

export default DramaCard;
