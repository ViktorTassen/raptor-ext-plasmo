import type { DailyPricing } from "~types"

export const calculateMonthlyRevenue = (pricing: DailyPricing[] | undefined) => {
  if (!Array.isArray(pricing)) {
    return Array(12).fill(0).map((_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      return {
        name: d.toLocaleString('en-US', { month: 'short' }),
        fullMonth: d.toLocaleString('en-US', { month: 'long' }),
        year: d.getFullYear(),
        total: 0
      }
    }).reverse()
  }

  const today = new Date()
  const months: { [key: string]: number } = {}
  
  for (let i = 0; i < 12; i++) {
    const d = new Date(today)
    d.setMonth(d.getMonth() - i)
    const monthKey = d.toISOString().substring(0, 7)
    months[monthKey] = 0
  }

  let consecutiveDays: DailyPricing[] = []
  pricing.forEach((day, index) => {
    if (day.wholeDayUnavailable) {
      consecutiveDays.push(day)
      const isLastDay = index === pricing.length - 1
      const nextDayAvailable = !isLastDay && !pricing[index + 1].wholeDayUnavailable
      
      if (isLastDay || nextDayAvailable) {
        if (consecutiveDays.length === 1) {
          const prevDayAvailable = index === 0 || !pricing[index - 1].wholeDayUnavailable
          const revenue = consecutiveDays[0].price * (prevDayAvailable && nextDayAvailable ? 2 : 1)
          const monthKey = consecutiveDays[0].date.substring(0, 7)
          if (months[monthKey] !== undefined) {
            months[monthKey] += revenue
          }
        } else {
          const totalRevenue = consecutiveDays.reduce((sum, day) => sum + day.price, 0)
          const monthKey = consecutiveDays[0].date.substring(0, 7)
          if (months[monthKey] !== undefined) {
            months[monthKey] += totalRevenue * (consecutiveDays.length + 1) / consecutiveDays.length
          }
        }
        consecutiveDays = []
      }
    }
  })

  return Object.entries(months)
    .map(([month, revenue]) => {
      const date = new Date(month)
      return {
        name: date.toLocaleString('en-US', { month: 'short' }),
        fullMonth: date.toLocaleString('en-US', { month: 'long' }),
        year: date.getFullYear(),
        total: Math.round(revenue)
      }
    })
    .reverse()
}

export const calculateAverageMonthlyRevenue = (pricing: DailyPricing[] | undefined) => {
  if (!Array.isArray(pricing)) return 0
  
  const data = calculateMonthlyRevenue(pricing)
  const filteredData = data.filter(month => month.total !== 0)
  return filteredData.length > 0 
    ? Math.round(filteredData.reduce((sum, month) => sum + month.total, 0) / filteredData.length) 
    : 0
}

export const calculatePreviousYearRevenue = (pricing: DailyPricing[] | undefined) => {
  if (!Array.isArray(pricing)) return 0
  
  const data = calculateMonthlyRevenue(pricing)
  const lastYear = new Date().getFullYear() - 1
  return data
    .filter(month => month.year === lastYear)
    .reduce((sum, month) => sum + month.total, 0)
}