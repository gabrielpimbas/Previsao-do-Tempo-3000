// ============================================================
// SERVICE WORKER - PREVISÃO DO TEMPO 3000
// ============================================================

// ============================================================
// 1. NOME DO CACHE
// ============================================================

// Nome e versão do cache.
//
// Quando fizer alterações importantes nos arquivos
// armazenados pelo Service Worker,
// altere v3 para v4, v5 etc.
const CACHE_NAME = "clima-3000-v3";

// ============================================================
// 2. ARQUIVOS QUE SERÃO SALVOS NO CACHE
// ============================================================

// Esses arquivos serão armazenados no navegador.
//
// Isso permite que a interface principal do site
// continue disponível mesmo sem conexão com a internet.
//
// A consulta do clima ainda precisa da internet,
// pois depende da API Open-Meteo.
const ARQUIVOS_CACHE = [
  "./",

  "./index.html",

  "./style.css",

  "./script.js",

  "./manifest.json",

  "./icons/icon-192.png",

  "./icons/icon-512.png",
];

// ============================================================
// 3. INSTALAÇÃO DO SERVICE WORKER
// ============================================================

// O evento "install" acontece quando
// o Service Worker é instalado.
self.addEventListener("install", function (evento) {
  console.log("Instalando Service Worker...");

  evento.waitUntil(
    // Abre ou cria o cache.
    caches
      .open(CACHE_NAME)

      .then(function (cache) {
        console.log("Cache aberto:", CACHE_NAME);

        // Salva todos os arquivos
        // definidos em ARQUIVOS_CACHE.
        return cache.addAll(ARQUIVOS_CACHE);
      })

      .then(function () {
        console.log("Arquivos armazenados no cache.");

        // Faz o Service Worker novo
        // não ficar esperando uma versão antiga.
        return self.skipWaiting();
      })

      .catch(function (erro) {
        // Se algum arquivo estiver com caminho errado,
        // o erro aparecerá aqui.
        console.error("Erro durante a criação do cache:", erro);
      }),
  );
});

// ============================================================
// 4. ATIVAÇÃO DO SERVICE WORKER
// ============================================================

// O evento "activate" acontece depois
// que o Service Worker foi instalado.
self.addEventListener("activate", function (evento) {
  console.log("Service Worker ativado.");

  evento.waitUntil(
    // Busca todos os caches existentes.
    caches
      .keys()

      .then(function (nomesCaches) {
        return Promise.all(
          nomesCaches.map(function (nomeCache) {
            // Se existir um cache antigo,
            // ele será excluído.
            if (nomeCache !== CACHE_NAME) {
              console.log("Removendo cache antigo:", nomeCache);

              return caches.delete(nomeCache);
            }
          }),
        );
      })

      .then(function () {
        // Faz o Service Worker assumir
        // o controle da página imediatamente.
        return self.clients.claim();
      }),
  );
});

// ============================================================
// 5. INTERCEPTAÇÃO DAS REQUISIÇÕES
// ============================================================

// O evento "fetch" acontece sempre que
// a página solicita algum recurso.
self.addEventListener("fetch", function (evento) {
  // Só vamos tratar requisições GET.
  //
  // Isso evita problemas com outros tipos
  // de requisição.
  if (evento.request.method !== "GET") {
    return;
  }

  evento.respondWith(
    // Primeiro procura o recurso no cache.
    caches
      .match(evento.request)

      .then(function (respostaCache) {
        // Se encontrou no cache,
        // devolve o arquivo salvo.
        if (respostaCache) {
          return respostaCache;
        }

        // Caso não esteja no cache,
        // busca normalmente pela internet.
        return fetch(evento.request);
      }),
  );
});
