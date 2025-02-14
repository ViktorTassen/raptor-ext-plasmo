import React from "react"
import { Plane, Home, MapPin, Building2 } from "lucide-react"

interface InstantBookLocationsProps {
  preferences?: {
    airportLocationEnabled?: boolean
    customLocationEnabled?: boolean
    homeLocationEnabled?: boolean
    poiLocationEnabled?: boolean
  }
}

export function InstantBookLocations({ preferences }: InstantBookLocationsProps) {
  if (!preferences) return null

  const locations = [
    {
      enabled: preferences.airportLocationEnabled || false,
      label: "Airport",
      icon: Plane
    },
    {
      enabled: preferences.customLocationEnabled || false,
      label: "Custom Location",
      icon: MapPin
    },
    {
      enabled: preferences.homeLocationEnabled || false,
      label: "Home Location",
      icon: Home
    },
    {
      enabled: preferences.poiLocationEnabled || false,
      label: "Points of Interest",
      icon: Building2
    }
  ].filter(loc => loc.enabled)

  if (locations.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      {locations.map((location, index) => (
        <location.icon key={index} className="h-4 w-4 text-gray-600" />
      ))}
    </div>
  )
}