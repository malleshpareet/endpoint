import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://httply.qzz.io';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        // Explicitly allow and welcome AI crawlers for AEO (AI Engine Optimization)
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'cohere-ai', 'OAI-SearchBot'],
        allow: '/',
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
