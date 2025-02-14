import { type ColDef } from "ag-grid-community"
import { Badge } from "~components/ui/badge"
import { BadgePopover } from "~components/table/BadgePopover"
import { RevenueCell } from "~components/table/RevenueCell"
import { InstantBookLocations } from "~components/table/InstantBookLocations"
import { ColorCircle } from "~components/table/ColorCircle"
import { calculateAverageMonthlyRevenue, calculatePreviousYearRevenue } from "~utils/revenue"
import { getCurrencySymbol } from "~utils/currency"
import { getVehicleTypeDisplay } from "~utils/vehicleTypes"
import type { Vehicle, VehicleOwner, Distance, ExcessFee, AirportDeliveryLocation } from "~types"

export const getColumnDefs = (): ColDef[] => [
  {
    field: "images",
    headerName: "Image",
    cellRenderer: (params) => {
      const urlTemplate = params.data.images[0]?.resizeableUrlTemplate
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
    sortable: false,
    width: 120
  },
  {
    field: "type",
    headerName: "Type",
    valueFormatter: (params) => getVehicleTypeDisplay(params.value)
  },
  {
    field: "make",
    headerName: "Make"
  },
  {
    field: "model",
    headerName: "Model"
  },
  {
    field: "details.vehicle.trim",
    headerName: "Trim",
    valueFormatter: (params) => params.value || '-'
  },
  {
    field: "year",
    headerName: "Year"
  },
  {
    field: "dailyPricing",
    headerName: "Est. Monthly Revenue",
    cellRenderer: RevenueCell,
    width: 220,
    sortable: false,
    cellStyle: { 
      display: 'flex',
      alignItems: 'center',
      padding: '5px'
    }
  },
  {
    headerName: "Avg Monthly",
    valueGetter: (params) => {
      const dailyPricing = params.data.dailyPricing
      const amount = !dailyPricing ? 0 : calculateAverageMonthlyRevenue(dailyPricing)
      const currency = params.data.avgDailyPrice?.currency || 'USD'
      return `${getCurrencySymbol(currency)}${amount.toLocaleString()}`
    }
  },
  {
    headerName: "Prev Year",
    valueGetter: (params) => {
      const dailyPricing = params.data.dailyPricing
      const amount = !dailyPricing ? 0 : calculatePreviousYearRevenue(dailyPricing)
      const currency = params.data.avgDailyPrice?.currency || 'USD'
      return `${getCurrencySymbol(currency)}${amount.toLocaleString()}`
    }
  },
  {
    field: "details.marketValue.below",
    headerName: "Avg Market Value",
    valueFormatter: (params) => {
      if (!params.value) return '-'
      return `$${params.value.toFixed(0).toLocaleString()}`
    }
  },
  {
    headerName: "Days on Turo",
    valueGetter: (params) => {
      const listingDate = params.data.details?.vehicle?.listingCreatedTime
      if (!listingDate) return 0
      const created = new Date(listingDate)
      const today = new Date()
      const diffTime = Math.abs(today.getTime() - created.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
  },
  {
    field: "completedTrips",
    headerName: "Trips"
  },
  {
    field: "details.numberOfFavorites",
    headerName: "Favs"
  },
  {
    field: "rating",
    headerName: "Rating",
    cellRenderer: (params) => {
      const rating = params.value
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
    field: "details.numberOfReviews",
    headerName: "Reviews"
  },
  {
    field: "details.instantBookLocationPreferences",
    headerName: "Instant Book",
    cellRenderer: (params) => {
      if (!params.value) return null
      return <InstantBookLocations preferences={params.value} />
    }
  },
  {
    field: "details.owner",
    headerName: "Host",
    cellRenderer: (params) => {
      const owner = params.value as VehicleOwner | undefined
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
    field: "details.hostTakeRate",
    headerName: "P Plan",
    valueFormatter: (params) => {
      if (params.value == null) return null
      return `${(params.value * 100).toFixed(0)}%`
    }
  },
  {
    field: "hostId",
    headerName: "Host ID"
  },
  {
    field: "details.owner",
    headerName: "Host Status",
    cellRenderer: (params) => {
      const owner = params.value as VehicleOwner | undefined
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
    field: "details.rate.airportDeliveryLocationsAndFees",
    headerName: "Airport Delivery",
    cellRenderer: (params) => {
      const locations = params.value as AirportDeliveryLocation[] | undefined
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
    headerName: "City, State",
    valueGetter: (params) => {
      const city = params.data.location.city
      const state = params.data.location.state
      return city && state ? `${city}, ${state}` : city || state || '-'
    }
  },
  {
    field: "details.vehicle.automaticTransmission",
    headerName: "Transmission",
    cellRenderer: (params) => {
      const isAutomatic = params.value
      if (isAutomatic === undefined) return null
      return (
        <Badge variant={isAutomatic ? "success" : "default"}>
          {isAutomatic ? 'Auto' : 'Manual'}
        </Badge>
      )
    }
  },
  {
    field: "details.color",
    headerName: "Color",
    cellRenderer: (params) => {
      if (!params.value) return null
      return <ColorCircle color={params.value} />
    }
  },
  {
    field: "details.badges",
    headerName: "Badges",
    cellRenderer: (params) => {
      const badges = params.value
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
    field: "details.extras.extras",
    headerName: "Extras",
    cellRenderer: (params) => {
      const extras = params.value
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
    field: "details.rate.dailyDistance",
    headerName: "Daily Distance",
    valueFormatter: (params) => {
      const distance = params.value as Distance | undefined
      if (!distance) return null
      return `${distance.scalar} ${distance.unit.toLowerCase()}`
    }
  },
  {
    field: "details.rate.weeklyDistance",
    headerName: "Weekly Distance",
    valueFormatter: (params) => {
      const distance = params.value as Distance | undefined
      if (!distance) return null
      return `${distance.scalar} ${distance.unit.toLowerCase()}`
    }
  },
  {
    field: "details.rate.monthlyDistance",
    headerName: "Monthly Distance",
    valueFormatter: (params) => {
      const distance = params.value as Distance | undefined
      if (!distance) return null
      return `${distance.scalar} ${distance.unit.toLowerCase()}`
    }
  },
  {
    field: "details.rate.excessFeePerDistance",
    headerName: "Excess Fee",
    valueFormatter: (params) => {
      const fee = params.value as ExcessFee | undefined
      if (!fee) return null
      return `${getCurrencySymbol(fee.currencyCode)}${fee.amount}`
    }
  },
  {
    field: "details.rate.weeklyDiscountPercentage",
    headerName: "Weekly Discount",
    valueFormatter: (params) => {
      if (params.value == null) return null
      return `${params.value}%`
    }
  },
  {
    field: "details.rate.monthlyDiscountPercentage",
    headerName: "Monthly Discount",
    valueFormatter: (params) => {
      if (params.value == null) return null
      return `${params.value}%`
    }
  },
  {
    field: "details.vehicle.listingCreatedTime",
    headerName: "Listed",
    valueFormatter: (params) => {
      if (!params.value) return null
      const date = new Date(params.value)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  },
  {
    field: "id",
    headerName: "Vehicle ID"
  },
  {
    field: "details.vehicle.url",
    headerName: "Listing URL",
    cellRenderer: (params) => {
      if (!params.value) return null
      return (
        <a
          href={params.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline">
          View
        </a>
      )
    }
  }
]