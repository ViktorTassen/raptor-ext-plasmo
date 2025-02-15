import React, { useMemo, forwardRef } from "react"
import { AgGridReact } from "ag-grid-react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import type { Vehicle } from "~types"
import { getColumnDefs } from "./table/columns"
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community"
import { themeQuartz } from 'ag-grid-community';
import { calculateMonthlyRevenue } from "~utils/revenue"

ModuleRegistry.registerModules([AllCommunityModule])

const storage = new Storage({ area: "local" })

interface VehicleTableProps {
  vehicles: Vehicle[]
}

const VehicleTable = forwardRef<AgGridReact, VehicleTableProps>(({ vehicles }, ref) => {
  const [includeDiscounts] = useStorage({
    key: "includeDiscounts",
    instance: storage
  })

  const [applyProtectionPlan] = useStorage({
    key: "applyProtectionPlan",
    instance: storage
  })

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      buttons: ['reset', 'apply'],
      closeOnApply: true
    },
    autoHeight: true,
    suppressSizeToFit: false,
    flex: 1
  }), [])

  const vehiclesWithSettings = useMemo(() => {
    return vehicles.map(vehicle => ({
      ...vehicle,
      revenueData: vehicle.dailyPricing ? calculateMonthlyRevenue(vehicle.dailyPricing, vehicle, includeDiscounts, applyProtectionPlan) : []
    }))
  }, [vehicles, includeDiscounts, applyProtectionPlan])

  return (
    <div className="w-full" style={{ height: 'calc(100vh - 160px)' }}>
      <AgGridReact
        ref={ref}
        theme={themeQuartz}
        rowData={vehiclesWithSettings}
        getRowId={(params) => params.data.id}
        columnDefs={getColumnDefs()}
        defaultColDef={defaultColDef}
        enableCellTextSelection={false}
        animateRows={true}
        suppressMenuHide={true}
        tooltipShowDelay={0}
        tooltipHideDelay={2000}
        rowHeight={42}
        headerHeight={40}
      />
     </div>
  )
})

export default React.memo(VehicleTable)