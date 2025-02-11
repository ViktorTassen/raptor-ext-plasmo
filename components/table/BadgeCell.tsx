import { Badge } from "~components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "~components/ui/tooltip"
import type { VehicleBadge } from "~types"

export interface SimplifiedBadge {
  id: number | string
  label: string
  value?: string
}

export interface BadgeCellProps {
  badges: (VehicleBadge | SimplifiedBadge)[]
}

export function BadgeCell({ badges = [] }: BadgeCellProps) {
  if (!Array.isArray(badges) || badges.length === 0) return null

  const firstBadge = badges[0]
  const remainingCount = badges.length - 1

  return (
    <div className="flex items-center gap-1 relative">
      <Badge className="whitespace-nowrap">
        {firstBadge.label}
      </Badge>
      
      {remainingCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary"
                className="cursor-help hover:bg-gray-200 transition-colors">
                +{remainingCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              align="start"
              className="z-[9999] flex flex-col gap-1 p-2 max-w-[300px]">
              {badges.slice(1).map((badge) => (
                <Badge 
                  key={badge.id}
                  className="whitespace-nowrap">
                  {badge.label}
                </Badge>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}