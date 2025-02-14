import React, { useMemo } from "react"
import type { ICellRendererParams } from "ag-grid-community"
import { AgCharts } from "ag-charts-react"
import type { AgBarSeriesOptions, AgChartOptions } from "ag-charts-community"
import type { DailyPricing } from "~types"
import { calculateMonthlyRevenue } from "~utils/revenue"

interface RevenueCellProps extends ICellRendererParams {
  value: DailyPricing[]
}

export const RevenueCell = React.memo(function RevenueCell(props: RevenueCellProps) {
  const data = useMemo(() => calculateMonthlyRevenue(props.value), [props.value])

  const options = useMemo<AgChartOptions>(() => ({
    data,
    series: [{
      type: "bar",
      xKey: "name",
      yKey: "total",
      fill: "#593BFB",
      highlightStyle: {
        fill: "#4930C9"
      }
    } as AgBarSeriesOptions],
    axes: [
      {
        type: "category",
        position: "bottom",
        title: { enabled: false },
        label: { enabled: false }
      },
      {
        type: "number",
        position: "left",
        title: { enabled: false },
        label: { enabled: false }
      }
    ],
    padding: { top: 2, right: 2, bottom: 2, left: 2 },
    legend: { enabled: false },
    background: { fill: "transparent" },
    width: 200,
    height: 40
  }), [data])

  return (
    <div 
      style={{ 
        width: "200px", 
        height: "40px",
        display: "flex",
        alignItems: "center"
      }}
    >
      <AgCharts options={options} />
    </div>
  )
})
