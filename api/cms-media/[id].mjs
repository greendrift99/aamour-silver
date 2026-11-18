import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fetchCms } from '../../lib/cms.mjs';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).end();
  const {id} = request.query;
  if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/.test(id)) return response.status(404).end();
  try {
    const result = await fetchCms('/media/' + id);
    if (!result.ok) return response.status(result.status === 404 ? 404 : 502).end();
    response.setHeader('Content-Type', result.headers.get('Content-Type') || 'application/octet-stream');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    response.setHeader('Cache-Control', 'public, max-age=300');
    await pipeline(Readable.fromWeb(result.body), response);
  } catch {
    if (!response.headersSent) response.status(502).end();
    else response.destroy();
  }
}
