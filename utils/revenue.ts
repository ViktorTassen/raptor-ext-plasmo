import type { DailyPricing, Vehicle } from "~types"

function applyDiscounts(days: DailyPricing[], vehicle: Vehicle | undefined): number {
  if (!vehicle?.details?.rate) return 0

  const { weeklyDiscountPercentage, monthlyDiscountPercentage } = vehicle.details.rate
  const totalDays = days.length

  // No discounts available or days less than a week
  if ((!weeklyDiscountPercentage && !monthlyDiscountPercentage) || totalDays < 7) {
    return days.reduce((sum, day) => sum + day.priceWithCurrency.amount, 0)
  }

  let totalPrice = days.reduce((sum, day) => sum + day.priceWithCurrency.amount, 0)
  
  // Apply monthly discount if available and booking is 31 days or more
  if (monthlyDiscountPercentage && totalDays >= 31) {
    return totalPrice * (1 - monthlyDiscountPercentage / 100)
  }
  
  // Apply weekly discount if available and booking is 7 days or more
  if (weeklyDiscountPercentage && totalDays >= 7) {
    return totalPrice * (1 - weeklyDiscountPercentage / 100)
  }

  return totalPrice
}

export const calculateMonthlyRevenue = (
  pricing: DailyPricing[] | undefined, 
  vehicle?: Vehicle,
  includeDiscounts: boolean = false
) => {
  if (!Array.isArray(pricing)) {
    return Array(12).fill(0).map((_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      return {
        name: d.toLocaleString('en-US', { month: 'short' }),
        fullMonth: d.toLocaleString('en-US', { month: 'long' }),
        year: d.getFullYear(),
        total: 0,
        currency: 'USD'
      }
    }).reverse()
  }

  const today = new Date()
  const months: { [key: string]: { total: number; currency: string } } = {}
  
  for (let i = 0; i < 12; i++) {
    const d = new Date(today)
    d.setMonth(d.getMonth() - i)
    const monthKey = d.toISOString().substring(0, 7)
    months[monthKey] = { total: 0, currency: pricing[0]?.priceWithCurrency.currency || 'USD' }
  }

  let consecutiveDays: DailyPricing[] = []
  let prevDayAdded = false

  pricing.forEach((day, index) => {
    if (day.wholeDayUnavailable) {
      // Add the previous day if it exists and is available
      // and we haven't already added a previous day for this sequence
      if (!prevDayAdded && index > 0 && !pricing[index - 1].wholeDayUnavailable) {
        consecutiveDays.push(pricing[index - 1])
        prevDayAdded = true
      }
      consecutiveDays.push(day)
      
      const isLastDay = index === pricing.length - 1
      const nextDayAvailable = !isLastDay && !pricing[index + 1].wholeDayUnavailable
      
      if (isLastDay || nextDayAvailable) {
        let revenue: number
        
        if (includeDiscounts) {
          revenue = applyDiscounts(consecutiveDays, vehicle)
        } else {
          revenue = consecutiveDays.reduce((sum, day) => sum + day.priceWithCurrency.amount, 0)
        }

        // Use the first actual unavailable day for the month key
        const monthKey = consecutiveDays[prevDayAdded ? 1 : 0].date.substring(0, 7)
        if (months[monthKey]) {
          months[monthKey].total += revenue
          months[monthKey].currency = consecutiveDays[0].priceWithCurrency.currency
        }
        
        consecutiveDays = []
        prevDayAdded = false
      }
    }
  })

  return Object.entries(months)
    .map(([month, { total, currency }]) => {
      const date = new Date(month)
      return {
        name: date.toLocaleString('en-US', { month: 'short' }),
        fullMonth: date.toLocaleString('en-US', { month: 'long' }),
        year: date.getFullYear(),
        total: Math.round(total),
        currency
      }
    })
    .reverse()
}

export const calculateAverageMonthlyRevenue = (pricing: DailyPricing[] | undefined, vehicle?: Vehicle, includeDiscounts: boolean = false) => {
  if (!Array.isArray(pricing)) return 0
  
  const data = calculateMonthlyRevenue(pricing, vehicle, includeDiscounts)
  const filteredData = data.filter(month => month.total !== 0)
  return filteredData.length > 0 
    ? Math.round(filteredData.reduce((sum, month) => sum + month.total, 0) / filteredData.length) 
    : 0
}

export const calculatePreviousYearRevenue = (pricing: DailyPricing[] | undefined, vehicle?: Vehicle, includeDiscounts: boolean = false) => {
  if (!Array.isArray(pricing)) return 0
  
  const data = calculateMonthlyRevenue(pricing, vehicle, includeDiscounts)
  const lastYear = new Date().getFullYear() - 1
  return data
    .filter(month => month.year === lastYear)
    .reduce((sum, month) => sum + month.total, 0)
}