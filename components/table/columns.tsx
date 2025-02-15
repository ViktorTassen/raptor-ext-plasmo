import { type ColDef, type ValueGetterParams, type ValueFormatterParams } from "ag-grid-community"
import { Badge } from "~components/ui/badge"
import { RevenueCell } from "~components/table/RevenueCell"
import { InstantBookLocations } from "~components/table/InstantBookLocations"
import { ColorCircle } from "~components/table/ColorCircle"
import { calculateAverageMonthlyRevenue, calculateMonthlyRevenue, calculatePreviousYearRevenue } from "~utils/revenue"
import { getCurrencySymbol } from "~utils/currency"
import { getVehicleTypeDisplay } from "~utils/vehicleTypes"
import type { Distance, ExcessFee, Vehicle } from "~types"

const currencyFormatter = (params: ValueFormatterParams<Vehicle, number>) => {
  if (params.value == null) return '-'
  const currency = params.data?.avgDailyPrice?.currency || 'USD'
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${params.value.toLocaleString()}`
}

export const getColumnDefs = (): ColDef<Vehicle>[] => [
  {
    field: "images",
    headerName: "Image",
    valueGetter: (params: ValueGetterParams<Vehicle>) => params.data?.images?.[0]?.resizeableUrlTemplate || null,
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
    width: 110,
    minWidth: 110,
    maxWidth: 110
  },
  {
    field: "type",
    headerName: "Type",
    valueFormatter: (params) => getVehicleTypeDisplay(params.value),
    minWidth: 90,
    filterParams: {
      filterOptions: ['contains'],
      defaultOption: 'contains'
    },
  },
  {
    field: "make",
    headerName: "Make",
    filter: true,
    filterParams: {
      filterOptions: ['contains'],
      defaultOption: 'contains'
    },
    minWidth: 100
  },
  {
    field: "model",
    headerName: "Model",
    filterParams: {
      filterOptions: ['contains'],
      defaultOption: 'contains'
    },
    minWidth: 100
  },
  {
    field: "details.vehicle.trim",
    headerName: "Trim",
    valueFormatter: (params) => params.value || '-',
    sortable: false,
    filterParams: {
      filterOptions: ['contains'],
      defaultOption: 'contains'
    },
    minWidth: 100
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
    minWidth: 100
  },
  {
    field: "dailyPricing",
    headerName: "Est. Monthly Revenue",
    cellRenderer: RevenueCell,
    width: 250,
    valueFormatter: (params) => {
      if (!params.value || !Array.isArray(params.value)) return "0";
      return `${calculateMonthlyRevenue(params.value).reduce((acc, item) => acc + item.total, 0).toFixed(2)}`;
    },
    minWidth: 240
  },
  {
    field: "avgDailyPrice",
    headerName: "Avg Daily Price",
    valueGetter: (params: ValueGetterParams<Vehicle>) => params.data?.avgDailyPrice?.amount || 0,
    valueFormatter: currencyFormatter,
    filterParams: {
      filterOptions: ["inRange"],
      inRangeInclusive: true,
      maxNumConditions: 1
    },
    minWidth: 120,
    
  },
  {
    headerName: "Avg Monthly",
    valueGetter: (params: ValueGetterParams<Vehicle>) => {
      const dailyPricing = params.data?.dailyPricing
      return !dailyPricing ? 0 : calculateAverageMonthlyRevenue(dailyPricing)
    },
    valueFormatter: currencyFormatter,
    filterParams: {
      filterOptions: ["inRange"],
      inRangeInclusive: true,
      maxNumConditions: 1
    },
    minWidth: 140
  },
  {
    headerName: "Prev Year",
    valueGetter: (params: ValueGetterParams<Vehicle>) => {
      const dailyPricing = params.data?.dailyPricing
      return !dailyPricing ? 0 : calculatePreviousYearRevenue(dailyPricing)
    },
    valueFormatter: currencyFormatter,
    filterParams: {
      filterOptions: ["inRange"],
      inRangeInclusive: true,
      maxNumConditions: 1
    },
    minWidth: 120
  },
  {
    field: "details.marketValue.below",
    headerName: "Avg Market Value",
    valueFormatter: currencyFormatter,
    filterParams: {
      filterOptions: ["inRange"],
      inRangeInclusive: true,
      maxNumConditions: 1
    },
    minWidth: 120
  },
  {
    headerName: "Days on Turo",
    valueGetter: (params: ValueGetterParams<Vehicle>) => {
      const listingDate = params.data?.details?.vehicle?.listingCreatedTime
      if (!listingDate) return 0
      const created = new Date(listingDate)
      const today = new Date()
      const diffTime = Math.abs(today.getTime() - created.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    },
    valueFormatter: (params) => params.value.toString(),
    filterParams: {
      filterOptions: ["inRange"],
      inRangeInclusive: true,
      maxNumConditions: 1
    },
    minWidth: 120
  },
  {
    field: "completedTrips",
    headerName: "Trips",
    filterParams: {
      filterOptions: ["inRange"],
      inRangeInclusive: true,
      maxNumConditions: 1
    },
    minWidth: 100
  },
  {
    field: "details.numberOfFavorites",
    headerName: "Favs",
    filterParams: {
      filterOptions: ["inRange"],
      inRangeInclusive: true,
      maxNumConditions: 1
    },
    minWidth: 80
  },
  {
    field: "rating",
    headerName: "Rating",
    valueFormatter: (params) => {
      const rating = params.value
      if (rating == null) return null
      return `${rating.toFixed(1)}★`
    },
    filter: false,
    minWidth: 100
  },
  {
    field: "details.numberOfReviews",
    headerName: "Reviews",
    filterParams: {
      filterOptions: ["inRange"],
      inRangeInclusive: true,
      maxNumConditions: 1
    },
    minWidth: 100
  },
  {
    field: "details.instantBookLocationPreferences",
    headerName: "Instant Book",
    valueFormatter: (params) => {
      if (params.value == null) return null
    },
    cellRenderer: (params) => {
      if (!params.value) return null
      return (
          <InstantBookLocations preferences={params.value} />
      )
    },
    filter: false,
    minWidth: 160
  },
  {
    field: "details.owner",
    headerName: "Host",
    valueGetter: (params: ValueGetterParams<Vehicle>) => params.data?.details?.owner?.name || '',
    valueFormatter: (params) => params.value,
    filter: false,
    minWidth: 120
  },
  {
    field: "details.hostTakeRate",
    headerName: "P Plan",
    valueFormatter: (params) => {
      if (params.value == null) return null
      return `${(params.value * 100).toFixed(0)}%`
    },
    filter: false,
    minWidth: 100
  },
  {
    field: "hostId",
    headerName: "Host ID",
    filterParams: {
      filterOptions: ['contains'],
      defaultOption: 'contains'
    },
    minWidth: 80
  },
  {
    field: "details.owner",
    headerName: "Host Status",
    valueGetter: (params: ValueGetterParams<Vehicle>) => {
      const owner = params.data?.details?.owner;
      if (!owner) return '';
      const statuses = [];
      if (owner.allStarHost) statuses.push('⭐ All-Star');
      if (owner.proHost) statuses.push('Pro');
      return statuses.join(', ');
    },
    valueFormatter: (params) => params.value,
    filterParams: {
      filterOptions: ['contains'],
      defaultOption: 'contains'
    },
    minWidth: 100
  },
  {
    field: "details.rate.airportDeliveryLocationsAndFees",
    headerName: "Airport Delivery",
    valueFormatter: (params) => {
      if (!params.value?.length) return ''
      return params.value.map((loc: any) => 
        `${loc.location.code}(${getCurrencySymbol(loc.feeWithCurrency.currencyCode)}${loc.feeWithCurrency.amount})`
      ).join(', ')
    },
    filter: false,
    sortable: false,
    minWidth: 100
  },
  {
    field: "details.extras.extras",
    headerName: "Extras",
    valueFormatter: (params) => {
      if (!params.value?.length) return ''
      return params.value.map((extra: any) => extra.extraType.label).join(', ')
    },
    minWidth: 100
  },
  {
    field: "details.badges",
    headerName: "Badges",
    valueFormatter: (params) => {
      if (!params.value?.length) return ''
      return params.value.map((badge: any) => badge.label).join(', ')
    },
    minWidth: 100
  },
  {
    field: "location",
    headerName: "City, State",
    valueGetter: (params: ValueGetterParams<Vehicle>) => {
      const location = params.data?.location
      return location?.city && location?.state ? `${location.city}, ${location.state}` : location?.city || location?.state || '-'
    },
    valueFormatter: (params) => params.value,
    minWidth: 100,
    filterParams: {
      filterOptions: ['contains'],
      defaultOption: 'contains'
    },
  },
  {
    field: "details.vehicle.automaticTransmission",
    headerName: "Transmission",
    cellRenderer: (params) => {
      if (params.value === undefined) return null
      return params.value ? `Auto` : `Manual`
    },
    minWidth: 80,
    filterParams: {
      filterOptions: ['contains'],
      defaultOption: 'contains'
    },
  },
  {
    field: "details.color",
    headerName: "Color",
    valueFormatter: (params) => params.value || '-',
    cellRenderer: (params) => {
      if (!params.value) return null
      return <ColorCircle color={params.value} />
    },
    minWidth: 60,
    filter: false,
  },
  {
    field: "details.rate.dailyDistance",
    headerName: "Daily Distance",
    valueFormatter: (params) => {
      const distance = params.value as Distance | undefined
      if (!distance) return null
      return `${distance.scalar} ${distance.unit.toLowerCase()}`
    },
    minWidth: 100,
    filter: false,
  },
  {
    field: "details.rate.weeklyDistance",
    headerName: "Weekly Distance",
    valueFormatter: (params) => {
      const distance = params.value as Distance | undefined
      if (!distance) return null
      return `${distance.scalar} ${distance.unit.toLowerCase()}`
    },
    minWidth: 100,
    filter: false,
  },
  {
    field: "details.rate.monthlyDistance",
    headerName: "Monthly Distance",
    valueFormatter: (params) => {
      const distance = params.value as Distance | undefined
      if (!distance) return null
      return `${distance.scalar} ${distance.unit.toLowerCase()}`
    },
    minWidth: 100,
    filter: false,
  },
  {
    field: "details.rate.excessFeePerDistance",
    headerName: "Excess Fee",
    valueGetter: (params: ValueGetterParams<Vehicle>) => {
      const fee = params.data?.details?.rate?.excessFeePerDistance
      if (!fee) return 0
      return fee.amount
    },
    valueFormatter: currencyFormatter,
    minWidth: 100,
    filter: false,
  },
  {
    field: "details.rate.weeklyDiscountPercentage",
    headerName: "Weekly Discount",
    valueFormatter: (params) => {
      if (params.value == null) return null
      return `${params.value}%`
    },
    minWidth: 100,
    filter: false,
  },
  {
    field: "details.rate.monthlyDiscountPercentage",
    headerName: "Monthly Discount",
    valueFormatter: (params) => {
      if (params.value == null) return null
      return `${params.value}%`
    },
    minWidth: 100,
    filter: false,
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
    },
    minWidth: 120
  },
  {
    field: "id",
    headerName: "Vehicle ID",
    filter: false,
    sortable: false,
    minWidth: 60
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
    valueFormatter: (params) => params.value,
    filter: false,
    sortable: false,
    minWidth: 100
  }
]