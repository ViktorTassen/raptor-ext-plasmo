import React, { useMemo, forwardRef, useRef, useEffect } from "react"
import { AgGridReact } from "ag-grid-react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import type { Vehicle } from "~types"
import { getColumnDefs } from "./table/columns"
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community"
import { themeQuartz } from 'ag-grid-community'
import { calculateMonthlyRevenue } from "~utils/revenue"

ModuleRegistry.registerModules([AllCommunityModule])

const storage = new Storage({ area: "local" })
const GRID_STATE_KEY = "vehicle-grid-state"

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
  
  const gridRef = useRef<AgGridReact>(null)
  const isInitialLoad = useRef(true)
  
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

  // Calculate revenue data with memoization
  const vehiclesWithSettings = useMemo(() => {
    return vehicles.map(vehicle => ({
      ...vehicle,
      revenueData: vehicle.dailyPricing 
        ? calculateMonthlyRevenue(vehicle.dailyPricing, vehicle, includeDiscounts, applyProtectionPlan) 
        : []
    }))
  }, [vehicles, includeDiscounts, applyProtectionPlan])

  // Save grid state when columns change
  const onColumnStateChanged = () => {
    console.log("onColumnStateChanged")
    if (!gridRef.current?.api) return
    
    const columnState = gridRef.current.api.getColumnState()
    storage.set(GRID_STATE_KEY, JSON.stringify(columnState))
  }
  
  // Initialize grid and restore state
  const onGridReady = (params) => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      
      // Load saved column state
      storage.get(GRID_STATE_KEY).then(savedState => {
        if (savedState && params.api) {
          try {
            const columnState = JSON.parse(savedState)
            params.api.applyColumnState({
              state: columnState,
              applyOrder: true
            })
          } catch (e) {
            console.error("Failed to parse saved column state", e)
          }
        }
      })
    }
  }
  
  // Update rows without losing column state
  useEffect(() => {
    if (!gridRef.current?.api || vehiclesWithSettings.length === 0) return
    
    const api = gridRef.current.api
    
    // Check if there are existing rows
    const hasExistingRows = api.getDisplayedRowCount() > 0
    
    // Save current column state before update
    const columnState = api.getColumnState()
    
    if (hasExistingRows) {
      // Clear rows first
      api.applyTransaction({
        remove: api.getRenderedNodes().map(node => node.data)
      })
      
      // Then add new rows
      api.applyTransaction({
        add: vehiclesWithSettings
      })
    } else {
      // First time load - just add all rows
      api.applyTransaction({
        add: vehiclesWithSettings
      })
    }
    
    // Restore column state after update
    setTimeout(() => {
      api.applyColumnState({
        state: columnState,
        applyOrder: true
      })
    }, 10)
  }, [vehiclesWithSettings])

  return (
    <div className="w-full" style={{ height: 'calc(100vh - 160px)' }}>
      <AgGridReact
        ref={(r) => {
          // Set both refs - our local ref and the forwarded ref
          gridRef.current = r
          if (typeof ref === 'function') {
            ref(r)
          } else if (ref) {
            ref.current = r
          }
        }}
        theme={themeQuartz}
        rowData={[]}
        getRowId={(params) => params.data.id.toString()}
        columnDefs={getColumnDefs()}
        defaultColDef={defaultColDef}
        enableCellTextSelection={false}
        animateRows={true}
        suppressMenuHide={true}
        tooltipShowDelay={0}
        tooltipHideDelay={2000}
        headerHeight={40}
        onGridReady={onGridReady}
        onColumnResized={onColumnStateChanged}
        onColumnMoved={onColumnStateChanged}
        onColumnVisible={onColumnStateChanged}
        onColumnPinned={onColumnStateChanged}
        onSortChanged={onColumnStateChanged}
        onFilterChanged={onColumnStateChanged}
        maintainColumnOrder={true}
      />
    </div>
  )
})

export default React.memo(VehicleTable)