import type { DailyPricing, Vehicle } from "~types"

function applyDiscounts(days: DailyPricing[], vehicle: Vehicle | undefined): number {
  if (!vehicle?.details?.rate) return 0

  const { weeklyDiscountPercentage, monthlyDiscountPercentage } = vehicle.details.rate
  const totalDays = days.length

  if ((!weeklyDiscountPercentage && !monthlyDiscountPercentage) || totalDays < 7) {
    return days.reduce((sum, day) => sum + day.priceWithCurrency.amount, 0)
  }

  const totalPrice = days.reduce((sum, day) => sum + day.priceWithCurrency.amount, 0)
  
  if (monthlyDiscountPercentage && totalDays >= 31) {
    return totalPrice * (1 - monthlyDiscountPercentage / 100)
  }
  
  if (weeklyDiscountPercentage && totalDays >= 7) {
    return totalPrice * (1 - weeklyDiscountPercentage / 100)
  }

  return totalPrice
}

function getMonthKey(date: string): string {
  return date.substring(0, 7)
}

function initializeMonths(currency: string = 'USD'): { [key: string]: { total: number; currency: string } } {
  const months: { [key: string]: { total: number; currency: string } } = {}
  const today = new Date()
  
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i)
    const monthKey = d.toISOString().substring(0, 7)
    months[monthKey] = { total: 0, currency }
  }
  
  return months
}

export const calculateUtilizationRate = (pricing: DailyPricing[] | undefined, listingDate?: string): number => {
  if (!Array.isArray(pricing) || pricing.length === 0) return 0
  
  // Get start of previous year
  const prevYearStart = new Date(new Date().getFullYear() - 1, 0, 1)
  
  // Use listing date if it's later than start of previous year
  let startDate = prevYearStart
  if (listingDate) {
    const listingDateTime = new Date(listingDate)
    if (listingDateTime > prevYearStart) {
      startDate = listingDateTime
    }
  }

  // Filter pricing to only include dates after start date
  const relevantPricing = pricing.filter(day => new Date(day.date) >= startDate)
  
  if (relevantPricing.length === 0) return 0
  
  const busyDays = relevantPricing.filter(day => day.wholeDayUnavailable).length
  return (busyDays / relevantPricing.length) * 100
}

export const calculateMonthlyRevenue = (
  pricing: DailyPricing[] | undefined, 
  vehicle?: Vehicle,
  includeDiscounts: boolean = false,
  applyProtectionPlan: boolean = false
) => {
  if (!Array.isArray(pricing) || pricing.length === 0) {
    const months = []
    const today = new Date()
    
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i)
      months.push({
        name: d.toLocaleString('en-US', { month: 'short' }),
        fullMonth: d.toLocaleString('en-US', { month: 'long' }),
        year: d.getFullYear(),
        total: 0,
        currency: 'USD'
      })
    }
    
    return months.reverse()
  }

  // Find the first valid pricing entry with currency information
  const firstValidPricing = pricing.find(p => p?.priceWithCurrency?.currency)
  if (!firstValidPricing) {
    console.error('[Raptor] No valid pricing data found with currency information')
    return calculateMonthlyRevenue(undefined)
  }

  // Get start of previous year
  const prevYearStart = new Date(new Date().getFullYear() - 1, 0, 1)
  
  // Use listing date if it's later than start of previous year
  let startDate = prevYearStart
  if (vehicle?.details?.vehicle?.listingCreatedTime) {
    const listingDateTime = new Date(vehicle.details.vehicle.listingCreatedTime)
    if (listingDateTime > prevYearStart) {
      startDate = listingDateTime
    }
  }

  // Filter pricing data to only include dates after start date
  const relevantPricing = pricing
    .filter(p => p?.priceWithCurrency)
    .filter(day => new Date(day.date) >= startDate)

  if (relevantPricing.length === 0) {
    return calculateMonthlyRevenue(undefined)
  }

  const months = initializeMonths(firstValidPricing.priceWithCurrency.currency)
  const bookings: { start: number; end: number; days: DailyPricing[] }[] = []
  let currentBooking: DailyPricing[] = []
  
  // First pass: identify bookings
  for (let i = 0; i < relevantPricing.length; i++) {
    const day = relevantPricing[i]
    if (!day?.priceWithCurrency) continue
    
    if (day.wholeDayUnavailable) {
      if (currentBooking.length === 0 && i > 0 && !relevantPricing[i - 1]?.wholeDayUnavailable) {
        const prevDay = relevantPricing[i - 1]
        if (prevDay?.priceWithCurrency) {
          currentBooking.push(prevDay)
        }
      }
      currentBooking.push(day)
      
      if (i === relevantPricing.length - 1 || !relevantPricing[i + 1]?.wholeDayUnavailable) {
        if (currentBooking.length > 0) {
          const booking = {
            start: currentBooking[0].date.substring(8, 10) as unknown as number,
            end: currentBooking[currentBooking.length - 1].date.substring(8, 10) as unknown as number,
            days: currentBooking
          }
          bookings.push(booking)
          currentBooking = []
        }
      }
    }
  }

  // Second pass: calculate revenue for each booking
  for (const booking of bookings) {
    let revenue = includeDiscounts 
      ? applyDiscounts(booking.days, vehicle)
      : booking.days.reduce((sum, day) => sum + day.priceWithCurrency.amount, 0)
    
    // Apply protection plan rate if enabled
    if (applyProtectionPlan && vehicle?.details?.hostTakeRate) {
      revenue *= vehicle.details.hostTakeRate
    }
    
    const startMonth = getMonthKey(booking.days[0].date)
    
    if (booking.days.length === 1 || getMonthKey(booking.days[0].date) === getMonthKey(booking.days[booking.days.length - 1].date)) {
      // Single month booking
      if (months[startMonth]) {
        months[startMonth].total += revenue
      }
    } else {
      // Multi-month booking
      const dailyRate = revenue / booking.days.length
      const monthRevenue = new Map<string, number>()
      
      for (const day of booking.days) {
        const monthKey = getMonthKey(day.date)
        monthRevenue.set(monthKey, (monthRevenue.get(monthKey) || 0) + dailyRate)
      }
      
      for (const [monthKey, monthTotal] of monthRevenue) {
        if (months[monthKey]) {
          months[monthKey].total += monthTotal
        }
      }
    }
  }

  return Object.entries(months)
    .map(([month, { total, currency }]) => {
      const [year, monthIndex] = month.split('-')
      return {
        name: new Date(parseInt(year), parseInt(monthIndex) - 1).toLocaleString('en-US', { month: 'short' }),
        fullMonth: new Date(parseInt(year), parseInt(monthIndex) - 1).toLocaleString('en-US', { month: 'long' }),
        year: parseInt(year),
        total: Math.round(total),
        currency
      }
    })
    .sort((a, b) => (a.year - b.year) || (new Date(a.fullMonth + ' 1').getMonth() - new Date(b.fullMonth + ' 1').getMonth()))
}

export const calculateAverageMonthlyRevenue = (
  pricing: DailyPricing[] | undefined, 
  vehicle?: Vehicle, 
  includeDiscounts: boolean = false,
  applyProtectionPlan: boolean = false
) => {
  if (!Array.isArray(pricing)) return 0
  
  const data = calculateMonthlyRevenue(pricing, vehicle, includeDiscounts, applyProtectionPlan)
  const nonZeroMonths = data.filter(month => month.total > 0)
  return nonZeroMonths.length > 0 
    ? Math.round(nonZeroMonths.reduce((sum, month) => sum + month.total, 0) / nonZeroMonths.length)
    : 0
}

export const calculatePreviousYearRevenue = (
  pricing: DailyPricing[] | undefined, 
  vehicle?: Vehicle, 
  includeDiscounts: boolean = false,
  applyProtectionPlan: boolean = false
) => {
  if (!Array.isArray(pricing)) return 0
  
  const data = calculateMonthlyRevenue(pricing, vehicle, includeDiscounts, applyProtectionPlan)
  const lastYear = new Date().getFullYear() - 1
  return data
    .filter(month => month.year === lastYear)
    .reduce((sum, month) => sum + month.total, 0)
}