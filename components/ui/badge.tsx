import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning"
}

type StyleVariants = {
  [K in Required<BadgeProps>["variant"]]: React.CSSProperties
}

const badgeStyles = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 6px",
    fontSize: "12px",
    fontWeight: 500,
    borderRadius: "4px",
    whiteSpace: "nowrap"
  } as React.CSSProperties,
  variants: {
    default: {
      backgroundColor: "rgb(219 234 254)",
      color: "rgb(29 78 216)"
    },
    secondary: {
      backgroundColor: "rgb(243 244 246)",
      color: "rgb(55 65 81)"
    },
    success: {
      backgroundColor: "rgb(220 252 231)",
      color: "rgb(22 101 52)"
    },
    warning: {
      backgroundColor: "rgb(254 249 195)",
      color: "rgb(161 98 7)"
    }
  } as StyleVariants
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", style, ...props }, ref) => {
    const variantStyle = badgeStyles.variants[variant]
    
    return (
      <span
        ref={ref}
        style={{
          ...badgeStyles.base,
          ...variantStyle,
          ...style
        }}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"

export { Badge }