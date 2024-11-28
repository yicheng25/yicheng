const CACHE_NAME = 'checklist-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/checklist.js',
    '/history.js',
    '/manifest.json',
    '/checklist-before-leaving.html',
    '/checklist-streaming.html',
    '/checklist-leaving-room.html',
    '/history.html',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
}); 