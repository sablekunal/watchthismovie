import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/private', '/api/auth'], // Hide admin & auth stuff
    },
    sitemap: 'https://watchthismovie.online/sitemap.xml',
  }
}