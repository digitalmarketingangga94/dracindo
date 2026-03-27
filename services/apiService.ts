
import { Drama, DramaResponse, DramaDetail, VideoResponse } from '../types';

const BASE_URL = 'https://db.hafizhibnusyam.my.id/api';

export const dramaApi = {
  getDramas: async (page: number = 1): Promise<DramaResponse> => {
    const response = await fetch(`${BASE_URL}/dramas?page=${page}`);
    return response.json();
  },

  getIndoDubbed: async (page: number = 1): Promise<DramaResponse> => {
    const response = await fetch(`${BASE_URL}/dramas/indo?page=${page}`);
    return response.json();
  },

  getMustSees: async (page: number = 1): Promise<DramaResponse> => {
    const response = await fetch(`${BASE_URL}/dramas/must-sees?page=${page}`);
    return response.json();
  },

  getTrending: async (page: number = 1): Promise<DramaResponse> => {
    const response = await fetch(`${BASE_URL}/dramas/trending?page=${page}`);
    return response.json();
  },

  getHiddenGems: async (page: number = 1): Promise<DramaResponse> => {
    const response = await fetch(`${BASE_URL}/dramas/hidden-gems?page=${page}`);
    return response.json();
  },

  searchDramas: async (query: string, page: number = 1): Promise<DramaResponse> => {
    const response = await fetch(`${BASE_URL}/search?keyword=${encodeURIComponent(query)}&page=${page}&size=20`);
    return response.json();
  },

  getDramaDetail: async (bookId: string): Promise<DramaDetail> => {
    const response = await fetch(`${BASE_URL}/dramas/${bookId}`);
    const result = await response.json();
    return result.data || result;
  },

  getVideo: async (bookId: string, episode: number): Promise<VideoResponse> => {
    // Corrected based on user image: POST with query parameters and empty body
    const response = await fetch(`${BASE_URL}/chapters/video?book_id=${bookId}&episode=${episode}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: ''
    });
    return response.json();
  }
};
