import { Badge } from "~components/ui/badge"
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

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {badges.map((badge) => (
        <Badge 
          key={badge.id}
          className="whitespace-nowrap">
          {badge.label}
        </Badge>
      ))}
    </div>
  )
}