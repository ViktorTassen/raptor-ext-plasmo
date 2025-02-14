import React, { useMemo } from "react"
import type { ICellRendererParams } from "ag-grid-community"
import type { DailyPricing } from "~types"
import { calculateMonthlyRevenue } from "~utils/revenue"

interface RevenueCellProps extends ICellRendererParams {
  value: DailyPricing[]
}

export const RevenueCell = React.memo(function RevenueCell(props: RevenueCellProps) {
  const data = useMemo(() => calculateMonthlyRevenue(props.value), [props.value])

  // Create mini bar chart using divs
  return (
    <div className="flex items-end h-10 gap-[2px] w-[200px]">
      {data.map((month, index) => {
        const maxValue = Math.max(...data.map(d => d.total))
        const height = month.total ? (month.total / maxValue) * 100 : 0
        
        return (
          <div
            key={index}
            className="flex-1 bg-[#593BFB] hover:opacity-80 transition-opacity cursor-pointer relative group"
            style={{ height: `${height}%` }}
            title={`${month.fullMonth} ${month.year}: $${month.total.toLocaleString()}`}>
            <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-white rounded shadow-lg text-sm whitespace-nowrap z-10">
              {month.fullMonth} {month.year}
              <br />
              ${month.total.toLocaleString()}
            </div>
          </div>
        )
      })}
    </div>
  )
})