import type { PlasmoMessaging } from "@plasmohq/messaging"
import { db } from "~/background"
import type { Vehicle, RevenueMetrics } from "~types"
import { calculateMonthlyRevenue, calculateAverageMonthlyRevenue, calculatePreviousYearRevenue, calculateUtilizationRate } from "~utils/revenue"


const calculateMetrics = (vehicle: Vehicle): RevenueMetrics | undefined => {
  if (!vehicle.dailyPricing) return undefined

  const monthlyRevenue = calculateMonthlyRevenue(vehicle.dailyPricing, vehicle)
  const averageMonthly = calculateAverageMonthlyRevenue(vehicle.dailyPricing, vehicle)
  const previousYear = calculatePreviousYearRevenue(vehicle.dailyPricing, vehicle)
  
  // Calculate ROI if we have market value and previous year revenue
  let roi: number | undefined
  if (vehicle.details?.marketValue?.below && vehicle.details?.marketValue?.average) {
    const marketValue = (parseFloat(vehicle.details.marketValue.below) + parseFloat(vehicle.details.marketValue.average)) / 2
    
    // Get start of previous year
    const prevYearStart = new Date(new Date().getFullYear() - 1, 0, 1)
    
    // Use listing date if it's later than start of previous year
    const listingDate = vehicle.details?.vehicle?.listingCreatedTime
      ? new Date(vehicle.details.vehicle.listingCreatedTime)
      : null
    
    if (listingDate) {
      const startDate = listingDate > prevYearStart ? listingDate : prevYearStart
      
      // Calculate total revenue since start date
      const totalRevenue = monthlyRevenue.reduce((sum, month) => {
        const monthDate = new Date(month.year, new Date(month.fullMonth + ' 1').getMonth())
        return monthDate.getTime() >= startDate.getTime() ? sum + month.total : sum
      }, 0)

      // Calculate the number of months since start date
      const currentDate = new Date()
      const monthsSinceStart = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)

      // Annualize the revenue
      const annualizedRevenue = (totalRevenue / monthsSinceStart) * 12
      roi = (annualizedRevenue / marketValue) * 100
    }
  }

  // Calculate utilization rate
  const utilizationRate = calculateUtilizationRate(vehicle.dailyPricing, vehicle.details?.vehicle?.listingCreatedTime)

  return {
    monthlyRevenue,
    averageMonthly,
    previousYear,
    roi,
    utilizationRate
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