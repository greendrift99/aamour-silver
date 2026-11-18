const cacheName = 'aamou-v8';
const files = ['./','index.html','kids.html','piece.html','style.css','editorial.js','app.js','manifest.webmanifest', ...['pack-hoops','pack-signet','pack-star','pack-dew','pack-landscape','pack-anklet','pack-chain','pack-stud','refraction','little','storybook','little-star','little-anklet','little-stud','hero','her','him','kids','kai','hoops','dew','anklet','chain','stud'].map(name => 'assets/'+name+'.webp'), ...['lotus','icon-192','icon-512'].map(name => 'assets/'+name+'.png')];
self.addEventListener('install', event => event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(files))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('aamou-') && key!==cacheName).map(key => caches.delete(key))))));
self.addEventListener('fetch', event => {
  if (event.request.method!=='GET' || new URL(event.request.url).origin!==location.origin) return;
  event.respondWith(fetch(event.request).catch(async () => {
    const cached = await caches.match(event.request, {ignoreSearch: event.request.mode==='navigate'});
    if (cached) return cached;
    if (event.request.mode==='navigate') return (await caches.match('./')) ?? Response.error();
    return Response.error();
  }));
});
