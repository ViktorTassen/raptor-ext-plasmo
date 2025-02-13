import React from "react"

const colorMap: { [key: string]: string } = {
  Black: "#000000",
  Blue: "#0066cc",
  Gold: "#FFD700",
  Gray: "#808080",
  Green: "#008000",
  Red: "#FF0000",
  Silver: "#C0C0C0",
  White: "#FFFFFF",
  Yellow: "#FFFF00",
  Other: "linear-gradient(45deg, #FF0000, #FFFF00, #008000, #0000FF, #800080)", // Gradient for Other
}

interface ColorCircleProps {
  color: any
}

export function ColorCircle({ color }: ColorCircleProps) {
  const normalizedColor = color?.trim().toLowerCase()
  const capitalizedColor = normalizedColor ? normalizedColor.charAt(0).toUpperCase() + normalizedColor.slice(1) : ""
  const colorStyle = colorMap[capitalizedColor]

  return (
    <div className="flex items-center gap-2">
      {colorStyle ? (
        <div
          className="h-4 w-4 rounded-full border border-gray-900"
          style={{
            background: normalizedColor === "Other" ? colorStyle : undefined,
            backgroundColor: normalizedColor !== "Other" ? colorStyle : undefined,
          }}
        />
      ) : (
        <span className="text-sm text-gray-600">{capitalizedColor}</span>
      )}
    </div>
  )
}