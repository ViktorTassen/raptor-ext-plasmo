import React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type GroupingState,
  flexRender
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~components/ui/table"
import { ColumnVisibilityDropdown } from "./ColumnVisibilityDropdown"
import { GroupingDropdown } from "./GroupingDropdown"

interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  columnVisibility: VisibilityState
  onColumnVisibilityChange: (visibility: VisibilityState) => void
  grouping: GroupingState
  onGroupingChange: (grouping: GroupingState) => void
}

export function DataTable<TData>({
  data,
  columns,
  sorting = [],
  onSortingChange,
  columnVisibility,
  onColumnVisibilityChange,
  grouping,
  onGroupingChange
}: DataTableProps<TData>) {
  // Early return if data is not available
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md">
        No data available
      </div>
    )
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      grouping
    },
    onSortingChange: onSortingChange,
    onColumnVisibilityChange: onColumnVisibilityChange,
    onGroupingChange: onGroupingChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableGrouping: true
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <GroupingDropdown table={table} />
        <ColumnVisibilityDropdown table={table} />
      </div>
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          <div className="min-w-max">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={header.column.getCanSort() ? 'cursor-pointer select-none sticky top-0 bg-white z-10' : 'sticky top-0 bg-white z-10'}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽'
                        }[header.column.getIsSorted() as string] ?? null}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}