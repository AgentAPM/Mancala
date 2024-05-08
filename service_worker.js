const cacheName="cache-v0.1";
const resourcesToPrecache=[
	'/',
	'index.html',
	'game.js',
	'style.css',
	'icon256.png',
]

self.addEventListener("install",evt=>{
	console.log("Install event!")
	evt.waitUntil(
		caches.open(cacheName)
		.then(cache=>{
			return cache.addAll(resourcesToPrecache);
		})
	);
})

self.addEventListener("activate",evt=>{
	console.log("Activate event!")
})
self.addEventListener("fetch",evt=>{
	console.log("Fetch for ",evt.reqest.url)
	evt.respondWith(
		caches.match(evt.request)
		.then(cachedResponse=>{
			return cachedResponse || fetch(evt.request)
		})
	)
})