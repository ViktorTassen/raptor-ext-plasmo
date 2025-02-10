import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["https://turo.com/*"],
  world: "MAIN",
  run_at: "document_start",
};

const originalFetch = window.fetch;
window.fetch = async function (...args) {
  try {
    const request = args[0];
    const url = request instanceof Request ? request.url : request instanceof URL ? request.href : request;
    const response = await originalFetch(...args);
    
    if ((response && url?.includes('api/v2/search')) || (response && url?.includes('api/search?country'))) {
      const json = await response.clone().json();

      if (json.vehicles) {
        console.log('[Raptor] Intercepted vehicles:', json.vehicles.length);
        // Dispatch a custom event with the vehicles data
        const event = new CustomEvent('vehicles', {
          detail: { vehicles: json.vehicles }
        });
        window.dispatchEvent(event);
      }

      return response;
    } else {
      return response;
    }
  } catch (error) {
    console.error("[Raptor] Error in fetch:", error);
    return originalFetch(...args);
  }
};