import { NextResponse } from 'next/server';
import { 
  fetchAllPublishedToolSlugsAndTimestamps, 
  fetchAllPublishedContentPageSlugsAndTimestamps 
} from '@/app/tools/actions';

export async function GET() {
  try {
    // Get the base URL from environment variable with fallback
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://randomnamefinder.com';
    
    // Fetch data for sitemap
    const [tools, contentPages] = await Promise.all([
      fetchAllPublishedToolSlugsAndTimestamps(),
      fetchAllPublishedContentPageSlugsAndTimestamps()
    ]);

    // Get the most recent tool update for the tools page lastmod
    const mostRecentToolUpdate = tools.length > 0 ? tools[0].updated_at : new Date().toISOString();
    
    // Define static routes with their metadata
    const staticRoutes = [
      {
        path: '',
        priority: '1.0',
        changefreq: 'daily',
        lastmod: new Date().toISOString().split('T')[0] // Today's date
      },
      {
        path: 'tools',
        priority: '0.9',
        changefreq: 'weekly',
        lastmod: mostRecentToolUpdate.split('T')[0] // Most recent tool update
      }
    ];

    // Helper function to format date as YYYY-MM-DD
    const formatDate = (dateString: string) => {
      return dateString.split('T')[0];
    };

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static routes
    staticRoutes.forEach(route => {
      const url = route.path ? `${baseUrl}/${route.path}` : baseUrl;
      sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    });

    // Add content pages (like /about, /contact, /privacy-policy, etc.)
    contentPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${formatDate(page.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // Add tool pages
    tools.forEach(tool => {
      sitemap += `
  <url>
    <loc>${baseUrl}/tools/${tool.slug}</loc>
    <lastmod>${formatDate(tool.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    // Return XML response
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
} 