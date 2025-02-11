import { cn } from "~lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "secondary" | "success" | "warning"
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800"
  }

  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded",
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}