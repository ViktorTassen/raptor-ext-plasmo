import type { Vehicle } from "~types"
import { calculateAverageMonthlyRevenue, calculateMonthlyRevenue, calculatePreviousYearRevenue, calculateUtilizationRate } from "./revenue"
import { getVehicleTypeDisplay } from "./vehicleTypes"
import { getCurrencySymbol } from "./currency"

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

      return `"${String(cellValue || '').replace(/"/g, '""')}"`
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
    includeDiscounts ? "DiscountsApplied" : "",
    applyProtectionPlan ? "ProtectionPlanApplied" : ""
  ].filter(Boolean).join(", ")

  // Create a set of all possible month columns
  const allMonths = new Set<string>()
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Generate all month columns for the last 12 months
  for (let i = 1; i <= 12; i++) {
    let month = currentMonth - i
    let year = currentYear
    
    if (month < 0) {
      month += 12
      year--
    }
    
    const d = new Date(year, month)
    const monthColumn = `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`
    allMonths.add(monthColumn)
  }

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

    // Get currency symbol
    const currency = vehicle.avgDailyPrice?.currency || 'USD'
    const currencySymbol = getCurrencySymbol(currency)

    // Get monthly revenue data
    const monthlyRevenue = vehicle.dailyPricing 
      ? calculateMonthlyRevenue(vehicle.dailyPricing, vehicle, includeDiscounts, applyProtectionPlan)
      : []

    // Create a base object with all the standard fields
    const baseData = {
      "Type": getVehicleTypeDisplay(vehicle.type),
      "Make": vehicle.make,
      "Model": vehicle.model,
      "Trim": vehicle.details?.vehicle?.trim || '',
      "Year": vehicle.year,
      "Avg Monthly Revenue": !vehicle.dailyPricing ? '' : `${currencySymbol}${calculateAverageMonthlyRevenue(vehicle.dailyPricing, vehicle, includeDiscounts, applyProtectionPlan)}`,
      "Previous Year Revenue": !vehicle.dailyPricing ? '' : `${currencySymbol}${calculatePreviousYearRevenue(vehicle.dailyPricing, vehicle, includeDiscounts, applyProtectionPlan)}`,
      "ROI": roi ? `${roi.toFixed(1)}%` : '',
      "Utilization Rate": `${utilizationRate.toFixed(1)}%`,
      "Revenue Settings": settingsInfo || '-',
      "Avg Daily Price": vehicle.avgDailyPrice ? `${currencySymbol}${vehicle.avgDailyPrice.amount}` : '',
      "Market Value": vehicle.details?.marketValue ? `${currencySymbol}${vehicle.details.marketValue}` : '',
      "Days on Turo": vehicle.details?.vehicle?.listingCreatedTime ? Math.ceil(
        Math.abs(new Date().getTime() - new Date(vehicle.details.vehicle.listingCreatedTime).getTime()) / 
        (1000 * 60 * 60 * 24)
      ) : '',
      "Completed Trips": vehicle.completedTrips,
      "Favorites": vehicle.details?.numberOfFavorites || '',
      "Rating": vehicle.rating ? `${vehicle.rating.toFixed(1)}★` : '',
      "Reviews": vehicle.details?.numberOfReviews || '',
      "Instant Book Locations": [
        vehicle.details?.instantBookLocationPreferences?.airportLocationEnabled ? 'Airport' : '',
        vehicle.details?.instantBookLocationPreferences?.customLocationEnabled ? 'Custom Location' : '',
        vehicle.details?.instantBookLocationPreferences?.homeLocationEnabled ? 'Home Location' : '',
        vehicle.details?.instantBookLocationPreferences?.poiLocationEnabled ? 'Points of Interest' : ''
      ].filter(Boolean).join(', '),
      "Host ID": vehicle.hostId,
      "Host Name": vehicle.details?.owner?.name || '',
      "Host Status": [
        vehicle.details?.owner?.allStarHost ? '⭐ All-Star' : '',
        vehicle.details?.owner?.proHost ? 'Pro' : ''
      ].filter(Boolean).join(', '),
      "Protection Plan Rate": vehicle.details?.hostTakeRate ? `${(vehicle.details.hostTakeRate * 100).toFixed(0)}%` : '',
      "Airport Delivery": vehicle.details?.rate?.airportDeliveryLocationsAndFees?.map(loc => 
        `${loc.location.code}(${getCurrencySymbol(loc.feeWithCurrency.currencyCode)}${loc.feeWithCurrency.amount})`
      ).join(', ') || '',
      "Extras": vehicle.details?.extras?.extras?.map(extra => extra.extraType.label).join(', ') || '',
      "Badges": vehicle.details?.badges?.map(badge => badge.label).join(', ') || '',
      "City": vehicle.location.city || '',
      "State": vehicle.location.state || '',
      "Transmission": vehicle.details?.vehicle?.automaticTransmission ? 'Automatic' : 'Manual',
      "Color": vehicle.details?.color || '',
      "Daily Distance": vehicle.details?.rate?.dailyDistance ? `${vehicle.details.rate.dailyDistance.scalar} ${vehicle.details.rate.dailyDistance.unit.toLowerCase()}` : '',
      "Weekly Distance": vehicle.details?.rate?.weeklyDistance ? `${vehicle.details.rate.weeklyDistance.scalar} ${vehicle.details.rate.weeklyDistance.unit.toLowerCase()}` : '',
      "Monthly Distance": vehicle.details?.rate?.monthlyDistance ? `${vehicle.details.rate.monthlyDistance.scalar} ${vehicle.details.rate.monthlyDistance.unit.toLowerCase()}` : '',
      "Excess Fee": vehicle.details?.rate?.excessFeePerDistance ? `${currencySymbol}${vehicle.details.rate.excessFeePerDistance.amount}` : '',
      "Weekly Discount": vehicle.details?.rate?.weeklyDiscountPercentage ? `${vehicle.details.rate.weeklyDiscountPercentage}%` : '',
      "Monthly Discount": vehicle.details?.rate?.monthlyDiscountPercentage ? `${vehicle.details.rate.monthlyDiscountPercentage}%` : '',
      "Listing Date": vehicle.details?.vehicle?.listingCreatedTime ? new Date(vehicle.details.vehicle.listingCreatedTime).toLocaleDateString() : '',
      "Vehicle ID": vehicle.id,
      "Image URL": vehicle.images?.[0]?.resizeableUrlTemplate?.replace('{width}x{height}', '800x600') || '',
      "Listing URL": vehicle.details?.vehicle?.url || ''
    }

    // Initialize all month columns with empty strings
    const monthlyData = Array.from(allMonths).reduce((acc, month) => {
      acc[month] = ''
      return acc
    }, {} as Record<string, string>)

    // Fill in the months that have revenue
    monthlyRevenue.forEach(month => {
      const monthKey = `${month.name} ${month.year}`
      if (allMonths.has(monthKey)) {
        monthlyData[monthKey] = month.total > 0 ? `${currencySymbol}${month.total}` : ''
      }
    })

    return {
      ...baseData,
      ...monthlyData
    }
  })

  downloadCSV(exportData, `vehicles-export-${new Date().toISOString().split('T')[0]}.csv`)
}