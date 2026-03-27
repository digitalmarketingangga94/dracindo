import { createClient } from '@supabase/supabase-js';

// Resolve Supabase credentials from common environment variable names
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const handler = async () => {
  let keywords = [];

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'active_keywords')
      .single();

    if (error) {
       console.error('Supabase error fetching keywords:', error.message);
    } else if (data && data.value) {
      // Handle both string and array/object values just in case
      try {
        keywords = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      } catch (e) {
        console.error('JSON parse failed for keywords:', data.value);
        keywords = [];
      }
    }
  } catch (e) {
    console.error('Unexpected failure in fetching keywords:', e);
  }

  const baseUrl = 'https://dracindo.biz.id';
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  if (Array.isArray(keywords)) {
    for (const keyword of keywords) {
      if (typeof keyword === 'string' && keyword.trim()) {
        const slug = keyword.toLowerCase().trim().replace(/\s+/g, '-');
        xml += `  <url>\n    <loc>${baseUrl}/search/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }
    }
  }

  xml += `</urlset>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
    body: xml,
  };
};

