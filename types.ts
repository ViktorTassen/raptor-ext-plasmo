export interface RecordingState {
  isRecording: boolean
  listName: string
}

export interface VehiclePrice {
  amount: number
  currency: string
}

export interface VehicleLocation {
  city: string
  country: string
  state: string
  homeLocation: {
    lat: number
    lng: number
  }
}

export interface VehicleBadge {
  id: number
  label: string
  value: string
}

export interface VehicleOwner {
  id: number
  name: string
  allStarHost: boolean
  proHost: boolean
  imageUrl: string
}

export interface InstantBookLocationPreferences {
  airportLocationEnabled: boolean
  customLocationEnabled: boolean
  homeLocationEnabled: boolean
  poiLocationEnabled: boolean
}

export interface Distance {
  scalar: number
  unit: string
}

export interface ExcessFee {
  amount: number
  currencyCode: string
}

export interface AirportDeliveryLocation {
  location: {
    code: string
    name: string
  }
  feeWithCurrency: {
    amount: number
    currencyCode: string
  }
}

export interface VehicleRate {
  airportDeliveryLocationsAndFees: AirportDeliveryLocation[]
  dailyDistance: Distance
  excessFeePerDistance: VehiclePrice
  monthlyDiscountPercentage: number
  monthlyDistance: Distance
  monthlyMileage: number
  weeklyDiscountPercentage: number
  weeklyDistance: Distance
}


export interface MarketValue {
  below: number
  average: number
  above: number
}

export interface VehicleDetails {
  badges: VehicleBadge[]
  color: string
  hostTakeRate: number
  extras: {
    extras: {
      extraType: {
        label: string
      }
    }[]
  }
  minimumAgeInYearsToRent: number
  numberOfFavorites: number
  numberOfRentals: number
  numberOfReviews: number
  owner: VehicleOwner
  instantBookLocationPreferences: InstantBookLocationPreferences
  rate: VehicleRate
  tripCount: number
  vehicle: {
    automaticTransmission: boolean
    listingCreatedTime: string
    trim: string
    url: string
  }
  marketValue?: MarketValue
}

export interface DailyPricing {
  date: string
  price: number
  custom: boolean
  wholeDayUnavailable: boolean
}

export interface Vehicle {
  id: number
  avgDailyPrice: VehiclePrice
  completedTrips: number
  hostId: number
  images: {
    resizeableUrlTemplate: string
  }[]
  isAllStarHost: boolean
  isNewListing: boolean
  location: VehicleLocation
  make: string
  model: string
  rating: number
  tags: string[]
  type: string
  year: number
  details?: VehicleDetails
  dailyPricing?: DailyPricing[]
  isEnriched?: boolean
}

export interface EnrichmentProgress {
  current: number
  total: number
  isProcessing: boolean
}