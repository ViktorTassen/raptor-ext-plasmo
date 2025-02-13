import React, { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import type { SortingState, VisibilityState } from "@tanstack/react-table"
import type { Vehicle } from "~types"
import { DataTable } from "./table/DataTable"
import { columns } from "./table/columns"

const storage = new Storage({ area: "local" })
const COLUMN_VISIBILITY_KEY = "tableColumnVisibility"

interface VehicleTableProps {
  vehicles: Vehicle[]
}

const VehicleTable = ({ vehicles }: VehicleTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Load column visibility from storage
  useEffect(() => {
    const loadColumnVisibility = async () => {
      const savedVisibility = await storage.get<VisibilityState>(COLUMN_VISIBILITY_KEY)
      if (savedVisibility) {
        setColumnVisibility(savedVisibility)
      }
    }
    loadColumnVisibility()
  }, [])

  // Save column visibility to storage
  const handleColumnVisibilityChange = async (visibility: VisibilityState) => {
    setColumnVisibility(visibility)
    await storage.set(COLUMN_VISIBILITY_KEY, visibility)
  }

  return (
    <DataTable
      data={vehicles}
      columns={columns}
      sorting={sorting}
      onSortingChange={setSorting}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={handleColumnVisibilityChange}
    />
  )
}

export default React.memo(VehicleTable)