import React, { useMemo } from "react"
import type { ICellRendererParams } from "ag-grid-community"
import { AgCharts } from "ag-charts-react"
import type { AgBarSeriesOptions, AgBarSeriesTooltipRendererParams, AgCartesianChartOptions } from "ag-charts-community"
import type { DailyPricing } from "~types"
import { calculateMonthlyRevenue } from "~utils/revenue"

interface RevenueCellProps extends ICellRendererParams {
  value: DailyPricing[]
}


function renderer(params: AgBarSeriesTooltipRendererParams) {
  return `
    <div class="bg-white text-black shadow-lg rounded-lg p-2 text-xs">
      <div class="text-gray-600">${params.datum.fullMonth} ${params.datum.year}</div>
      <div class="text-md font-bold">$${params.datum[params.yKey].toFixed(0)}</div>
    </div>
  `;
}


export const RevenueCell = React.memo(function RevenueCell(props: RevenueCellProps) {
  const data = useMemo(() => calculateMonthlyRevenue(props.value), [props.value])

  const options = useMemo<AgCartesianChartOptions>(() => ({
    data,
    tooltip: {
      position: {
        type: 'pointer',
        yOffset: 70,
    },
    },
    series: [{
      type: "bar",
      tooltip: { renderer: renderer },
      xKey: "name",
      yKey: "total",
      fill: "#593BFB",
    
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
    padding: { top: 1, right: 1, bottom: 1, left: 1 },
    legend: { enabled: false },
    background: { fill: "transparent" },
  }), [data])

  return (
      <AgCharts options={options}  style={{ width: "200px", height: "40px" }} />
  )
})
