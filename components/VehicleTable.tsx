import React, { useState } from "react"
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
  
  const [columnVisibility, setColumnVisibility] = useStorage<VisibilityState>({
    key: "tableColumnVisibility",
    instance: storage
  })

  return (
    <DataTable
      data={vehicles}
      columns={columns}
      sorting={sorting}
      onSortingChange={setSorting}
      columnVisibility={columnVisibility || {}}
      onColumnVisibilityChange={setColumnVisibility}
    />
  )
}

export default React.memo(VehicleTable)