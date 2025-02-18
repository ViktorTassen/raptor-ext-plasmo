import type { PlasmoMessaging } from "@plasmohq/messaging"

interface VehicleParams {
  year: number
  make: string
  model: string
  trim?: string[]
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const vehicle = req.body as VehicleParams
    const params = new URLSearchParams({
      year: vehicle.year.toString(),
      make: vehicle.make,
      model: vehicle.model,
      ...(vehicle.trim && { trim: vehicle.trim.join(',') })
    })

    const response = await fetch(`http://localhost:3000/api/vehicle/market-value?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Handle non-JSON responses (like CORS errors)
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format')
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `Failed to fetch market value: ${response.status}`)
    }

    res.send({ success: true, ...data })
  } catch (error) {
    console.error('[Raptor] Error fetching market value:', error)
    res.send({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export default handler