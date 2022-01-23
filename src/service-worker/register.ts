const SERVICE_WORKER_PATH = "/service-worker.js";

export function register() {
  if ("serviceWorker" in window.navigator) {
    window.addEventListener("load", async () => {
      const registration = await window.navigator.serviceWorker.register(
        SERVICE_WORKER_PATH
      );
      console.debug("service worker registration success", registration);
    });
  }
}
