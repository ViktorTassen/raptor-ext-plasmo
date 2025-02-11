import React, { useState, useMemo } from "react"
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type ColumnDef,
    flexRender
} from "@tanstack/react-table"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import type {
    Vehicle,
    DailyPricing,
    VehicleBadge,
    VehicleOwner,
    InstantBookLocationPreferences,
    AirportDeliveryLocation,
    Distance,
    ExcessFee
} from "~types"

interface VehicleTableProps {
    vehicles: Vehicle[]
}

const VehicleTable = ({ vehicles }: VehicleTableProps) => {
    const [sorting, setSorting] = useState<any[]>([])

    // Updated function signature with proper typing
    const calculateMonthlyRevenue = (dailyPricing: DailyPricing[] | undefined) => {
        if (!dailyPricing) return []

        // Get last 12 months
        const today = new Date()
        const months: { [key: string]: number } = {}
        
        for (let i = 0; i < 12; i++) {
            const d = new Date(today)
            d.setMonth(d.getMonth() - i)
            const monthKey = d.toISOString().substring(0, 7) // YYYY-MM format
            months[monthKey] = 0
        }

        // Group consecutive unavailable days
        let consecutiveDays: DailyPricing[] = []
        dailyPricing.forEach((day, index) => {
            if (day.wholeDayUnavailable) {
                consecutiveDays.push(day)
                
                // Check if this is the last day or next day is available
                const isLastDay = index === dailyPricing.length - 1
                const nextDayAvailable = !isLastDay && !dailyPricing[index + 1].wholeDayUnavailable
                
                if (isLastDay || nextDayAvailable) {
                    // Process this booking
                    if (consecutiveDays.length === 1) {
                        // Single day - count as 2-day booking if surrounded by available days
                        const prevDayAvailable = index === 0 || !dailyPricing[index - 1].wholeDayUnavailable
                        const revenue = consecutiveDays[0].price * (prevDayAvailable && nextDayAvailable ? 2 : 1)
                        const monthKey = consecutiveDays[0].date.substring(0, 7)
                        if (months[monthKey] !== undefined) {
                            months[monthKey] += revenue
                        }
                    } else {
                        // Multiple days - count as length + 1 for pickup/dropoff
                        const totalRevenue = consecutiveDays.reduce((sum, day) => sum + day.price, 0)
                        const monthKey = consecutiveDays[0].date.substring(0, 7)
                        if (months[monthKey] !== undefined) {
                            months[monthKey] += totalRevenue * (consecutiveDays.length + 1) / consecutiveDays.length
                        }
                    }
                    consecutiveDays = []
                }
            }
        })

        // Convert to chart data format
        return Object.entries(months)
            .map(([month, revenue]) => ({
                month: month.substring(5, 7) + '/' + month.substring(2, 4), // MM/YY format
                revenue: Math.round(revenue)
            }))
            .reverse() // Show oldest to newest
    }

    const columns: ColumnDef<Vehicle>[] = [
        {
            header: "Image",
            accessorFn: (row: Vehicle) => row.images[0]?.originalImageUrl,
            cell: (info) => (
                <img
                    src={info.getValue() as string}
                    alt="Vehicle"
                    className="h-16 w-24 object-cover rounded"
                />
            ),
            enableSorting: false
        },
        {
            header: "Type",
            accessorKey: "type"
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
            header: "Year",
            accessorKey: "year"
        },
        {
            header: "Trim",
            accessorFn: (row: Vehicle) => row.details?.vehicle?.trim,
            cell: (info) => {
                const trim = info.getValue() as string | undefined
                if (!trim) return '-'
                return trim
            }
        },
        {
            header: "Transmission",
            accessorFn: (row: Vehicle) => row.details?.vehicle?.automaticTransmission,
            cell: (info) => {
                const isAutomatic = info.getValue() as boolean | undefined
                if (isAutomatic === undefined) return null
                return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isAutomatic
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                        {isAutomatic ? 'Automatic' : 'Manual'}
                    </span>
                )
            }
        },
        {
            header: "City",
            accessorFn: (row: Vehicle) => row.location.city
        },
        {
            header: "State",
            accessorFn: (row: Vehicle) => row.location.state
        },
        {
            header: "Trips",
            accessorKey: "completedTrips"
        },
        {
            header: "Host",
            accessorFn: (row: Vehicle) => row.details?.owner,
            cell: (info) => {
                const owner = info.getValue() as VehicleOwner | undefined
                if (!owner) return null
                return (
                    <div className="flex items-center space-x-2">
                        <img
                            src={owner.imageUrl}
                            alt={owner.name}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                        <span>{owner.name}</span>
                    </div>
                )
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⭐ All-Star Host
                            </span>
                        )}
                        {owner.proHost && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Pro Host
                            </span>
                        )}
                    </div>
                )
            }
        },
        {
            header: "Badges",
            accessorFn: (row: Vehicle) => row.details?.badges,
            cell: (info) => {
                const badges = info.getValue() as VehicleBadge[] | undefined
                if (!badges?.length) return null
                return (
                    <div className="flex flex-wrap gap-1">
                        {badges.map((badge) => (
                            <span
                                key={badge.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {badge.label}
                            </span>
                        ))}
                    </div>
                )
            }
        },
        {
            header: "Color",
            accessorFn: (row: Vehicle) => row.details?.color
        },
        {
            header: "Host Take Rate",
            accessorFn: (row: Vehicle) => row.details?.hostTakeRate,
            cell: (info) => {
                const rate = info.getValue() as number | undefined
                if (rate == null) return null
                return `${(rate * 100).toFixed(1)}%`
            }
        },
        {
            header: "Extras",
            accessorFn: (row: Vehicle) => row.details?.extras.extras,
            cell: (info) => {
                const extras = info.getValue() as Array<{ extraType: { label: string } }> | undefined
                if (!extras?.length) return null
                return (
                    <div className="flex flex-wrap gap-1">
                        {extras.map((extra, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                {extra.extraType.label}
                            </span>
                        ))}
                    </div>
                )
            }
        },
        {
            header: "Instant Book Locations",
            accessorFn: (row: Vehicle) => row.details?.instantBookLocationPreferences,
            cell: (info) => {
                const prefs = info.getValue() as InstantBookLocationPreferences | undefined
                if (!prefs) return null

                const locations = [
                    { enabled: prefs.airportLocationEnabled, label: "Airport", color: "indigo" },
                    { enabled: prefs.customLocationEnabled, label: "Custom", color: "pink" },
                    { enabled: prefs.homeLocationEnabled, label: "Home", color: "orange" },
                    { enabled: prefs.poiLocationEnabled, label: "Point of Interest", color: "teal" }
                ]

                return (
                    <div className="flex flex-wrap gap-1">
                        {locations
                            .filter(loc => loc.enabled)
                            .map(loc => (
                                <span
                                    key={loc.label}
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${loc.color}-100 text-${loc.color}-800`}>
                                    {loc.label}
                                </span>
                            ))}
                    </div>
                )
            }
        },
        {
            header: "Min Age",
            accessorFn: (row: Vehicle) => row.details?.minimumAgeInYearsToRent,
            cell: (info) => {
                const age = info.getValue() as number | undefined
                if (age == null) return null
                return `${age} years`
            }
        },
        {
            header: "Favorites",
            accessorFn: (row: Vehicle) => row.details?.numberOfFavorites
        },
        {
            header: "Rentals",
            accessorFn: (row: Vehicle) => row.details?.numberOfRentals
        },
        {
            header: "Reviews",
            accessorFn: (row: Vehicle) => row.details?.numberOfReviews
        },
        {
            header: "Excess Fee Per Distance",
            accessorFn: (row: Vehicle) => row.details?.rate?.excessFeePerDistance,
            cell: (info) => {
                const fee = info.getValue() as ExcessFee | undefined
                if (!fee) return null
                return `${fee.amount} ${fee.currencyCode}`
            }
        },
        {
            header: "Airport Delivery",
            accessorFn: (row: Vehicle) => row.details?.rate?.airportDeliveryLocationsAndFees,
            cell: (info) => {
                const locations = info.getValue() as AirportDeliveryLocation[] | undefined
                if (!locations?.length) return null
                return (
                    <div className="flex flex-col gap-1">
                        {locations.map((loc, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {loc.location.code}: {loc.feeWithCurrency.amount} {loc.feeWithCurrency.currencyCode}
                            </span>
                        ))}
                    </div>
                )
            }
        },
        {
            header: "Daily Distance",
            accessorFn: (row: Vehicle) => row.details?.rate?.dailyDistance,
            cell: (info) => {
                const distance = info.getValue() as Distance | undefined
                if (!distance) return null
                return `${distance.scalar} ${distance.unit}`
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
            header: "Monthly Distance",
            accessorFn: (row: Vehicle) => row.details?.rate?.monthlyDistance,
            cell: (info) => {
                const distance = info.getValue() as Distance | undefined
                if (!distance) return null
                return `${distance.scalar} ${distance.unit}`
            }
        },
        {
            header: "Monthly Mileage",
            accessorFn: (row: Vehicle) => row.details?.rate?.monthlyMileage,
            cell: (info) => {
                const mileage = info.getValue() as number | undefined
                if (mileage == null) return null
                return mileage.toLocaleString()
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
            header: "Weekly Distance",
            accessorFn: (row: Vehicle) => row.details?.rate?.weeklyDistance,
            cell: (info) => {
                const distance = info.getValue() as Distance | undefined
                if (!distance) return null
                return `${distance.scalar} ${distance.unit}`
            }
        },
        {
            header: "Rating",
            accessorKey: "rating",
            cell: (info) => {
                const rating = info.getValue() as number;
                if (rating == null) return null
                return (
                    <div className="flex items-center">
                        <span className="mr-1">{rating.toFixed(2)}</span>
                        <span className="text-yellow-400">★</span>
                    </div>
                )
            }
        },
        {
            header: "Cleanliness",
            accessorFn: (row: Vehicle) =>
                row.details?.ratings?.histogram.buckets.find(b => b.category === 'CLEANLINESS')?.averageRating,
            cell: (info) => {
                const rating = info.getValue() as number | undefined
                if (rating == null) return null
                return (
                    <div className="flex items-center">
                        <span className="mr-1">{rating.toFixed(1)}</span>
                        <span className="text-yellow-400">★</span>
                    </div>
                )
            }
        },
        {
            header: "Maintenance",
            accessorFn: (row: Vehicle) =>
                row.details?.ratings?.histogram.buckets.find(b => b.category === 'MAINTENANCE')?.averageRating,
            cell: (info) => {
                const rating = info.getValue() as number | undefined
                if (rating == null) return null
                return (
                    <div className="flex items-center">
                        <span className="mr-1">{rating.toFixed(1)}</span>
                        <span className="text-yellow-400">★</span>
                    </div>
                )
            }
        },
        {
            header: "Communication",
            accessorFn: (row: Vehicle) =>
                row.details?.ratings?.histogram.buckets.find(b => b.category === 'COMMUNICATION')?.averageRating,
            cell: (info) => {
                const rating = info.getValue() as number | undefined
                if (rating == null) return null
                return (
                    <div className="flex items-center">
                        <span className="mr-1">{rating.toFixed(1)}</span>
                        <span className="text-yellow-400">★</span>
                    </div>
                )
            }
        },
        {
            header: "Convenience",
            accessorFn: (row: Vehicle) =>
                row.details?.ratings?.histogram.buckets.find(b => b.category === 'CONVENIENCE')?.averageRating,
            cell: (info) => {
                const rating = info.getValue() as number | undefined
                if (rating == null) return null
                return (
                    <div className="flex items-center">
                        <span className="mr-1">{rating.toFixed(1)}</span>
                        <span className="text-yellow-400">★</span>
                    </div>
                )
            }
        },
        {
            header: "Accuracy",
            accessorFn: (row: Vehicle) =>
                row.details?.ratings?.histogram.buckets.find(b => b.category === 'LISTING_ACCURACY')?.averageRating,
            cell: (info) => {
                const rating = info.getValue() as number | undefined
                if (rating == null) return null
                return (
                    <div className="flex items-center">
                        <span className="mr-1">{rating.toFixed(1)}</span>
                        <span className="text-yellow-400">★</span>
                    </div>
                )
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
                        View Listing
                    </a>
                )
            }
        },
        {
            header: "Est. Monthly Revenue",
            accessorFn: (row: Vehicle) => row.dailyPricing,
            cell: (info) => {
                const dailyPricing = info.getValue()
                if (!dailyPricing) return null

                const data = calculateMonthlyRevenue(dailyPricing as any)
                const totalRevenue = data.reduce((sum, month) => sum + month.revenue, 0)

                const filteredData = data.filter(month => month.revenue !== 0); // Exclude months with revenue = 0
                const totalRevenueFiltered = filteredData.reduce((sum, month) => sum + month.revenue, 0);
                const avgMonthlyRevenueFiltered = filteredData.length > 0 
                ? Math.round(totalRevenueFiltered / filteredData.length) 
                : 0; // Handle division by zero

                return (
                    <div className="w-[300px] h-[100px]">
                        <div className="text-sm font-medium mb-1">
                            Avg: ${avgMonthlyRevenueFiltered.toLocaleString()}
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fontSize: 10 }}
                                    interval={1}
                                />
                                <YAxis 
                                    tick={{ fontSize: 10 }}
                                    width={40}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                                    labelFormatter={(label) => `Month: ${label}`}
                                />
                                <Bar dataKey="revenue" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )
            }
        }
    ]

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
        <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                  `}
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                    {{
                                        asc: ' 🔼',
                                        desc: ' 🔽'
                                    }[header.column.getIsSorted() as string] ?? null}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default VehicleTable