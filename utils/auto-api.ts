import type { Vehicle } from "~types"
import { sendToBackground } from "@plasmohq/messaging"

export async function fetchMarketValue(vehicle: Vehicle, trim?: string) {
  try {
    const response = await sendToBackground({
      name: "fetchAveragePrice",
      body: {
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        trim: trim ? [trim] : undefined
      }
    })

    if (!response.success) {
      throw new Error(response.error)
    }

    return response
  } catch (error) {
    console.error('[Auto API] Error fetching listings:', error)
    return null
  }
}