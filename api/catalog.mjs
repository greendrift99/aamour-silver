import { fetchCms } from '../lib/cms.mjs';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).end();
  try {
    const upstream = await fetchCms('/api/storefront');
    if (!upstream.ok) throw new Error('CMS status ' + upstream.status);
    const release = await upstream.json();
    if (release.currency !== 'INR' || release.version < 1 || !Array.isArray(release.products)) {
      throw new Error('No INR catalog release');
    }
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=20, stale-if-error=86400');
    return response.status(200).json(release);
  } catch (error) {
    console.warn(error.message);
    return response.status(503).json({error:'Catalog unavailable'});
  }
}
