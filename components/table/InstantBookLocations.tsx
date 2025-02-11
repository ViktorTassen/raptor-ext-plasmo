import React from "react"
import { Plane, Home, MapPin, Building2 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~components/ui/tooltip"

interface InstantBookLocationsProps {
  preferences: {
    airportLocationEnabled: boolean
    customLocationEnabled: boolean
    homeLocationEnabled: boolean
    poiLocationEnabled: boolean
  }
}

export function InstantBookLocations({ preferences }: InstantBookLocationsProps) {
  const locations = [
    {
      enabled: preferences.airportLocationEnabled,
      label: "Airport",
      icon: Plane
    },
    {
      enabled: preferences.customLocationEnabled,
      label: "Custom Location",
      icon: MapPin
    },
    {
      enabled: preferences.homeLocationEnabled,
      label: "Home Location",
      icon: Home
    },
    {
      enabled: preferences.poiLocationEnabled,
      label: "Points of Interest",
      icon: Building2
    }
  ].filter(loc => loc.enabled)

  if (locations.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        {locations.map((location, index) => (
          <Tooltip key={index}>
            <TooltipTrigger>
              <location.icon className="h-4 w-4 text-gray-600" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{location.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}