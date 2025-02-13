export function downloadCSV<T extends Record<string, any>>(data: T[], filename: string) {
    // Get all unique keys from the data
    const keys = Array.from(
      new Set(
        data.reduce<string[]>((acc, obj) => {
          return acc.concat(Object.keys(obj))
        }, [])
      )
    )
  
    // Create CSV header
    const header = keys.join(",")
  
    // Create CSV rows
    const rows = data.map(obj => {
      return keys.map(key => {
        const value = obj[key]
        // Handle nested objects and arrays
        const cellValue = typeof value === "object" && value !== null
          ? JSON.stringify(value).replace(/"/g, '""')
          : value
  
        // Escape quotes and wrap in quotes if needed
        return `"${String(cellValue).replace(/"/g, '""')}"`
      }).join(",")
    })
  
    // Combine header and rows
    const csv = [header, ...rows].join("\n")
  
    // Create blob and download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }