import { sendToBackground } from "@plasmohq/messaging"
import type { PlasmoCSConfig } from "plasmo"
 
export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*"]
}

window.addEventListener('vehicles', async (event: CustomEvent) => {
    console.log('[Raptor] Vehicles event received')
    const vehiclesData = event.detail.vehicles

    if (!Array.isArray(vehiclesData)) {
      console.error('[Raptor] Invalid vehicles data received')
      return
    }

    try {
        const response = await sendToBackground({
          name: "vehiclesCache",
          body: {
            vehicles: vehiclesData
          }
        })
      
        console.log('[Raptor] Background script response:', response)
      } catch (error) {
        console.error('[Raptor] Error sending to background:', error)
      }
})