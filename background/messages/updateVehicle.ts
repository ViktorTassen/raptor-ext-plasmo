import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { db } from "~/background"
import type { Vehicle, RevenueMetrics } from "~types"
import { calculateMonthlyRevenue, calculateAverageMonthlyRevenue, calculatePreviousYearRevenue } from "~utils/revenue"

const storage = new Storage({ area: "local" })

const calculateMetrics = (vehicle: Vehicle): RevenueMetrics | undefined => {
  if (!vehicle.dailyPricing) return undefined

  const monthlyRevenue = calculateMonthlyRevenue(vehicle.dailyPricing, vehicle)
  const averageMonthly = calculateAverageMonthlyRevenue(vehicle.dailyPricing, vehicle)
  const previousYear = calculatePreviousYearRevenue(vehicle.dailyPricing, vehicle)
  
  // Calculate ROI if we have market value and previous year revenue
  let roi: number | undefined
  if (vehicle.details?.marketValue?.below && previousYear > 0) {
    roi = (previousYear / vehicle.details.marketValue.below) * 100
  }

  return {
    monthlyRevenue,
    averageMonthly,
    previousYear,
    roi
  }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const vehicle = req.body as Vehicle
    
    // Calculate metrics before saving
    const metrics = calculateMetrics(vehicle)
    const vehicleWithMetrics = {
      ...vehicle,
      metrics
    }

    await db.vehicles.put(vehicleWithMetrics)
    res.send({ success: true })
  } catch (error) {
    console.error('[Raptor] Error updating vehicle:', error)
    res.send({ success: false, error: error.message })
  }
}

export default handler