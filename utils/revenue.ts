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

export const calculateMonthlyRevenue = (
  pricing: DailyPricing[] | undefined, 
  vehicle?: Vehicle,
  includeDiscounts: boolean = false
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

  const months = initializeMonths(pricing[0].priceWithCurrency.currency)
  const bookings: { start: number; end: number; days: DailyPricing[] }[] = []
  let currentBooking: DailyPricing[] = []
  
  // First pass: identify bookings
  for (let i = 0; i < pricing.length; i++) {
    const day = pricing[i]
    
    if (day.wholeDayUnavailable) {
      if (currentBooking.length === 0 && i > 0 && !pricing[i - 1].wholeDayUnavailable) {
        currentBooking.push(pricing[i - 1])
      }
      currentBooking.push(day)
      
      if (i === pricing.length - 1 || !pricing[i + 1].wholeDayUnavailable) {
        if (currentBooking.length > 0) {
          bookings.push({
            start: currentBooking[0].date.substring(8, 10) as unknown as number,
            end: currentBooking[currentBooking.length - 1].date.substring(8, 10) as unknown as number,
            days: currentBooking
          })
          currentBooking = []
        }
      }
    }
  }

  // Second pass: calculate revenue for each booking
  for (const booking of bookings) {
    const revenue = includeDiscounts 
      ? applyDiscounts(booking.days, vehicle)
      : booking.days.reduce((sum, day) => sum + day.priceWithCurrency.amount, 0)
    
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
  includeDiscounts: boolean = false
) => {
  if (!Array.isArray(pricing)) return 0
  
  const data = calculateMonthlyRevenue(pricing, vehicle, includeDiscounts)
  const nonZeroMonths = data.filter(month => month.total > 0)
  return nonZeroMonths.length > 0 
    ? Math.round(nonZeroMonths.reduce((sum, month) => sum + month.total, 0) / nonZeroMonths.length)
    : 0
}

export const calculatePreviousYearRevenue = (
  pricing: DailyPricing[] | undefined, 
  vehicle?: Vehicle, 
  includeDiscounts: boolean = false
) => {
  if (!Array.isArray(pricing)) return 0
  
  const data = calculateMonthlyRevenue(pricing, vehicle, includeDiscounts)
  const lastYear = new Date().getFullYear() - 1
  return data
    .filter(month => month.year === lastYear)
    .reduce((sum, month) => sum + month.total, 0)
}