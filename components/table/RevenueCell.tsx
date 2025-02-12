import React, { useMemo } from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  Tooltip
} from "recharts"
import type { DailyPricing } from "~types"
import { calculateMonthlyRevenue } from "~utils/revenue"

interface RevenueCellProps {
  dailyPricing: DailyPricing[]
}

export const RevenueCell = React.memo(function RevenueCell({ dailyPricing }: RevenueCellProps) {
  const data = useMemo(() => calculateMonthlyRevenue(dailyPricing), [dailyPricing])

  return (
    <div className="w-[240px]">
      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              interval={"preserveStartEnd"}
              dataKey="name"
              tickLine={false}
              axisLine={true}
              fontSize={0}
              height={2}
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
})