import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Compression for fast loading
  app.use(compression());

  // 2. Helmet for security and SEO headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable CSP for easier development/preview
      crossOriginEmbedderPolicy: false,
    })
  );

  // 3. Static assets with long caching
  const cacheOptions = {
    maxAge: '1y',
    immutable: true,
  };

  // 4. API routes (if any)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Explicitly serve sitemaps to prevent SPA redirect
  app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(process.cwd(), 'public', 'sitemap.xml')));
  app.get('/sitemap-keyword.xml', async (req, res) => {
    try {
      const { handler } = await import('./netlify/functions/sitemap-keyword.js');
      const response = await handler();
      res.set(response.headers);
      res.status(response.statusCode).send(response.body);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error generating sitemap');
    }
  });
  
  // GET active keywords from JSON sidecar
  app.get('/api/sitemap/keywords', async (req, res) => {
    try {
      const fs = await import('node:fs/promises');
      const dataPath = path.join(process.cwd(), 'public', 'sitemap-keyword-data.json');
      try {
        const raw = await fs.readFile(dataPath, 'utf-8');
        res.json({ keywords: JSON.parse(raw) });
      } catch {
        res.json({ keywords: [] });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to read keywords' });
    }
  });

  // Update sitemap.xml based on injected keywords
  app.post('/api/sitemap/update', express.json({ limit: '50mb' }), async (req: express.Request, res: express.Response) => {
    try {
      const { keywords } = req.body;
      if (!Array.isArray(keywords)) {
        return res.status(400).json({ error: 'Keywords must be an array' });
      }

      const sitemapPath = path.join(process.cwd(), 'public', 'sitemap-keyword.xml');
      const dataPath = path.join(process.cwd(), 'public', 'sitemap-keyword-data.json');

      const baseUrl = 'https://dracindo.biz.id';
      const today = new Date().toISOString().split('T')[0];

      // Basic sitemap template for keywords ONLY
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Search Keyword URLs for SEO -->
`;

      keywords.forEach(keyword => {
        const slug = keyword.toLowerCase().trim().replace(/\s+/g, '-');
        xml += `  <url>
    <loc>${baseUrl}/search/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>\n`;
      });

      xml += `</urlset>`;

      const fs = await import('node:fs/promises');
      await fs.writeFile(sitemapPath, xml);
      // Persist keywords array as JSON sidecar for easy retrieval
      await fs.writeFile(dataPath, JSON.stringify(keywords));

      // Also update dist folder if it exists
      const distSitemapPath = path.join(process.cwd(), 'dist', 'sitemap-keyword.xml');
      const distDataPath = path.join(process.cwd(), 'dist', 'sitemap-keyword-data.json');
      try {
        await fs.access(path.join(process.cwd(), 'dist'));
        await fs.writeFile(distSitemapPath, xml);
        await fs.writeFile(distDataPath, JSON.stringify(keywords));
      } catch (err) {}

      res.json({ success: true, message: `Keywords updated in sitemap-keyword.xml successfully` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update sitemap' });
    }
  });

  // 5. Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, cacheOptions));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
