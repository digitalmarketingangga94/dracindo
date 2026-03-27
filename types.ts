
export interface Drama {
  id: string;
  title: string;
  cover_image: string;
  introduction: string;
  score?: string;
  tags?: string[];
  is_finish?: number;
  episode_count?: number;
  play_count?: string;
}

export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  has_more: boolean;
}

export interface DramaResponse {
  data: Drama[];
  meta: {
    pagination: PaginationMeta;
  };
  success: boolean;
  message: string;
}

export interface DramaDetail extends Drama {
  chapters: Chapter[];
}

export interface Chapter {
  chapter_id: string;
  chapter_name: string;
  is_free: number;
  video_url?: string;
}

export interface VideoStream {
  quality: number;
  url: string;
}

export interface ChapterVideo {
  chapter_index: string;
  stream_url: VideoStream[];
}

export interface VideoResponse {
  data: ChapterVideo[];
  extras: ChapterVideo[] | null;
  success: boolean;
  message: string;
}

export enum ViewMode {
  HOME = 'home',
  DETAIL = 'detail',
  SEARCH = 'search',
  CATEGORY = 'category',
  PLAYING = 'playing',
  SITEMAP = 'sitemap',
  LOGIN = 'login',
  DASHBOARD = 'dashboard'
}
