
import React from 'react';
import { Drama } from '../types';
import DramaCard from './DramaCard';

interface CategorySectionProps {
  title: string;
  icon: string;
  dramas: Drama[];
  onDramaClick: (drama: Drama) => void;
  onViewAll?: () => void;
  viewAllLabel?: string;
  loading?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, icon, dramas, onDramaClick, onViewAll, viewAllLabel = 'View All', loading }) => {
  if (loading) {
    return (
      <div className="mb-12 px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 animate-pulse"></div>
            <div className="h-6 w-40 bg-slate-800 animate-pulse rounded-lg"></div>
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden -mx-6 px-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex-shrink-0 w-[140px] md:w-[180px] aspect-[2/3] bg-slate-800 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!dramas || dramas.length === 0) return null;

  return (
    <section className="mb-12 px-6 group/section animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover/section:bg-indigo-500 group-hover/section:text-white transition-all duration-500">
            <i className={`${icon} text-lg`}></i>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{title}</h2>
        </div>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="group/btn flex items-center gap-2 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest transition-all"
          >
            {viewAllLabel}
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center group-hover/btn:bg-indigo-600 group-hover/btn:border-indigo-500 transition-all">
              <i className="fas fa-chevron-right text-[8px]"></i>
            </div>
          </button>
        )}
      </div>
      
      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 no-scrollbar -mx-6 px-6 scroll-smooth">
        {dramas.map((drama, idx) => (
          <div 
            key={drama.id} 
            className="flex-shrink-0 w-[140px] md:w-[180px]"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <DramaCard 
              drama={drama} 
              onClick={onDramaClick} 
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
