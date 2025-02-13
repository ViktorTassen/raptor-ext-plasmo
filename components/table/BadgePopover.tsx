import React from "react"
import { Badge } from "~components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~components/ui/popover"

export interface BadgeItem {
  id: number | string
  label: string
  value?: string
}

interface BadgePopoverProps {
  badges: BadgeItem[]
  maxVisible?: number
}

export function BadgePopover({ badges = [], maxVisible = 1 }: BadgePopoverProps) {
  if (!Array.isArray(badges) || badges.length === 0) return null
  
  const visibleBadges = badges.slice(0, maxVisible)
  const remainingBadges = badges.slice(maxVisible)
  const hasMore = remainingBadges.length > 0

  return (
    <div className="inline-flex">
      <Popover>
        <div className="flex items-center">
          {visibleBadges.map((badge) => (
            <Badge 
              key={badge.id}
              variant="default"
              className="mr-1">
              {badge.label}
            </Badge>
          ))}
          {hasMore && (
            <PopoverTrigger asChild>
              <Badge 
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors">
                +{remainingBadges.length}
              </Badge>
            </PopoverTrigger>
          )}
        </div>
        {hasMore && (
          <PopoverContent className="w-auto max-w-[300px]">
            <div className="flex flex-wrap gap-1">
              {badges.map((badge) => (
                <Badge 
                  key={badge.id}
                  variant="default">
                  {badge.label}
                </Badge>
              ))}
            </div>
          </PopoverContent>
        )}
      </Popover>
    </div>
  )
}