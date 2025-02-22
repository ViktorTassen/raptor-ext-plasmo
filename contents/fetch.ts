import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://turo.com/*"],
  world: "MAIN",
  run_at: "document_end"
}


console.log('fdfdfd')
const originalFetch = window.fetch
window.fetch = async function (...args) {
  try {
    const request = args[0]
    const url = request instanceof Request ? request.url : request instanceof URL ? request.href : request

    const response = await originalFetch(...args)
    
    if ((response && url?.includes('api/v2/search')) || (response && url?.includes('api/search?country'))) {
      const clonedResponse = response.clone()
      const json = await clonedResponse.json()

      if (json.vehicles) {
        console.log('[Raptor] Intercepted vehicles:', json.vehicles.length)
        window.dispatchEvent(new CustomEvent('vehicles', {
          detail: { 
            vehicles: json.vehicles
          }
        }))
      }

      return response
    } else {
      return response
    }
  } catch (error) {
    console.error("[Raptor] Error in fetch:", error)
    return originalFetch(...args)
  }
}