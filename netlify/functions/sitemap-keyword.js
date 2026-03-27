import { createClient } from '@supabase/supabase-js';

// Resolve Supabase credentials from common environment variable names
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const handler = async () => {
  let keywords = [];
  let debugInfo = [];

  try {
    debugInfo.push(`Supabase URL configured: ${SUPABASE_URL !== 'https://placeholder.supabase.co'}`);
    debugInfo.push(`Supabase Key configured: ${SUPABASE_KEY !== 'placeholder'}`);

    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'active_keywords')
      .maybeSingle(); // Use maybeSingle to avoid error if no row exists

    if (error) {
      debugInfo.push(`Supabase query error: ${error.message}`);
      console.error('Supabase error fetching keywords:', error.message);
    } else if (data && data.value) {
      debugInfo.push(`Data found in site_settings. Received type: ${typeof data.value}`);
      try {
        keywords = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        debugInfo.push(`Keywords parsed: ${Array.isArray(keywords) ? keywords.length : 'Not an array'}`);
      } catch (e) {
        debugInfo.push(`JSON parse error: ${e.message}`);
        console.error('JSON parse failed for keywords:', data.value);
      }
    } else {
      debugInfo.push('No row found for key: active_keywords or value is null');
    }
  } catch (e) {
    debugInfo.push(`Unexpected function error: ${e.message}`);
    console.error('Unexpected failure in fetching keywords:', e);
  }

  const baseUrl = 'https://dracindo.biz.id';
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  xml += `  <!-- Diagnostics Information:\n`;
  debugInfo.forEach(info => {
    xml += `       - ${info}\n`;
  });
  xml += `  -->\n`;
  xml += `  <!-- Search Keyword URLs for SEO -->\n`;

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

