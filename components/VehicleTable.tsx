import React, { useMemo } from "react"
import { Storage } from "@plasmohq/storage"
import type { Vehicle } from "~types"
import { getColumnDefs } from "./table/columns"
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"

ModuleRegistry.registerModules([AllCommunityModule])

const storage = new Storage({ area: "local" })

interface VehicleTableProps {
  vehicles: Vehicle[]
}

const VehicleTable = ({ vehicles }: VehicleTableProps) => {
  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      buttons: ['apply', 'reset'],
      closeOnApply: true
    },
    flex: 1,
    minWidth: 100,
    autoHeight: true,
    suppressMenu: false
  }), [])

  return (
    <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
      <AgGridReact
        rowData={vehicles}
        columnDefs={getColumnDefs()}
        defaultColDef={defaultColDef}
        enableCellTextSelection={true}
        animateRows={true}
        suppressMenuHide={true}
        tooltipShowDelay={0}
        tooltipHideDelay={2000}
        rowHeight={42}
        headerHeight={40}
        suppressMovableColumns={false}
        suppressColumnMoveAnimation={true}
        suppressDragLeaveHidesColumns={true}
      />
    </div>
  )
}

export default React.memo(VehicleTable)