import React, { useMemo } from "react"
import { Storage } from "@plasmohq/storage"
import type { Vehicle } from "~types"
import { getColumnDefs } from "./table/columns"
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import { themeQuartz } from 'ag-grid-community';
import {
  AllEnterpriseModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
  AllEnterpriseModule,
]);

// ModuleRegistry.registerModules([AllCommunityModule])

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
    autoHeight: true,
  }), [])

  return (
    <div className="w-full" style={{ height: 'calc(100vh - 160px)' }}>
      <AgGridReact
        theme={themeQuartz}
        rowData={vehicles}
        columnDefs={getColumnDefs()}
        defaultColDef={defaultColDef}
        enableCellTextSelection={false}
        animateRows={true}
        suppressMenuHide={true}
        tooltipShowDelay={0}
        tooltipHideDelay={2000}
        rowHeight={42}
        headerHeight={40}
        suppressMovableColumns={false}
        suppressColumnMoveAnimation={false}
        suppressDragLeaveHidesColumns={true}
      />
    </div>
  )
}

export default React.memo(VehicleTable)