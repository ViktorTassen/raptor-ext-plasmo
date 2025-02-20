import React, { useMemo, forwardRef, useRef, useEffect, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type RowModelType } from "ag-grid-community"
ModuleRegistry.registerModules([AllCommunityModule])

import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import type { Vehicle } from "~types";
import { getColumnDefs } from "./table/columns";
import { calculateMonthlyRevenue } from "~utils/revenue";

const storage = new Storage({ area: "local" });
const GRID_STATE_KEY = "vehicle-grid-state";

interface VehicleTableProps {
  vehicles: Vehicle[];
}

const VehicleTable = forwardRef<AgGridReact, VehicleTableProps>(({ vehicles }, ref) => {
  const [includeDiscounts] = useStorage({ key: "includeDiscounts", instance: storage });
  const [applyProtectionPlan] = useStorage({ key: "applyProtectionPlan", instance: storage });
  
  const gridRef = useRef<AgGridReact>(null);
  const previousVehicleIds = useRef<Set<number>>(new Set());
  
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
    // getRowHeight: () => 40,
    getRowId: (params) => params.data.id.toString(),
  }), []);

  const vehiclesWithSettings = useMemo(() => vehicles.map(vehicle => ({
    ...vehicle,
    revenueData: vehicle.dailyPricing ? calculateMonthlyRevenue(vehicle.dailyPricing, vehicle, includeDiscounts, applyProtectionPlan) : []
  })), [vehicles, includeDiscounts, applyProtectionPlan]);

  const onColumnStateChanged = useCallback(() => {
    if (!gridRef.current?.api) return;
    const columnState = gridRef.current.api.getColumnState();
    storage.set(GRID_STATE_KEY, JSON.stringify(columnState));
  }, []);
  

  const onGridReady = useCallback((params) => {
    storage.get(GRID_STATE_KEY).then(savedState => {
      if (savedState && params.api) {
        try {
          const parsedState = JSON.parse(savedState);
          params.api.applyColumnState({ state: parsedState, applyOrder: true });
        } catch (e) {
          console.error("Failed to parse saved column state", e);
        }
      }
    });
  }, []);
  
  
  
  useEffect(() => {
    if (!gridRef.current?.api || vehiclesWithSettings.length === 0) return;
    const api = gridRef.current.api;
  
    // Save current column state before updating data
    const columnState = api.getColumnState();
  
    // Get new and previous vehicle IDs
    const currentIds = new Set(vehiclesWithSettings.map(v => v.id));
    const prevIds = previousVehicleIds.current;
  
    // Identify updates, additions, and removals
    const updates = vehiclesWithSettings.filter(v => {
      const node = api.getRowNode(v.id.toString());
      return node && JSON.stringify(node.data) !== JSON.stringify(v);
    });
  
    const additions = vehiclesWithSettings.filter(v => !prevIds.has(v.id));
  
    if (updates.length > 0 || additions.length > 0) {
      api.applyTransactionAsync({
        update: updates,
        add: additions
      });
  
      setTimeout(() => {
        // Restore column state after data changes
        api.applyColumnState({ state: columnState, applyOrder: true });
  
        // Persist column state in storage
        storage.set(GRID_STATE_KEY, JSON.stringify(columnState));
      }, 50);
    }
  
    previousVehicleIds.current = currentIds;
  }, [vehiclesWithSettings]);
  
  
  
  
  return (
    <div className="w-full" style={{ height: "calc(100vh - 160px)" }}>
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
        columnDefs={getColumnDefs()}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        onColumnResized={onColumnStateChanged}
        onColumnMoved={onColumnStateChanged}
        onColumnVisible={onColumnStateChanged}
        onColumnPinned={onColumnStateChanged}
        onSortChanged={onColumnStateChanged}
        onFilterChanged={onColumnStateChanged}
      />
    </div>
  );
});

export default React.memo(VehicleTable);
