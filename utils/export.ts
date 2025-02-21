import type { Vehicle } from "~types"
import { getCurrencySymbol } from "./currency"
import { calculateAverageMonthlyRevenue, calculatePreviousYearRevenue } from "./revenue"
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

  const exportData = vehicles.map(vehicle => ({
    type: getVehicleTypeDisplay(vehicle.type),
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.details?.vehicle?.trim || '',
    year: vehicle.year,
    avgMonthlyRevenue: !vehicle.dailyPricing ? 0 : calculateAverageMonthlyRevenue(vehicle.dailyPricing, vehicle, includeDiscounts, applyProtectionPlan),
    prevYearRevenue: !vehicle.dailyPricing ? 0 : calculatePreviousYearRevenue(vehicle.dailyPricing, vehicle, includeDiscounts, applyProtectionPlan),
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
  }))

  downloadCSV(exportData, `vehicles-export-${new Date().toISOString().split('T')[0]}.csv`)
}