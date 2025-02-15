import React, { useMemo } from "react"
import type { ICellRendererParams } from "ag-grid-community"
import { AgCharts } from "ag-charts-react"
import type { AgBarSeriesOptions, AgBarSeriesTooltipRendererParams, AgCartesianChartOptions } from "ag-charts-community"
import type { DailyPricing, Vehicle } from "~types"
import { calculateMonthlyRevenue } from "~utils/revenue"
import { getCurrencySymbol } from "~utils/currency"

interface RevenueCellProps extends ICellRendererParams {
  value: DailyPricing[]
  data: Vehicle
}

function renderer(params: AgBarSeriesTooltipRendererParams) {
  const currencySymbol = getCurrencySymbol(params.datum.currency || 'USD')
  return `
    <div class="bg-white text-black shadow-lg rounded-lg p-2 text-xs">
      <div class="text-gray-600">${params.datum.fullMonth} ${params.datum.year}</div>
      <div class="text-md font-bold">${currencySymbol}${params.datum[params.yKey].toFixed(0)}</div>
    </div>
  `;
}

export const RevenueCell = React.memo(function RevenueCell(props: RevenueCellProps) {
  const data = useMemo(() => {
    const monthlyData = calculateMonthlyRevenue(props.value)
    // Add currency to each data point
    return monthlyData.map(item => ({
      ...item,
      currency: props.data.avgDailyPrice?.currency || 'USD'
    }))
  }, [props.value, props.data.avgDailyPrice?.currency])

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
    <AgCharts options={options} style={{ width: "200px", height: "40px" }} />
  )
})