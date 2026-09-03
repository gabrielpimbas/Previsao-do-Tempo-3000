// ============================================================
// SERVICE WORKER - PREVISÃO DO TEMPO 3000
// ============================================================

// Nome do cache.
// Sempre que fizer alterações importantes no Service Worker,
// aumente a versão: v2, v3, v4...
const CACHE_NAME = "clima-3000-v2";

// ============================================================
// ARQUIVOS QUE SERÃO GUARDADOS NO CACHE
// ============================================================

const ARQUIVOS_CACHE = [
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

// ============================================================
// INSTALAÇÃO
// ============================================================

self.addEventListener("install", function (evento) {
  console.log("Instalando Service Worker...");

  evento.waitUntil(
    // Cria/abre o cache.
    caches
      .open(CACHE_NAME)

      .then(function (cache) {
        console.log("Cache aberto:", CACHE_NAME);

        // Guarda os arquivos principais.
        return cache.addAll(ARQUIVOS_CACHE);
      })

      .then(function () {
        console.log("Arquivos armazenados no cache.");

        // Faz o Service Worker novo entrar
        // em funcionamento imediatamente.
        return self.skipWaiting();
      }),
  );
});

// ============================================================
// ATIVAÇÃO
// ============================================================

self.addEventListener("activate", function (evento) {
  console.log("Service Worker ativado.");

  evento.waitUntil(
    caches
      .keys()

      .then(function (nomesCaches) {
        return Promise.all(
          nomesCaches.map(function (nomeCache) {
            // Exclui versões antigas do cache.
            if (nomeCache !== CACHE_NAME) {
              console.log("Removendo cache antigo:", nomeCache);

              return caches.delete(nomeCache);
            }
          }),
        );
      })

      .then(function () {
        // Faz o Service Worker assumir
        // a página imediatamente.
        return self.clients.claim();
      }),
  );
});

// ============================================================
// FETCH
// ============================================================

self.addEventListener("fetch", function (evento) {
  evento.respondWith(
    // Primeiro procura a requisição no cache.
    caches
      .match(evento.request)

      .then(function (respostaCache) {
        // Encontrou no cache.
        if (respostaCache) {
          return respostaCache;
        }

        // Não encontrou no cache:
        // busca normalmente na rede.
        return fetch(evento.request);
      }),
  );
});
