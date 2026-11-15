/* Neybor service worker
 *
 * Estratégias:
 * - Navegação (páginas): rede primeiro; sem rede, cai para /offline.html.
 * - Assets estáticos do Next (/_next/static), fontes e ícones: cache primeiro,
 *   porque os nomes já mudam a cada build.
 * - Imagens locais: stale-while-revalidate.
 * - Nada de API, auth ou outra origem passa pelo cache.
 */

const VERSION = 'v3'
const STATIC_CACHE = `neybor-static-${VERSION}`
const PAGES_CACHE = `neybor-pages-${VERSION}`
const OFFLINE_URL = '/offline.html'

const PRECACHE = [
    OFFLINE_URL,
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/fonts/JetBrainsSans.woff2',
]

// Alguns hosts (como o Cloudflare) redirecionam /offline.html para /offline.
// Navegador não aceita resposta "redirecionada" para navegação, então guardamos
// uma cópia limpa da página.
async function cacheOfflinePage(cache) {
    const response = await fetch(OFFLINE_URL, { cache: 'reload' })
    if (!response.ok) throw new Error('offline page unavailable')
    const body = await response.blob()
    await cache.put(
        OFFLINE_URL,
        new Response(body, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
    )
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) =>
                Promise.all([
                    cacheOfflinePage(cache),
                    cache.addAll(PRECACHE.filter((url) => url !== OFFLINE_URL)),
                ]),
            )
            .then(() => self.skipWaiting()),
    )
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter(
                            (key) =>
                                key.startsWith('neybor-') &&
                                key !== STATIC_CACHE &&
                                key !== PAGES_CACHE,
                        )
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    )
})

function isStaticAsset(url) {
    return (
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.startsWith('/fonts/') ||
        url.pathname.startsWith('/icons/')
    )
}

function isImage(url) {
    return (
        url.pathname.startsWith('/images/') ||
        url.pathname.startsWith('/_next/image')
    )
}

async function cacheFirst(request) {
    const cached = await caches.match(request)
    if (cached) return cached
    const response = await fetch(request)
    if (response.ok) {
        const cache = await caches.open(STATIC_CACHE)
        cache.put(request, response.clone())
    }
    return response
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(STATIC_CACHE)
    const cached = await cache.match(request)
    const network = fetch(request)
        .then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
        })
        .catch(() => cached)
    return cached || network
}

async function networkFirstPage(request) {
    try {
        return await fetch(request)
    } catch {
        const offline = await caches.match(OFFLINE_URL)
        return (
            offline ||
            new Response('Sem conexão', {
                status: 503,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            })
        )
    }
}

self.addEventListener('fetch', (event) => {
    const { request } = event
    if (request.method !== 'GET') return

    const url = new URL(request.url)
    if (url.origin !== self.location.origin) return
    if (url.pathname.startsWith('/api/')) return

    if (request.mode === 'navigate') {
        event.respondWith(networkFirstPage(request))
        return
    }

    if (isStaticAsset(url)) {
        event.respondWith(cacheFirst(request))
        return
    }

    if (isImage(url)) {
        event.respondWith(staleWhileRevalidate(request))
    }
})

self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

// ---------- Notificações push ----------

self.addEventListener('push', (event) => {
    let data = {}
    try {
        data = event.data ? event.data.json() : {}
    } catch {
        data = { body: event.data ? event.data.text() : '' }
    }

    const title = data.title || 'Neybor'
    event.waitUntil(
        self.registration.showNotification(title, {
            body: data.body || '',
            icon: '/icons/icon-192.png',
            badge: '/icons/badge-96.png',
            tag: data.tag || undefined,
            renotify: Boolean(data.tag),
            lang: 'pt-BR',
            data: { url: data.url || '/alerts' },
        }),
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const target = new URL(
        (event.notification.data && event.notification.data.url) || '/alerts',
        self.location.origin,
    ).href

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((windows) => {
                for (const client of windows) {
                    if (client.url === target && 'focus' in client) {
                        return client.focus()
                    }
                }
                for (const client of windows) {
                    if ('navigate' in client && 'focus' in client) {
                        return client
                            .navigate(target)
                            .then((c) => c && c.focus())
                    }
                }
                return self.clients.openWindow(target)
            }),
    )
})
