import React, { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import type { SortingState, VisibilityState } from "@tanstack/react-table"
import type { Vehicle } from "~types"
import { DataTable } from "./table/DataTable"
import { columns } from "./table/columns"

const storage = new Storage({ area: "local" })

interface VehicleTableProps {
  vehicles: Vehicle[]
}

const VehicleTable = ({ vehicles }: VehicleTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  
  // Initialize with all columns visible by default
  const defaultColumnVisibility = columns.reduce((acc, column) => {
    acc[column.id] = true
    return acc
  }, {} as VisibilityState)
  
  const [columnVisibility, setColumnVisibility] = useStorage<VisibilityState>({
    key: "tableColumnVisibility",
    instance: storage
  })

  // Initialize storage with default values if empty
  useEffect(() => {
    const initializeStorage = async () => {
      const currentVisibility = await storage.get("tableColumnVisibility")
      if (!currentVisibility) {
        await storage.set("tableColumnVisibility", defaultColumnVisibility)
        setColumnVisibility(defaultColumnVisibility)
      }
    }

    initializeStorage()
  }, [])

  return (
    <DataTable
      data={vehicles}
      columns={columns}
      sorting={sorting}
      onSortingChange={setSorting}
      columnVisibility={columnVisibility || defaultColumnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
    />
  )
}

export default React.memo(VehicleTable)