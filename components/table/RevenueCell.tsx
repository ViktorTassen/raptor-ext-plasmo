import { Card, AreaChart } from "@tremor/react"
import type { DailyPricing } from "~types"

interface RevenueCellProps {
  dailyPricing: DailyPricing[]
}

export function RevenueCell({ dailyPricing }: RevenueCellProps) {
  const calculateMonthlyRevenue = (pricing: DailyPricing[]) => {
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
      .map(([month, revenue]) => ({
        month: month.substring(5, 7) + '/' + month.substring(2, 4),
        revenue: Math.round(revenue)
      }))
      .reverse()
  }

  const data = calculateMonthlyRevenue(dailyPricing)
  const filteredData = data.filter(month => month.revenue !== 0)
  const totalRevenueFiltered = filteredData.reduce((sum, month) => sum + month.revenue, 0)
  const avgMonthlyRevenueFiltered = filteredData.length > 0 
    ? Math.round(totalRevenueFiltered / filteredData.length) 
    : 0

  return (
    <div className="w-[200px]">
      <div className="text-sm font-medium mb-1">
        Avg: ${avgMonthlyRevenueFiltered.toLocaleString()}
      </div>
      <Card className="h-24">
        <AreaChart
          data={data}
          index="month"
          categories={["revenue"]}
          colors={["blue"]}
          valueFormatter={(value) => `$${value.toLocaleString()}`}
          showXAxis={true}
          showYAxis={true}
          showLegend={false}
          showGridLines={false}
        />
      </Card>
    </div>
  )
}