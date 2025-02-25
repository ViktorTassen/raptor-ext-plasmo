import type { Vehicle } from "~types"
import { calculateAverageMonthlyRevenue, calculateMonthlyRevenue, calculatePreviousYearRevenue, calculateUtilizationRate } from "./revenue"
import { getVehicleTypeDisplay } from "./vehicleTypes"

export function downloadCSV<T extends Record<string, any>>(data: T[], filename: string) {
  const keys = Array.from(
    new Set(
      data.reduce<string[]>((acc, obj) => {
        return acc.concat(Object.keys(obj))
      }, [])
    )
  )

  const header = keys.join(",")
  const rows = data.map(obj => {
    return keys.map(key => {
      const value = obj[key]
      const cellValue = typeof value === "object" && value !== null
        ? JSON.stringify(value).replace(/"/g, '""')
        : value

      return `"${String(cellValue).replace(/"/g, '""')}"`
    }).join(",")
  })

  const csv = [header, ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function exportVehiclesData(vehicles: Vehicle[], includeDiscounts: boolean = false, applyProtectionPlan: boolean = false) {
  const settingsInfo = [
    includeDiscounts ? "Weekly/Monthly Discounts Applied" : "",
    applyProtectionPlan ? "Protection Plan Rate Applied" : ""
  ].filter(Boolean).join(", ")

  const exportData = vehicles.map(vehicle => {
    // Calculate ROI
    let roi: number | undefined
    if (vehicle.details?.marketValue && vehicle.dailyPricing) {
      // Get start of previous year
      const prevYearStart = new Date(new Date().getFullYear() - 1, 0, 1)
      
      // Use listing date if it's later than start of previous year
      const listingDate = vehicle.details?.vehicle?.listingCreatedTime
        ? new Date(vehicle.details.vehicle.listingCreatedTime)
        : null
      
      if (listingDate) {
        const startDate = listingDate > prevYearStart ? listingDate : prevYearStart
        
        // Calculate total revenue since start date
        const monthlyRevenue = calculateMonthlyRevenue(vehicle.dailyPricing, vehicle, includeDiscounts, applyProtectionPlan)
        const totalRevenue = monthlyRevenue.reduce((sum, month) => {
          const monthDate = new Date(month.year, new Date(month.fullMonth + ' 1').getMonth())
          return monthDate.getTime() >= startDate.getTime() ? sum + month.total : sum
        }, 0)

        // Calculate the number of months since start date
        const currentDate = new Date()
        const monthsSinceStart = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)

        // Annualize the revenue
        const annualizedRevenue = (totalRevenue / monthsSinceStart) * 12
        roi = (annualizedRevenue / vehicle.details.marketValue) * 100
      }
    }

    // Calculate utilization rate
    const utilizationRate = calculateUtilizationRate(vehicle.dailyPricing, vehicle.details?.vehicle?.listingCreatedTime)

    return {
      type: getVehicleTypeDisplay(vehicle.type),
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.details?.vehicle?.trim || '',
      year: vehicle.year,
      avgMonthlyRevenue: !vehicle.dailyPricing ? 0 : calculateAverageMonthlyRevenue(vehicle.dailyPricing, vehicle, includeDiscounts, applyProtectionPlan),
      prevYearRevenue: !vehicle.dailyPricing ? 0 : calculatePreviousYearRevenue(vehicle.dailyPricing, vehicle, includeDiscounts, applyProtectionPlan),
      roi: roi ? `${roi.toFixed(1)}%` : '',
      utilizationRate: `${utilizationRate.toFixed(1)}%`,
      revenueSettings: settingsInfo || 'No adjustments applied',
      marketValue: vehicle.details?.marketValue || '',
      daysOnTuro: vehicle.details?.vehicle?.listingCreatedTime ? Math.ceil(
        Math.abs(new Date().getTime() - new Date(vehicle.details.vehicle.listingCreatedTime).getTime()) / 
        (1000 * 60 * 60 * 24)
      ) : '',
      completedTrips: vehicle.completedTrips,
      favorites: vehicle.details?.numberOfFavorites || '',
      rating: vehicle.rating || '',
      reviews: vehicle.details?.numberOfReviews || '',
      hostId: vehicle.hostId,
      hostName: vehicle.details?.owner?.name || '',
      isAllStarHost: vehicle.details?.owner?.allStarHost || false,
      isProHost: vehicle.details?.owner?.proHost || false,
      protectionPlan: vehicle.details?.hostTakeRate ? `${(vehicle.details.hostTakeRate * 100).toFixed(0)}%` : '',
      city: vehicle.location.city || '',
      state: vehicle.location.state || '',
      transmission: vehicle.details?.vehicle?.automaticTransmission ? 'Automatic' : 'Manual',
      color: vehicle.details?.color || '',
      weeklyDiscount: vehicle.details?.rate?.weeklyDiscountPercentage ? `${vehicle.details.rate.weeklyDiscountPercentage}%` : '',
      monthlyDiscount: vehicle.details?.rate?.monthlyDiscountPercentage ? `${vehicle.details.rate.monthlyDiscountPercentage}%` : '',
      dailyDistance: vehicle.details?.rate?.dailyDistance ? `${vehicle.details.rate.dailyDistance.scalar}` : '',
      weeklyDistance: vehicle.details?.rate?.weeklyDistance ? `${vehicle.details.rate.weeklyDistance.scalar}` : '',
      monthlyDistance: vehicle.details?.rate?.monthlyDistance ? `${vehicle.details.rate.monthlyDistance.scalar}` : '',
      excessFee: vehicle.details?.rate?.excessFeePerDistance ? `${vehicle.details.rate.excessFeePerDistance.amount}` : '',
      listingDate: vehicle.details?.vehicle?.listingCreatedTime ? new Date(vehicle.details.vehicle.listingCreatedTime).toLocaleDateString() : '',
      vehicleId: vehicle.id,
      listingUrl: vehicle.details?.vehicle?.url || ''
    }
  })

  downloadCSV(exportData, `vehicles-export-${new Date().toISOString().split('T')[0]}.csv`)
}