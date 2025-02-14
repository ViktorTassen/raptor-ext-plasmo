import { type ColDef } from "ag-grid-community"
import { Badge } from "~components/ui/badge"
import { RevenueCell } from "~components/table/RevenueCell"
import { InstantBookLocations } from "~components/table/InstantBookLocations"
import { ColorCircle } from "~components/table/ColorCircle"
import { calculateAverageMonthlyRevenue, calculateMonthlyRevenue, calculatePreviousYearRevenue } from "~utils/revenue"
import { getCurrencySymbol } from "~utils/currency"
import { getVehicleTypeDisplay } from "~utils/vehicleTypes"
import type { Distance, ExcessFee, Vehicle } from "~types"

export const getColumnDefs = (): ColDef[] => [
  {
    field: "images",
    headerName: "Image",
    valueGetter: (params) => params.data.images?.[0]?.resizeableUrlTemplate || null,
    cellRenderer: (params) => {
      const urlTemplate = params.value;
      if (!urlTemplate) return null;
      const imageUrl = urlTemplate.replace('{width}x{height}', '100x60');
      return (
        <img
          src={imageUrl}
          alt="Vehicle"
          className="h-8 w-20 object-cover rounded"
        />
      );
    },
    sortable: false,
    resizable: false,
    filter: false,
    width: 110
  },
  {
    field: "type",
    headerName: "Type",
    valueFormatter: (params) => getVehicleTypeDisplay(params.value)
  },
  {
    field: "make",
    headerName: "Make",
    filter: true,
    filterParams: {
      filterOptions: ['contains'],
      defaultOption: 'contains'
    }
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
    headerName: "Year",
    filter: "agNumberColumnFilter",
    filterParams: {
      filterOptions: ["inRange"],
      inRangeInclusive: true,
      maxNumConditions: 1
    },
  },
  {
    field: "dailyPricing",
    headerName: "Est. Monthly Revenue",
    cellRenderer: RevenueCell,
    width: 250,
    valueFormatter: (params) => {
      if (!params.value || !Array.isArray(params.value)) return "0";
      return `$${calculateMonthlyRevenue(params.value).reduce((acc, item) => acc + item.total, 0).toFixed(2)}`;
    }
  },
  {
    field: "avgDailyPrice",
    headerName: "Avg Daily Price",
    valueFormatter: (params) => {
      if (!params.value) return '-'
      return `${getCurrencySymbol(params.value.currency)}${params.value.amount}`
    }
  },
  {
    headerName: "Avg Monthly",
    valueGetter: (params) => {
      const dailyPricing = params.data.dailyPricing
      const amount = !dailyPricing ? 0 : calculateAverageMonthlyRevenue(dailyPricing)
      const currency = params.data.avgDailyPrice?.currency || 'USD'
      return `${getCurrencySymbol(currency)}${amount.toLocaleString()}`
    },
    valueFormatter: (params) => params.value // Ensure the value is formatted as a string
  },
  {
    headerName: "Prev Year",
    valueGetter: (params) => {
      const dailyPricing = params.data.dailyPricing
      const amount = !dailyPricing ? 0 : calculatePreviousYearRevenue(dailyPricing)
      const currency = params.data.avgDailyPrice?.currency || 'USD'
      return `${getCurrencySymbol(currency)}${amount.toLocaleString()}`
    },
    valueFormatter: (params) => params.value // Ensure the value is formatted as a string
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
    },
    valueFormatter: (params) => params.value.toString() // Ensure the value is formatted as a string
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
    valueFormatter: (params) => {
      const rating = params.value
      if (rating == null) return null
      return `${rating.toFixed(1)}★`
    }
  },
  {
    field: "details.numberOfReviews",
    headerName: "Reviews"
  },
  {
    field: "details.instantBookLocationPreferences",
    headerName: "Instant Book",
    valueFormatter: (params) => {
      if (params.value == null) return null
    },
    cellRenderer: (params) => {
      if (!params.value) return null
      console.log(params)
      return (
          <InstantBookLocations preferences={params.value} />
      )
    },
  },
  {
    field: "details.owner",
    headerName: "Host",
    valueGetter: (params) => params.data?.details?.owner?.name || '',
    valueFormatter: (params) => params.value // Ensure the value is formatted as a string
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
    valueGetter: (params) => {
      const owner = params.data?.details?.owner;
      if (!owner) return '';
      const statuses = [];
      if (owner.allStarHost) statuses.push('⭐ All-Star');
      if (owner.proHost) statuses.push('Pro');
      return statuses.join(', ');
    },
    valueFormatter: (params) => params.value // Ensure the value is formatted as a string
  },
  {
    field: "details.rate.airportDeliveryLocationsAndFees",
    headerName: "Airport Delivery",
    valueFormatter: (params) => {
      if (!params.value?.length) return ''
      return params.value.map((loc: any) => 
        `${loc.location.code}(${getCurrencySymbol(loc.feeWithCurrency.currencyCode)}${loc.feeWithCurrency.amount})`
      ).join(', ')
    }
  },
  {
    field: "details.extras.extras",
    headerName: "Extras",
    valueFormatter: (params) => {
      if (!params.value?.length) return ''
      return params.value.map((extra: any) => extra.extraType.label).join(', ')
    }
  },
  {
    field: "details.badges",
    headerName: "Badges",
    valueFormatter: (params) => {
      if (!params.value?.length) return ''
      return params.value.map((badge: any) => badge.label).join(', ')
    }
  },
  {
    field: "location",
    headerName: "City, State",
    valueGetter: (params) => {
      const location = params.data.location
      return location?.city && location?.state ? `${location.city}, ${location.state}` : location?.city || location?.state || '-'
    },
    valueFormatter: (params) => params.value // Ensure the value is formatted as a string
  },
  {
    field: "details.vehicle.automaticTransmission",
    headerName: "Transmission",
    cellRenderer: (params) => {
      if (params.value === undefined) return null
      return params.value ? `Auto` : `Manual`
    }
  },
  {
    field: "details.color",
    headerName: "Color",
    valueFormatter: (params) => params.value || '-',
    cellRenderer: (params) => {
      if (!params.value) return null
      return <ColorCircle color={params.value} />
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
    },
    valueFormatter: (params) => params.value // Ensure the value is formatted as a string
  }
]