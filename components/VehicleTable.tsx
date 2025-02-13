import React, { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import type { SortingState, VisibilityState, GroupingState } from "@tanstack/react-table"
import type { Vehicle } from "~types"
import { DataTable } from "./table/DataTable"
import { columns } from "./table/columns"

const storage = new Storage()
const COLUMN_VISIBILITY_KEY = "tableColumnVisibility"
const GROUPING_KEY = "tableGrouping"

interface VehicleTableProps {
  vehicles: Vehicle[]
}

const VehicleTable = ({ vehicles }: VehicleTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [grouping, setGrouping] = useState<GroupingState>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load saved states from storage
  useEffect(() => {
    const loadSavedStates = async () => {
      try {
        const savedVisibility = await storage.get<VisibilityState>(COLUMN_VISIBILITY_KEY)
        const savedGrouping = await storage.get<GroupingState>(GROUPING_KEY)
        
        if (savedVisibility) {
          setColumnVisibility(savedVisibility)
        }
        if (savedGrouping) {
          setGrouping(savedGrouping)
        }
      } catch (error) {
        console.error('[Raptor] Error loading saved states:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSavedStates()
  }, [])

  // Save states to storage
  const handleColumnVisibilityChange = async (visibility: VisibilityState) => {
    setColumnVisibility(visibility)
    await storage.set(COLUMN_VISIBILITY_KEY, visibility)
  }

  const handleGroupingChange = async (newGrouping: GroupingState) => {
    setGrouping(newGrouping)
    await storage.set(GROUPING_KEY, newGrouping)
  }

  if (isLoading) {
    return (
      <div className="text-center p-4 border rounded-md">
        Loading...
      </div>
    )
  }

  return (
    <DataTable
      data={vehicles}
      columns={columns}
      sorting={sorting}
      onSortingChange={setSorting}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={handleColumnVisibilityChange}
      grouping={grouping}
      onGroupingChange={handleGroupingChange}
    />
  )
}

export default React.memo(VehicleTable)