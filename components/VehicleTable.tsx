import React, { useMemo, forwardRef, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type RowModelType } from "ag-grid-community"
ModuleRegistry.registerModules([AllCommunityModule])

import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import type { Vehicle } from "~types";
import { getColumnDefs } from "./table/columns";
import { calculateMonthlyRevenue } from "~utils/revenue";

const storage = new Storage({ area: "local" });

interface VehicleTableProps {
  vehicles: Vehicle[];
}

const VehicleTable = forwardRef<AgGridReact, VehicleTableProps>(({ vehicles }, ref) => {
  const [includeDiscounts] = useStorage({ key: "includeDiscounts", instance: storage });
  const [applyProtectionPlan] = useStorage({ key: "applyProtectionPlan", instance: storage });
  
  const gridRef = useRef<AgGridReact>(null);
  
  const columnDefs = useMemo(() => getColumnDefs(), []);
  
  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: "agTextColumnFilter",
    filterParams: { buttons: ["reset", "apply"], closeOnApply: true },
    autoHeight: true,
    flex: 1,
    valueCache: true,
    suppressMenu: true,
  }), []);

  const gridOptions = useMemo(() => ({
    animateRows: true,
    rowBuffer: 10,
    rowModelType: "clientSide" as RowModelType,
    paginationPageSize: 50,
    cacheBlockSize: 50,
    suppressCellFlash: true,
    suppressRowDrag: true,
    suppressColumnVirtualisation: true,
    suppressClipboardPaste: true,
    suppressCellSelection: true,
    deltaRowDataMode: true,
    maintainColumnOrder: true,
    suppressPropertyNamesCheck: true,
    suppressReactUi: false,
    getRowId: (params) => params.data.id.toString(),
  }), []);

  const vehiclesWithSettings = useMemo(() => vehicles.map(vehicle => ({
    ...vehicle,
    revenueData: vehicle.dailyPricing ? calculateMonthlyRevenue(vehicle.dailyPricing, vehicle, includeDiscounts, applyProtectionPlan) : []
  })), [vehicles, includeDiscounts, applyProtectionPlan]);
  
  return (
    <div className="w-full" style={{ height: "calc(100vh - 120px)" }}>
      <AgGridReact
        ref={(r) => {
          gridRef.current = r;
          if (typeof ref === "function") {
            ref(r);
          } else if (ref) {
            ref.current = r;
          }
        }}
        {...gridOptions}
        rowData={vehiclesWithSettings}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
      />
    </div>
  );
});

export default React.memo(VehicleTable);