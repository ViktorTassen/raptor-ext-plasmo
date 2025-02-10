import { sendToBackground } from "@plasmohq/messaging";
import type { PlasmoCSConfig } from "plasmo"
 
export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*"],
}


window.addEventListener('vehicles', async (event: CustomEvent) => {
    const vehiclesData = event.detail.vehicles;
    // Send data to the background script
    const response = await sendToBackground({
      name: "vehiclesCache",
      body: {
        vehicles: vehiclesData
      }
    });
  
    console.log('Background script response:', response);
  });