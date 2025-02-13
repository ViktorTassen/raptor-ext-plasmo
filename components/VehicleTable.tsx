import React, { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  flexRender
} from "@tanstack/react-table"
import type { Vehicle, VehicleOwner, Distance, ExcessFee, AirportDeliveryLocation, DailyPricing } from "~types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~components/ui/table"
import { Badge } from "~components/ui/badge"
import { BadgePopover } from "~components/table/BadgePopover"
import { RevenueCell } from "~components/table/RevenueCell"
import { InstantBookLocations } from "~components/table/InstantBookLocations"
import { ColorCircle } from "./table/ColorCircle"
import { calculateAverageMonthlyRevenue, calculatePreviousYearRevenue } from "~utils/revenue"
import { getCurrencySymbol } from "~utils/currency"
import { getVehicleTypeDisplay } from "~utils/vehicleTypes"

interface VehicleTableProps {
  vehicles: Vehicle[]
}

const VehicleTable = ({ vehicles }: VehicleTableProps) => {
  const [sorting, setSorting] = useState<any[]>([])

  const columns: ColumnDef<Vehicle>[] = useMemo(() => [
     {
      header: "Image",
      accessorFn: (row: Vehicle) => row.images[0]?.resizeableUrlTemplate,
      cell: (info) => {
        const urlTemplate = info.getValue() as string
        if (!urlTemplate) return null
       
        const imageUrl = urlTemplate.replace('{width}x{height}', '100x60')
        return (
          <img
            src={imageUrl}
            alt="Vehicle"
            className="h-8 w-20 object-cover rounded"
          />
        )
      },
      enableSorting: false
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: (info) => getVehicleTypeDisplay(info.getValue() as string)
    },
    {
      header: "Make",
      accessorKey: "make"
    },
    {
      header: "Model",
      accessorKey: "model"
    },
    {
      header: "Trim",
      accessorFn: (row: Vehicle) => row.details?.vehicle?.trim,
      cell: (info) => info.getValue() || '-'
    },
    {
      header: "Year",
      accessorKey: "year"
    },
 
    {
      header: "Est. Monthly Revenue",
      accessorFn: (row: Vehicle) => row.dailyPricing || [],
      cell: (info) => {
        const dailyPricing = info.getValue() as DailyPricing[]
        return <RevenueCell dailyPricing={dailyPricing} />
      }
    },
    {
      header: "Avg Monthly",
      accessorFn: (row: Vehicle) => ({
        amount: !row.dailyPricing ? 0 : calculateAverageMonthlyRevenue(row.dailyPricing),
        currency: row.avgDailyPrice?.currency || 'USD'
      }),
      cell: (info) => {
        const { amount, currency } = info.getValue() as { amount: number, currency: string }
        return `${getCurrencySymbol(currency)}${amount.toLocaleString()}`
      }
    },
    {
      header: "Prev Year",
      accessorFn: (row: Vehicle) => ({
        amount: !row.dailyPricing ? 0 : calculatePreviousYearRevenue(row.dailyPricing),
        currency: row.avgDailyPrice?.currency || 'USD'
      }),
      cell: (info) => {
        const { amount, currency } = info.getValue() as { amount: number, currency: string }
        return `${getCurrencySymbol(currency)}${amount.toLocaleString()}`
      }
    },
    {
      header: "Avg Market Value",
      accessorFn: (row: Vehicle) => row.details?.marketValue?.below,
      cell: (info) => {
        const value = info.getValue() as number | undefined
        if (!value) return '-'
        return `$${value.toFixed(0).toLocaleString()}`
      }
    },
    {
      header: "Days on Turo",
      accessorFn: (row: Vehicle) => {
        const listingDate = row.details?.vehicle?.listingCreatedTime
        if (!listingDate) return 0
        const created = new Date(listingDate)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - created.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
    },
    {
      header: "Trips",
      accessorKey: "completedTrips"
    },
    {
      header: "Favs",
      accessorFn: (row: Vehicle) => row.details?.numberOfFavorites
    },
    {
      header: "Rating",
      accessorKey: "rating",
      cell: (info) => {
        const rating = info.getValue() as number
        if (rating == null) return null
        return (
          <div className="flex items-center">
            <span className="mr-1">{rating.toFixed(1)}</span>
            <span style={{color:"#593BFB"}}>★</span>
          </div>
        )
      }
    },
    {
      header: "Reviews",
      accessorFn: (row: Vehicle) => row.details?.numberOfReviews
    },
    {
      header: "Instant Book",
      accessorFn: (row: Vehicle) => row.details?.instantBookLocationPreferences,
      cell: (info) => {
        const prefs = info.getValue() as Vehicle["details"]["instantBookLocationPreferences"]
        if (!prefs) return null
        return <InstantBookLocations preferences={prefs} />
      }
    },
    {
      header: "Host",
      accessorFn: (row: Vehicle) => row.details?.owner,
      cell: (info) => {
        const owner = info.getValue() as VehicleOwner | undefined
        if (!owner) return null
        return (
          <div className="flex items-center gap-2">
            <img
              src={owner.imageUrl}
              alt={owner.name}
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="text-sm">{owner.name}</span>
          </div>
        )
      }
    },
    {
      header: "P Plan",
      accessorFn: (row: Vehicle) => row.details?.hostTakeRate,
      cell: (info) => {
        const rate = info.getValue() as number | undefined
        if (rate == null) return null
        return `${(rate * 100).toFixed(0)}%`
      }
    },
    {
      header: "Host ID",
      accessorKey: "hostId"
    },
    {
      header: "Host Status",
      accessorFn: (row: Vehicle) => row.details?.owner,
      cell: (info) => {
        const owner = info.getValue() as VehicleOwner | undefined
        if (!owner) return null
        return (
          <div className="flex flex-wrap gap-1">
            {owner.allStarHost && (
              <Badge variant="warning">⭐ All-Star</Badge>
            )}
            {owner.proHost && (
              <Badge>Pro</Badge>
            )}
          </div>
        )
      }
    },
    {
      header: "Airport Delivery",
      accessorFn: (row: Vehicle) => row.details?.rate?.airportDeliveryLocationsAndFees,
      cell: (info) => {
        const locations = info.getValue() as AirportDeliveryLocation[] | undefined
        if (!locations?.length) return null
        return (
          <BadgePopover 
            badges={locations.map((loc, index) => ({
              id: index,
              label: `${loc.location.code}: ${getCurrencySymbol(loc.feeWithCurrency.currencyCode)}${loc.feeWithCurrency.amount}`
            }))}
          />
        )
      }
    },
    {
      header: "City, State",
      accessorFn: (row: Vehicle) => ({
        city: row.location.city,
        state: row.location.state
      }),
      cell: (info) => {
        const { city, state } = info.getValue() as { city: string, state: string }
        return city && state ? `${city}, ${state}` : city || state || '-'
      }
    },
    {
      header: "Transmission",
      accessorFn: (row: Vehicle) => row.details?.vehicle?.automaticTransmission,
      cell: (info) => {
        const isAutomatic = info.getValue() as boolean | undefined
        if (isAutomatic === undefined) return null
        return (
          <Badge variant={isAutomatic ? "success" : "default"}>
            {isAutomatic ? 'Auto' : 'Manual'}
          </Badge>
        )
      }
    },
    {
      header: "Color",
      accessorFn: (row: Vehicle) => row.details?.color,
      cell: (info) => {
        const color = info.getValue()
        if (!color) return null
        return <ColorCircle color={color} />
      }
    },
    {
      header: "Badges",
      accessorFn: (row: Vehicle) => row.details?.badges,
      cell: (info) => {
        const badges = info.getValue()
        if (!Array.isArray(badges) || badges.length === 0) return null
        return <BadgePopover 
          badges={badges.map(badge => ({
            id: badge.id,
            label: badge.label,
            value: badge.value
          }))} 
        />
      }
    },
    {
      header: "Extras",
      accessorFn: (row: Vehicle) => row.details?.extras.extras,
      cell: (info) => {
        const extras = info.getValue()
        if (!Array.isArray(extras) || extras.length === 0) return null
        return <BadgePopover 
          badges={extras.map((extra, index) => ({
            id: index,
            label: extra.extraType.label,
            value: extra.extraType.label
          }))} 
        />
      }
    },
    {
      header: "Daily Distance",
      accessorFn: (row: Vehicle) => row.details?.rate?.dailyDistance,
      cell: (info) => {
        const distance = info.getValue() as Distance | undefined
        if (!distance) return null
        return `${distance.scalar} ${distance.unit.toLowerCase()}`
      }
    },
    {
      header: "Weekly Distance",
      accessorFn: (row: Vehicle) => row.details?.rate?.weeklyDistance,
      cell: (info) => {
        const distance = info.getValue() as Distance | undefined
        if (!distance) return null
        return `${distance.scalar} ${distance.unit.toLowerCase()}`
      }
    },
    {
      header: "Monthly Distance",
      accessorFn: (row: Vehicle) => row.details?.rate?.monthlyDistance,
      cell: (info) => {
        const distance = info.getValue() as Distance | undefined
        if (!distance) return null
        return `${distance.scalar} ${distance.unit.toLowerCase()}`
      }
    },
    {
      header: "Excess Fee",
      accessorFn: (row: Vehicle) => row.details?.rate?.excessFeePerDistance,
      cell: (info) => {
        const fee = info.getValue() as ExcessFee | undefined
        if (!fee) return null
        return `${getCurrencySymbol(fee.currencyCode)}${fee.amount}`
      }
    },
    {
      header: "Weekly Discount",
      accessorFn: (row: Vehicle) => row.details?.rate?.weeklyDiscountPercentage,
      cell: (info) => {
        const discount = info.getValue() as number | undefined
        if (discount == null) return null
        return `${discount}%`
      }
    },
    {
      header: "Monthly Discount",
      accessorFn: (row: Vehicle) => row.details?.rate?.monthlyDiscountPercentage,
      cell: (info) => {
        const discount = info.getValue() as number | undefined
        if (discount == null) return null
        return `${discount}%`
      }
    },
    {
      header: "Listed",
      accessorFn: (row: Vehicle) => row.details?.vehicle?.listingCreatedTime,
      cell: (info) => {
        const timestamp = info.getValue() as string | undefined
        if (!timestamp) return null
        const date = new Date(timestamp)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    },
    {
      header: "Vehicle ID",
      accessorKey: "id"
    },
    {
      header: "Listing URL",
      accessorFn: (row: Vehicle) => row.details?.vehicle?.url,
      cell: (info) => {
        const url = info.getValue() as string | undefined
        if (!url) return null
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline">
            View
          </a>
        )
      }
    }
  ], [])

  const table = useReactTable({
    data: vehicles,
    columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}>
                  {flexRender(
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
  )
}

export default React.memo(VehicleTable)