import React from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"
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

  const data = calculateMonthlyRevenue(dailyPricing)
  const filteredData = data.filter(month => month.total !== 0)
  const totalRevenueFiltered = filteredData.reduce((sum, month) => sum + month.total, 0)
  const avgMonthlyRevenueFiltered = filteredData.length > 0 
    ? Math.round(totalRevenueFiltered / filteredData.length) 
    : 0

  return (
    <div className="w-[200px]">
      {/* <div className="text-sm font-medium mb-1">
        Avg: ${avgMonthlyRevenueFiltered.toLocaleString()}
      </div> */}
      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis
            interval={"preserveStartEnd"}
              dataKey="name"
              fontSize={9}
              tickLine={false}
              axisLine={true}
              height={16}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-white p-2 shadow-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-[0.70rem] text-muted-foreground">
                          {data.fullMonth} {data.year}
                        </span>
                        <span className="font-bold text-muted-foreground">
                          ${payload[0].value?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="total"
              fill="currentColor"
              radius={[2, 2, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}