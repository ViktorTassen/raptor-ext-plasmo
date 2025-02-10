import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import type { PlasmoCSConfig } from "plasmo"
 
export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*"],
}

const storage = new Storage()

window.addEventListener('vehicles', async (event: CustomEvent) => {
    console.log('[Raptor] Vehicles event received');
    const vehiclesData = event.detail.vehicles

    try {
        const response = await sendToBackground({
          name: "vehiclesCache",
          body: {
            vehicles: vehiclesData,
          }
        })
      
        console.log('[Raptor] Background script response:', response);
      } catch (error) {
        console.error('[Raptor] Error sending to background:', error);
      }
})