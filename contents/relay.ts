import { sendToBackground } from "@plasmohq/messaging"
import type { PlasmoCSConfig } from "plasmo"
import type { Vehicle } from "~types"
 
export const config: PlasmoCSConfig = {
    matches: ["https://turo.com/*"],
}

window.addEventListener('vehicles', async (event: CustomEvent) => {
    console.log('[Raptor] Vehicles event received')
    const rawVehicles = event.detail.vehicles

    // Transform the data to keep only required fields
    const vehicles: Vehicle[] = rawVehicles.map(v => ({
      id: v.id,
      avgDailyPrice: v.avgDailyPrice,
      completedTrips: v.completedTrips,
      hostId: v.hostId,
      images: v.images.map(img => ({
        resizeableUrlTemplate: img.resizeableUrlTemplate
      })),
      isAllStarHost: v.isAllStarHost,
      isNewListing: v.isNewListing,
      location: {
        city: v.location.city,
        country: v.location.country,
        state: v.location.state,
        homeLocation: v.location.homeLocation
      },
      make: v.make,
      model: v.model,
      rating: v.rating,
      tags: v.tags,
      type: v.type,
      year: v.year
    }))

    try {
        const response = await sendToBackground({
          name: "vehiclesCache",
          body: {
            vehicles
          }
        })
      
        console.log('[Raptor] Background script response:', response)
      } catch (error) {
        console.error('[Raptor] Error sending to background:', error)
      }
})