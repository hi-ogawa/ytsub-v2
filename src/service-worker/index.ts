/// <reference lib="webworker" />

function main(this: ServiceWorkerGlobalScope) {
  this.addEventListener("fetch", (event: FetchEvent) => {
    event.respondWith(fetch(event.request));
  });
}

// Workaround "dom" global scope
main.apply(self as unknown as ServiceWorkerGlobalScope);
