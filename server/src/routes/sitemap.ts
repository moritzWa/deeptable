import { Router } from 'express';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Table } from '../models/table';

const router = Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    const smStream = new SitemapStream({
      hostname: 'https://yourdomain.com',
    });

    // Get all public tables
    const tables = await Table.find({ sharingStatus: 'public' });

    // Add static routes
    smStream.write({ url: '/', changefreq: 'daily', priority: 1 });
    smStream.write({ url: '/tables', changefreq: 'daily', priority: 0.8 });

    // Add table routes
    tables.forEach((table) => {
      smStream.write({
        url: `/t/${table.slug}`,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: table.updatedAt,
      });
    });

    smStream.end();

    const sitemap = await streamToPromise(smStream);

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

export default router;
