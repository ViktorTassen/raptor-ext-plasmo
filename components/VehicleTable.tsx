import React, { useMemo, forwardRef } from "react"
import { AgGridReact } from "ag-grid-react"
import type { Vehicle } from "~types"
import { getColumnDefs } from "./table/columns"
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community"
import { themeQuartz } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule])

interface VehicleTableProps {
  vehicles: Vehicle[]
}

const VehicleTable = forwardRef<AgGridReact, VehicleTableProps>(({ vehicles }, ref) => {
  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      buttons: ['reset', 'apply'],
      closeOnApply: true
    },
    autoHeight: true,
    // Enable auto-sizing for all columns
    suppressSizeToFit: false,
    flex: 1
  }), [])

  return (
    <div className="w-full" style={{ height: 'calc(100vh - 160px)' }}>
      <AgGridReact
        ref={ref}
        theme={themeQuartz}
        rowData={vehicles}
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
        // Auto-size all columns on first data load
        // onFirstDataRendered={(params) => {
        //   params.api.sizeColumnsToFit()
        // }}
      />
     </div>
  )
})


export default React.memo(VehicleTable)




