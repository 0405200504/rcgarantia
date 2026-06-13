const CACHE = 'rc-garantia-v1';
const SHELL = ['/login', '/consulta', '/icons/icon.svg', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Sempre rede para rotas de API e páginas dinâmicas do painel
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/garantias') || url.pathname.startsWith('/configuracoes')) {
    e.respondWith(fetch(e.request).catch(() => new Response('Offline', { status: 503 })));
    return;
  }

  // Cache-first para assets estáticos
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
      if (res.ok && url.origin === self.location.origin) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
