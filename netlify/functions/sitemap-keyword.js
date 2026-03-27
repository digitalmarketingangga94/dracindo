const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

exports.handler = async () => {
  let keywords = [];

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'active_keywords')
      .single();

    if (data && !error) {
      keywords = JSON.parse(data.value);
    }
  } catch (e) {
    console.error('Failed to fetch keywords from Supabase:', e);
  }

  const baseUrl = 'https://dracindo.biz.id';
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const keyword of keywords) {
    const slug = keyword.toLowerCase().trim().replace(/\s+/g, '-');
    xml += `  <url>\n    <loc>${baseUrl}/search/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
    body: xml,
  };
};
