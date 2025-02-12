import type { PlasmoMessaging } from "@plasmohq/messaging"
import { db } from "~db"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { vehicles } = req.body
  
  console.log('[Raptor] Background received vehicles:', vehicles.length)
  
  try {
    // Store vehicles in IndexedDB
    await db.vehicles.bulkPut(vehicles)
    console.log('[Raptor] Stored', vehicles.length, 'vehicles in IndexedDB')
    res.send({ success: true })
  } catch (error) {
    console.error('[Raptor] Error storing vehicles:', error)
    res.send({ success: false, error: error.message })
  }
}

export default handler