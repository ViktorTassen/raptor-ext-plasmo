import type { EnrichmentProgress, Vehicle } from "~types"
import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const getRandomDelay = () => {
  // Random delay between 2100ms and 3000ms
  return Math.floor(Math.random() * (3000 - 2100 + 1) + 2100)
}

const formatDate = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

const getStartDate = (): string => {
  const date = new Date()
  date.setMonth(0) // January
  date.setDate(1) // 1st day
  date.setFullYear(date.getFullYear() - 1) // Last year
  return formatDate(date)
}

const getEndDate = (): string => {
  return formatDate(new Date())
}

const getDefaultDates = () => {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(now.getDate() + 7) // 1 week from now
  
  const endDate = new Date(now)
  endDate.setDate(now.getDate() + 14) // 2 weeks from now
  
  return {
    startDate: formatDate(startDate),
    startTime: "10:00",
    endDate: formatDate(endDate),
    endTime: "10:00"
  }
}

async function fetchVehicleDetails(vehicleId: number) {
  const searchParams = await storage.get<{
    startDate: string
    startTime: string
    endDate: string
    endTime: string
  }>("searchParams")

  const defaultDates = getDefaultDates()
  const baseUrl = 'https://turo.com/api/vehicle/detail'
  const params = new URLSearchParams({
    endDate: searchParams?.endDate || defaultDates.endDate,
    endTime: searchParams?.endTime || defaultDates.endTime,
    startDate: searchParams?.startDate || defaultDates.startDate,
    startTime: searchParams?.startTime || defaultDates.startTime,
    vehicleId: vehicleId.toString()
  })

  try {
    const response = await fetch(`${baseUrl}?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Extract only the fields we want to keep
    return {
      badges: data.badges,
      color: data.color,
      hostTakeRate: data.currentVehicleProtection?.hostTakeRate,
      extras: data.extras,
      minimumAgeInYearsToRent: data.minimumAgeInYearsToRent,
      numberOfFavorites: data.numberOfFavorites,
      numberOfRentals: data.numberOfRentals,
      numberOfReviews: data.numberOfReviews,
      owner: {
        id: data.owner?.id,
        name: data.owner?.name,
        allStarHost: data.owner?.allStarHost,
        proHost: data.owner?.proHost,
        imageUrl: data.owner?.image?.originalImageUrl
      },
      instantBookLocationPreferences: data.instantBookLocationPreferences,
      rate: {
        airportDeliveryLocationsAndFees: data.rate?.airportDeliveryLocationsAndFees,
        dailyDistance: data.rate?.dailyDistance,
        excessFeePerDistance: data.rate?.excessFeePerDistance,
        monthlyDiscountPercentage: data.rate?.monthlyDiscountPercentage,
        monthlyDistance: data.rate?.monthlyDistance,
        monthlyMileage: data.rate?.monthlyMileage,
        weeklyDiscountPercentage: data.rate?.weeklyDiscountPercentage,
        weeklyDistance: data.rate?.weeklyDistance
      },
      ratings: data.ratings,
      tripCount: data.tripCount,
      vehicle: {
        automaticTransmission: data.vehicle?.automaticTransmission,
        listingCreatedTime: data.vehicle?.listingCreatedTime,
        trim: data.vehicle?.trim,
        url: data.vehicle?.url
      }
    }
  } catch (error) {
    console.error(`Error fetching vehicle ${vehicleId} details:`, error)
    return null
  }
}

async function fetchVehicleDailyPricing(vehicleId: number) {
  const baseUrl = 'https://turo.com/api/vehicle/daily_pricing'
  const params = new URLSearchParams({
    end: getEndDate(),
    start: getStartDate(),
    vehicleId: vehicleId.toString()
  })

  try {
    const response = await fetch(`${baseUrl}?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Filter and transform the daily pricing data
    if (data.dailyPricingResponses) {
      const responses = data.dailyPricingResponses
      const result = []

      for (let i = 0; i < responses.length; i++) {
        const currentDay = responses[i]
        const nextDay = responses[i + 1]

        // Include if day is unavailable OR if next day exists and is unavailable
        if (currentDay.wholeDayUnavailable || (nextDay && nextDay.wholeDayUnavailable)) {
          result.push({
            date: currentDay.date,
            price: currentDay.price,
            custom: currentDay.custom,
            wholeDayUnavailable: currentDay.wholeDayUnavailable
          })
        }
      }

      return result
    }
    return null
  } catch (error) {
    console.error(`Error fetching vehicle ${vehicleId} daily pricing:`, error)
    return null
  }
}

export async function enrichVehicles(
  vehicles: Vehicle[],
  onProgress: (progress: EnrichmentProgress) => void,
  signal: AbortSignal
): Promise<Vehicle[]> {
  const results: Vehicle[] = []
  
  for (let i = 0; i < vehicles.length; i++) {
    // Check if enrichment should be stopped
    if (signal.aborted) {
      console.log('[Raptor] Enrichment stopped by user')
      break
    }

    try {
      const vehicle = vehicles[i]
      const details = await fetchVehicleDetails(vehicle.id)
      const dailyPricing = await fetchVehicleDailyPricing(vehicle.id)
      
      // Only add vehicle if both details and pricing were fetched successfully
      if (details && dailyPricing) {
        results.push({
          ...vehicle,
          details,
          dailyPricing,
          isEnriched: true
        })
      } else {
        console.log(`[Raptor] Skipping vehicle ${vehicle.id} due to missing data`)
      }
    } catch (error) {
      console.error(`[Raptor] Error enriching vehicle at index ${i}:`, error)
      // Skip this vehicle and continue with the next one
    }
    
    onProgress({
      current: i + 1,
      total: vehicles.length,
      isProcessing: true
    })
    
    await delay(getRandomDelay()) // Random delay between requests
  }
  
  onProgress({
    current: vehicles.length,
    total: vehicles.length,
    isProcessing: false
  })
  
  return results
}