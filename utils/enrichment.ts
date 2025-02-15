import { Storage } from "@plasmohq/storage"
import type { Vehicle, MarketValue, VehicleDetails, DailyPricing, VehiclePrice } from "~types"

const storage = new Storage({ area: "local" })

let lastTuroApiCallTime: number | null = null
let lastEnrichmentTime: number | null = null

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const getRandomDelay = () => {
  return Math.floor(Math.random() * (3000 - 2100 + 1) + 100)
}

const waitForTuroApiDelay = async () => {
  if (lastTuroApiCallTime) {
    const currentTime = Date.now()
    const timeSinceLastCall = currentTime - lastTuroApiCallTime
    const minDelay = 2100
    
    if (timeSinceLastCall < minDelay) {
      const waitTime = minDelay - timeSinceLastCall
      console.log(`[Raptor] Waiting ${waitTime}ms before next Turo API call`)
      await delay(waitTime)
    }
  }
  lastTuroApiCallTime = Date.now()
}

const formatDate = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

const getStartDate = (): string => {
  const date = new Date()
  date.setMonth(0)
  date.setDate(1)
  date.setFullYear(date.getFullYear() - 1)
  return formatDate(date)
}

const getEndDate = (): string => {
  return formatDate(new Date())
}

const getDefaultDates = () => {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(now.getDate() + 7)
  
  const endDate = new Date(now)
  endDate.setDate(now.getDate() + 14)
  
  return {
    startDate: formatDate(startDate),
    startTime: "10:00",
    endDate: formatDate(endDate),
    endTime: "10:00"
  }
}

const calculateAverageDailyPrice = (dailyPricing: DailyPricing[]): VehiclePrice => {
  const busyDays = dailyPricing.filter(day => day.wholeDayUnavailable)
  if (busyDays.length === 0) return { amount: 0, currency: "USD" }
  
  const totalPrice = busyDays.reduce((sum, day) => sum + day.priceWithCurrency.amount, 0)
  return {
    amount: Math.round(totalPrice / busyDays.length),
    currency: busyDays[0].priceWithCurrency.currency
  }
}

async function fetchMarketValue(vehicle: Vehicle, trim?: string): Promise<MarketValue | null> {
  try {
    const id = [
      vehicle.year,
      vehicle.make.toLowerCase().replace(/\s/g, '_'),
      vehicle.model.toLowerCase().replace(/\s/g, '_').replace(/-/g, ''),
      (trim || '').toLowerCase().replace(/\s/g, '_').replace(/-/g, '')
    ].filter(Boolean).join('_')

    const url = `https://marketvalues.vinaudit.com/getmarketvalue.php?key=1HB7ICF9L0GVH5Q&id=${id}`
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.success && data.prices) {
      return {
        below: data.prices.below.toFixed(0),
        average: data.prices.average.toFixed(0),
        above: data.prices.above.toFixed(0)
      }
    }
    return null
  } catch (error) {
    console.error('[Raptor] Error fetching market value:', error)
    return null
  }
}

async function fetchVehicleDetails(vehicleId: number): Promise<VehicleDetails | null> {
  await waitForTuroApiDelay()
  
  // Get search params from storage
  const searchParams = await storage.get("searchParams") as any
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
    console.log(`[Raptor] Fetching details for vehicle ${vehicleId}`)
    const response = await fetch(`${baseUrl}?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    const processDistance = (distance: any) => {
      if (distance?.unlimited) {
        return {
          scalar: distance.type === 'DAILY' ? 999 : 9999,
          unit: distance.unit || 'MI'
        }
      }
      return distance
    }

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
        dailyDistance: processDistance({ ...data.rate?.dailyDistance, type: 'DAILY' }),
        excessFeePerDistance: data.rate?.excessFeePerDistance,
        monthlyDiscountPercentage: data.rate?.monthlyDiscountPercentage,
        monthlyDistance: processDistance({ ...data.rate?.monthlyDistance, type: 'MONTHLY' }),
        monthlyMileage: data.rate?.monthlyMileage,
        weeklyDiscountPercentage: data.rate?.weeklyDiscountPercentage,
        weeklyDistance: processDistance({ ...data.rate?.weeklyDistance, type: 'WEEKLY' })
      },
      tripCount: data.tripCount,
      vehicle: {
        automaticTransmission: data.vehicle?.automaticTransmission,
        listingCreatedTime: data.vehicle?.listingCreatedTime,
        trim: data.vehicle?.trim,
        url: data.vehicle?.url
      },
      marketValue: undefined
    }
  } catch (error) {
    console.error(`Error fetching vehicle ${vehicleId} details:`, error)
    return null
  }
}

async function fetchVehicleDailyPricing(vehicleId: number) {
  await waitForTuroApiDelay()
  
  const baseUrl = 'https://turo.com/api/vehicle/daily_pricing'
  const params = new URLSearchParams({
    end: getEndDate(),
    start: getStartDate(),
    vehicleId: vehicleId.toString()
  })

  try {
    console.log(`[Raptor] Fetching daily pricing for vehicle ${vehicleId}`)
    const response = await fetch(`${baseUrl}?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    if (data.dailyPricingResponses) {
      return data.dailyPricingResponses.map(day => ({
        date: day.date,
        priceWithCurrency: {
          amount: day.priceWithCurrency.amount,
          currency: day.priceWithCurrency.currencyCode
        },
        custom: day.custom,
        wholeDayUnavailable: day.wholeDayUnavailable
      }))
    }
    return null
  } catch (error) {
    console.error(`Error fetching vehicle ${vehicleId} daily pricing:`, error)
    return null
  }
}

export async function enrichVehicle(
  vehicle: Vehicle,
  signal: AbortSignal
): Promise<Vehicle | null> {
  try {
    if (signal.aborted) {
      return null
    }

    const currentTime = Date.now()
    if (lastEnrichmentTime) {
      const timeSinceLastEnrichment = currentTime - lastEnrichmentTime
      console.log(`[Raptor] Starting enrichment for vehicle ${vehicle.id} (${timeSinceLastEnrichment}ms since last enrichment)`)
    } else {
      console.log(`[Raptor] Starting enrichment for vehicle ${vehicle.id} (first enrichment)`)
    }

    const details = await fetchVehicleDetails(vehicle.id)
    const dailyPricing = await fetchVehicleDailyPricing(vehicle.id)
    
    if (details) {
      const marketValue = await fetchMarketValue(vehicle, details.vehicle.trim)
      if (marketValue) {
        details.marketValue = marketValue
      }
    }
    
    if (details && dailyPricing) {
      const avgDailyPrice = calculateAverageDailyPrice(dailyPricing)
      const enrichedVehicle = {
        ...vehicle,
        details,
        dailyPricing,
        avgDailyPrice,
        isEnriched: true
      }

      const completionTime = Date.now()
      const enrichmentDuration = completionTime - currentTime
      console.log(`[Raptor] Completed enrichment for vehicle ${vehicle.id} (took ${enrichmentDuration}ms)`)
      
      lastEnrichmentTime = completionTime
      return enrichedVehicle
    }
    
    return null
  } catch (error) {
    console.error(`[Raptor] Error enriching vehicle ${vehicle.id}:`, error)
    return null
  } finally {
    await delay(getRandomDelay())
  }
}