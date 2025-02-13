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
    <div style={{ display: 'inline-flex' }}>
      <Popover>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {visibleBadges.map((badge) => (
            <Badge 
              key={badge.id}
              variant="default"
              style={{ margin: '2px' }}>
              {badge.label}
            </Badge>
          ))}
          {hasMore && (
            <PopoverTrigger>
              <Badge 
                variant="secondary"
                style={{
                  margin: '2px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}>
                +{remainingBadges.length}
              </Badge>
            </PopoverTrigger>
          )}
        </div>
        {hasMore && (
          <PopoverContent>
            <div style={{ 
              maxWidth: '300px'
            }}>
              {badges.map((badge) => (
                <Badge 
                  style={{margin: 2}}
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