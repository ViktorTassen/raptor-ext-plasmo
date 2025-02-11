import { Badge } from "~components/ui/badge"
import type { VehicleBadge } from "~types"

export interface SimplifiedBadge {
  id: number | string
  label: string
  value?: string
}

export interface BadgeCellProps {
  badges: (VehicleBadge | SimplifiedBadge)[]
  maxVisible?: number
}

export function BadgeCell({ badges = [], maxVisible = 2 }: BadgeCellProps) {
  if (!Array.isArray(badges) || badges.length === 0) return null

  const visibleBadges = badges.slice(0, maxVisible)
  const remainingCount = Math.max(0, badges.length - maxVisible)

  return (
    <div className="flex items-center gap-1">
      {visibleBadges.map((badge) => (
        <Badge 
          key={badge.id}
          className="whitespace-nowrap">
          {badge.label}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="secondary">
          +{remainingCount}
        </Badge>
      )}
    </div>
  )
}